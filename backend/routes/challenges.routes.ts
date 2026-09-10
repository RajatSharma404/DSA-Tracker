import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// 8. Challenge Modes (Interview Training)
router.post(
  "/challenges/start",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { topicId, duration } = req.body;
      const userId = req.user!.id;

      // Pick random problems from topic
      const problems = await prisma.problem.findMany({
        where: { topicId },
        take: 2, // Assign 2 problems
      });

      if (problems.length === 0) {
        return res
          .status(404)
          .json({ error: "No problems found for this topic" });
      }

      // Shuffle and pick
      const shuffled = problems.sort(() => 0.5 - Math.random());
      const assignedIds = shuffled.slice(0, 2).map((p) => p.id);

      const session = await (prisma as any).challengeSession.create({
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
      const session = (await (prisma as any).challengeSession.findUnique({
        where: { id: req.params.id },
      })) as any;

      if (!session) return res.status(404).json({ error: "Session not found" });

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
      const { status } = req.body; // COMPLETED or FAILED
      const session = await (prisma as any).challengeSession.update({
        where: { id: req.params.id },
        data: {
          status: status as any,
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
