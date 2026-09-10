import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import {
  fetchSessionUsername,
  fetchAllSolvedProblems,
  fetchLeetCodeSolvedProblems,
  fetchProblemSubmissions,
} from "../leetcodeService";
import {
  encryptSecret,
  decryptSecret,
  hashSecret,
  maskSecret,
} from "../utils/encryption";

const router = Router();

// 6. Update LeetCode Username
router.patch(
  "/user/leetcode",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { leetcodeUsername } = req.body;
      const userId = req.user!.id;
      const normalizedUsername =
        typeof leetcodeUsername === "string"
          ? leetcodeUsername.trim().toLowerCase()
          : "";
      if (!/^[a-z0-9_-]{1,30}$/i.test(normalizedUsername)) {
        return res.status(400).json({ error: "Invalid LeetCode username" });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { leetcodeUsername: normalizedUsername } as any,
      });

      res.json({ success: true, leetcodeUsername: normalizedUsername });
    } catch (_error) {
      res.status(500).json({ error: "Failed to update username" });
    }
  },
);

// 7. Sync LeetCode Data
router.post(
  "/user/sync-leetcode",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = (await prisma.user.findUnique({
        where: { id: userId },
      })) as any;

      if (!user?.leetcodeUsername) {
        return res.status(400).json({ error: "LeetCode username not set" });
      }

      const solvedMap = new Map<string, any>();
      let syncSource: "session" | "username" = "username";
      let sessionUsername: string | null = null;
      let sessionMismatchWarning: string | null = null;

      if (user.leetcodeSession) {
        const decryptedSession = decryptSecret(user.leetcodeSession);
        sessionUsername = await fetchSessionUsername(decryptedSession);
        const normalizedSessionUser = sessionUsername?.trim().toLowerCase();
        const normalizedConfiguredUser = user.leetcodeUsername
          .trim()
          .toLowerCase();

        if (
          normalizedSessionUser &&
          normalizedSessionUser === normalizedConfiguredUser
        ) {
          syncSource = "session";
          const allSolved = await fetchAllSolvedProblems(decryptedSession);
          for (const q of allSolved) {
            solvedMap.set(q.titleSlug, {
              title: q.title,
              titleSlug: q.titleSlug,
              difficulty: q.difficulty,
              timestamp: 0,
            });
          }
          console.log(
            `Syncing LeetCode for ${user.leetcodeUsername}: Found ${solvedMap.size} unique accepted problems (full history via matching session).`,
          );
        } else {
          sessionMismatchWarning = sessionUsername
            ? `Session belongs to '${sessionUsername}', but configured username is '${user.leetcodeUsername}'. Falling back to username sync.`
            : "LeetCode session could not be validated. Falling back to username sync.";
          console.warn(sessionMismatchWarning);
        }
      }

      if (solvedMap.size === 0) {
        const data = await fetchLeetCodeSolvedProblems(user.leetcodeUsername);
        const recentSubmissions = data.recentSubmissionList || [];
        recentSubmissions.forEach((sub: any) => {
          if (
            sub.statusDisplay === "Accepted" &&
            (!solvedMap.has(sub.titleSlug) ||
              sub.timestamp > solvedMap.get(sub.titleSlug).timestamp)
          ) {
            solvedMap.set(sub.titleSlug, sub);
          }
        });
        console.log(
          `Syncing LeetCode for ${user.leetcodeUsername}: Found ${solvedMap.size} unique accepted problems via username (recent submissions).`,
        );
      }

      const results = [];
      for (const [slug, sub] of solvedMap.entries()) {
        const problem = await prisma.problem.findFirst({
          where: {
            OR: [
              { title: { equals: sub.title, mode: "insensitive" } },
              { link: { contains: slug } },
            ],
          },
        });

        let existingProgress: any = null;
        if (problem) {
          existingProgress = await prisma.progress.findUnique({
            where: {
              userId_problemId: {
                userId,
                problemId: problem.id,
              },
            },
            select: {
              completedAt: true,
              status: true,
            },
          });
        }

        let runtimeOpt = null;
        let memoryOpt = null;
        let timestampOpt: number | null =
          typeof sub.timestamp === "number" && sub.timestamp > 0
            ? sub.timestamp
            : null;

        if (
          syncSource === "session" &&
          user.leetcodeSession &&
          existingProgress?.status !== "DONE"
        ) {
          try {
            const subs = await fetchProblemSubmissions(
              slug,
              decryptSecret(user.leetcodeSession),
            );
            const acceptedSubs =
              subs?.questionSubmissionList?.submissions?.filter(
                (s: any) => s.statusDisplay === "Accepted",
              ) || [];
            const theSub = acceptedSubs[0];
            if (theSub) {
              runtimeOpt = theSub.runtime;
              memoryOpt = theSub.memory;
            }

            const acceptedTimestamps = acceptedSubs
              .map((s: any) => Number(s?.timestamp))
              .filter((t: number) => Number.isFinite(t) && t > 0);

            if (acceptedTimestamps.length > 0) {
              timestampOpt = Math.min(...acceptedTimestamps);
            }
          } catch (_e) {
            // Silent fallback, could be invalid session or quota limits
          }
        }

        if (problem) {
          const completedAt = timestampOpt
            ? new Date(timestampOpt * 1000)
            : existingProgress?.completedAt || new Date();

          await prisma.progress.upsert({
            where: { userId_problemId: { userId, problemId: problem.id } },
            update: {
              status: "DONE",
              completedAt,
              ...(runtimeOpt && { leetcodeRuntime: runtimeOpt }),
              ...(memoryOpt && { leetcodeMemory: memoryOpt }),
            },
            create: {
              userId,
              problemId: problem.id,
              status: "DONE",
              completedAt,
              leetcodeRuntime: runtimeOpt,
              leetcodeMemory: memoryOpt,
            },
          });
          results.push(problem.title);
        } else {
          console.log(
            `LeetCode problem not found in roadmap: ${sub.title} (${slug}). Injecting as Extra Practice.`,
          );

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

          const newProblem = await prisma.problem.create({
            data: {
              title: sub.title,
              link: `https://leetcode.com/problems/${slug}/`,
              difficulty: "MEDIUM",
              topicId: miscTopic.id,
              orderIndex: (maxOrderProblem?.orderIndex || 0) + 1,
            },
          });

          await prisma.progress.create({
            data: {
              userId,
              problemId: newProblem.id,
              status: "DONE",
              completedAt: timestampOpt
                ? new Date(timestampOpt * 1000)
                : new Date(),
              leetcodeRuntime: runtimeOpt,
              leetcodeMemory: memoryOpt,
            },
          });

          results.push(newProblem.title);
        }
      }

      console.log(`Sync complete. Matched ${results.length} problems.`);

      res.json({
        success: true,
        syncSource,
        configuredUsername: user.leetcodeUsername,
        sessionUsername,
        warning: sessionMismatchWarning,
        syncedCount: results.length,
        syncedProblems: results,
      });
    } catch (error) {
      console.error("Sync Error:", error);
      res.status(500).json({ error: "Failed to sync with LeetCode" });
    }
  },
);

// Update LeetCode Session Cookie
router.patch(
  "/user/leetcode-session",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { leetcodeSession } = req.body;
      const userId = req.user!.id;
      const rawSessionInput =
        typeof leetcodeSession === "string" ? leetcodeSession.trim() : "";
      const fromNamedCookie = rawSessionInput.match(
        /(?:^|[;\s])LEETCODE_SESSION=([^;\s]+)/i,
      )?.[1];
      const normalizedSession = (fromNamedCookie || rawSessionInput)
        .trim()
        .replace(/^"|"$/g, "");

      if (normalizedSession.startsWith("••••")) {
        return res.json({ success: true, message: "Unchanged" });
      }

      const encrypted = normalizedSession ? encryptSecret(normalizedSession) : null;
      const sessionHash = normalizedSession ? hashSecret(normalizedSession) : null;

      await prisma.user.update({
        where: { id: userId },
        data: {
          leetcodeSession: encrypted,
          leetcodeSessionHash: sessionHash,
        } as any,
      });

      res.json({ success: true });
    } catch (_error) {
      res.status(500).json({ error: "Failed to update leetcode session" });
    }
  },
);

// Get Solution History
router.get(
  "/user/solution-history",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const history = await prisma.solutionHistory.findMany({
        where: { userId },
        include: {
          problem: {
            select: {
              title: true,
              topic: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(history);
    } catch (error) {
      console.error("Get Solution History Error:", error);
      res.status(500).json({ error: "Failed to load solution history" });
    }
  },
);

// Get User Settings
router.get(
  "/user/settings",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = (await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          leetcodeUsername: true,
          leetcodeSession: true,
        },
      })) as any;

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const decrypted = user.leetcodeSession ? decryptSecret(user.leetcodeSession) : "";
      const isConfigured = Boolean(decrypted);

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        leetcodeUsername: user.leetcodeUsername || "",
        leetcodeSession: isConfigured ? maskSecret(decrypted) : "",
        hasLeetcodeSession: isConfigured,
      });
    } catch (error) {
      console.error("Get Settings Error:", error);
      res.status(500).json({ error: "Failed to load settings" });
    }
  },
);

// Update LeetCode Session via Settings
router.put(
  "/user/settings/leetcode",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { leetcodeSession } = req.body;

      if (!leetcodeSession || typeof leetcodeSession !== "string") {
        return res
          .status(400)
          .json({ error: "Invalid LeetCode session cookie" });
      }

      const rawSessionInput = leetcodeSession.trim();
      const fromNamedCookie = rawSessionInput.match(
        /(?:^|[;\s])LEETCODE_SESSION=([^;\s]+)/i,
      )?.[1];
      const normalizedSession = (fromNamedCookie || rawSessionInput)
        .trim()
        .replace(/^"|"$/g, "");

      if (normalizedSession.startsWith("••••")) {
        return res.json({
          success: true,
          message: "LeetCode session unchanged",
        });
      }

      const encrypted = normalizedSession ? encryptSecret(normalizedSession) : null;
      const sessionHash = normalizedSession ? hashSecret(normalizedSession) : null;

      await prisma.user.update({
        where: { id: userId },
        data: {
          leetcodeSession: encrypted,
          leetcodeSessionHash: sessionHash,
        } as any,
      });

      res.json({
        success: true,
        message: "LeetCode session updated successfully",
      });
    } catch (error) {
      console.error("Update LeetCode Session Error:", error);
      res.status(500).json({ error: "Failed to update LeetCode session" });
    }
  },
);

export default router;
