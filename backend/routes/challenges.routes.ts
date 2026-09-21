import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import { ChallengeStatus } from "@prisma/client";

const router = Router();

// 8. Challenge Modes (Interview Training)
router.post(
  "/challenges/start",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { topicId, duration } = req.body;
      const userId = req.user!.id;

      // 1. Fetch all problem IDs for the given topic
      const topicProblems = await prisma.problem.findMany({
        where: { topicId },
        select: { id: true },
      });

      if (topicProblems.length === 0) {
        return res
          .status(404)
          .json({ error: "No problems found for this topic" });
      }

      // Support optional count parameter, clamping to [1, totalProblems]
      const requestedCount = Math.max(
        1,
        parseInt(req.body.count || req.body.problemCount) || 2,
      );
      const sampleSize = Math.min(requestedCount, topicProblems.length);

      // Unbiased Fisher-Yates partial shuffle over problem IDs
      const pool = topicProblems.map((p) => p.id);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const assignedIds = pool.slice(0, sampleSize);

      const session = await prisma.challengeSession.create({
        data: {
          userId,
          problemIds: assignedIds,
          duration: parseInt(duration) || 30, // Default 30 mins
        },
      });

      res.json(session);
    } catch (_err) {
      res.status(500).json({ error: "Failed to start challenge" });
    }
  },
);

router.get(
  "/challenges/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const session = await prisma.challengeSession.findFirst({
        where: { id, userId },
      });

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const problems = await prisma.problem.findMany({
        where: { id: { in: session.problemIds } },
        include: { topic: true },
      });

      res.json({ ...session, problems });
    } catch (_err) {
      res.status(500).json({ error: "Error fetching session" });
    }
  },
);

router.post(
  "/challenges/:id/complete",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const { status } = req.body; // COMPLETED or FAILED

      if (status !== "COMPLETED" && status !== "FAILED") {
        return res.status(400).json({ error: "Invalid challenge status" });
      }

      const existingSession = await prisma.challengeSession.findFirst({
        where: { id, userId },
      });

      if (!existingSession) {
        return res.status(404).json({ error: "Session not found or unauthorized" });
      }

      const session = await prisma.challengeSession.update({
        where: { id },
        data: {
          status: status as ChallengeStatus,
          endTime: new Date(),
        },
      });
      res.json(session);
    } catch (_err) {
      res.status(500).json({ error: "Error completing session" });
    }
  },
);

export default router;
