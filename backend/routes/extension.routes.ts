import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { fetchProblemSubmissions } from "../leetcodeService";
import { isDifficulty } from "../services/nextActionService";
import { hashSecret, encryptSecret } from "../utils/encryption";
import { extensionSyncLimiter } from "../middlewares/rateLimiter";

const router = Router();

// Extension direct sync (bypass normal requireAuth by using leetcodeSession)
router.post(
  "/extension/sync",
  extensionSyncLimiter,
  async (req: Request, res: Response) => {
  try {
    const { problemSlug, leetcodeSession } = req.body;
    const normalizedSlug =
      typeof problemSlug === "string" ? problemSlug.trim().toLowerCase() : "";
    const normalizedSession =
      typeof leetcodeSession === "string" ? leetcodeSession.trim() : "";
    if (
      !normalizedSlug ||
      !/^[a-z0-9-]+$/.test(normalizedSlug) ||
      !normalizedSession ||
      normalizedSession.length < 20
    ) {
      return res.status(400).json({ error: "Missing problemSlug or session" });
    }

    const sessionHash = hashSecret(normalizedSession);

    const user = (await prisma.user.findFirst({
      where: {
        OR: [
          { leetcodeSessionHash: sessionHash },
          { leetcodeSession: normalizedSession },
        ],
      } as any,
    })) as any;

    if (user && !user.leetcodeSessionHash) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          leetcodeSession: encryptSecret(normalizedSession),
          leetcodeSessionHash: sessionHash,
        } as any,
      });
    }

    if (!user) {
      return res
        .status(401)
        .json({ error: "No user linked to this LeetCode session" });
    }

    const data = await fetchProblemSubmissions(
      normalizedSlug,
      normalizedSession,
    );
    const submissions = data?.questionSubmissionList?.submissions || [];
    const acceptedSub = submissions.find(
      (s: any) => s.statusDisplay === "Accepted",
    );

    if (!acceptedSub) {
      return res.status(400).json({ error: "No accepted submission found" });
    }

    let problem = await prisma.problem.findFirst({
      where: { link: { contains: problemSlug } },
    });

    if (!problem) {
      let miscTopic = await prisma.topic.findFirst({
        where: { name: "Extra Practice (Auto-Synced)" },
      });

      if (!miscTopic) {
        const maxOrderTopic = await prisma.topic.findFirst({
          orderBy: { orderIndex: "desc" },
        });
        miscTopic = await prisma.topic.create({
          data: {
            name: "Extra Practice (Auto-Synced)",
            description:
              "Problems solved on LeetCode that are not part of the standard curriculum.",
            orderIndex: (maxOrderTopic?.orderIndex || 99) + 1,
          },
        });
      }

      const maxOrderProblem = await prisma.problem.findFirst({
        where: { topicId: miscTopic.id },
        orderBy: { orderIndex: "desc" },
      });

      problem = await prisma.problem.create({
        data: {
          title: acceptedSub.title,
          link: `https://leetcode.com/problems/${normalizedSlug}/`,
          difficulty: isDifficulty(acceptedSub.difficulty)
            ? acceptedSub.difficulty
            : "MEDIUM",
          topicId: miscTopic.id,
          orderIndex: (maxOrderProblem?.orderIndex || 0) + 1,
        },
      });
    }

    await prisma.progress.upsert({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: problem.id,
        },
      },
      update: {
        status: "DONE",
        completedAt: new Date(acceptedSub.timestamp * 1000),
        leetcodeRuntime: acceptedSub.runtime,
        leetcodeMemory: acceptedSub.memory,
      } as any,
      create: {
        userId: user.id,
        problemId: problem.id,
        status: "DONE",
        timeSpent: 0,
        completedAt: new Date(acceptedSub.timestamp * 1000),
        leetcodeRuntime: acceptedSub.runtime,
        leetcodeMemory: acceptedSub.memory,
      } as any,
    });

    res.json({
      success: true,
      message: `Synced ${problem.title} from extension!`,
    });
  } catch (err) {
    console.error("Extension Sync Error:", err);
    res.status(500).json({ error: "Extension sync failed" });
  }
});

export default router;
