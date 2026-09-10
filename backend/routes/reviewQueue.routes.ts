import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import { getNextRevisionInterval } from "../services/nextActionService";

const router = Router();

// Get review queue (problems due for review)
router.get(
  "/review-queue",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const now = new Date();

      const dueReviews = await prisma.progress.findMany({
        where: {
          userId,
          status: "DONE",
          nextReviewDate: { lte: now },
        },
        include: {
          problem: { include: { topic: true } },
        },
        orderBy: { nextReviewDate: "asc" },
      });

      const upcoming = await prisma.progress.findMany({
        where: {
          userId,
          status: "DONE",
          nextReviewDate: { gt: now },
        },
        include: {
          problem: { include: { topic: true } },
        },
        orderBy: { nextReviewDate: "asc" },
        take: 20,
      });

      res.json({
        due: dueReviews.map((r) => ({
          progressId: r.id,
          problemId: r.problemId,
          title: r.problem.title,
          difficulty: r.problem.difficulty,
          topicName: r.problem.topic.name,
          link: r.problem.link,
          nextReviewDate: r.nextReviewDate,
          interval: r.interval,
          easinessFactor: r.easinessFactor,
          daysOverdue: Math.floor(
            (now.getTime() - (r.nextReviewDate?.getTime() || 0)) /
              (1000 * 60 * 60 * 24),
          ),
        })),
        upcoming: upcoming.map((r) => ({
          progressId: r.id,
          problemId: r.problemId,
          title: r.problem.title,
          difficulty: r.problem.difficulty,
          topicName: r.problem.topic.name,
          link: r.problem.link,
          nextReviewDate: r.nextReviewDate,
          interval: r.interval,
        })),
        stats: {
          totalDue: dueReviews.length,
          totalUpcoming: upcoming.length,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get review queue" });
    }
  },
);

// Complete a review (SM-2 spaced repetition algorithm)
router.post(
  "/review-queue/complete",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { problemId, quality } = req.body;

      const progress = await prisma.progress.findUnique({
        where: { userId_problemId: { userId, problemId } },
      });

      if (!progress)
        return res.status(404).json({ error: "Progress not found" });

      let { easinessFactor, interval } = progress;
      const q = Math.min(5, Math.max(0, quality));

      if (q >= 3) {
        interval = getNextRevisionInterval(interval);
      } else {
        interval = 2;
      }

      easinessFactor =
        easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      if (easinessFactor < 1.3) easinessFactor = 1.3;

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);

      const updated = await prisma.progress.update({
        where: { userId_problemId: { userId, problemId } },
        data: { easinessFactor, interval, nextReviewDate },
      });

      res.json({
        ...updated,
        nextReviewIn: `${interval} day${interval !== 1 ? "s" : ""}`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to complete review" });
    }
  },
);

export default router;
