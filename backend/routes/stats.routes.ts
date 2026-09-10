import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import {
  calculateStreakFromSolves,
  generateHeatmapFromSolves,
  calculateWeakestTopic,
  calculateTopicBreakdown,
  calculateWeeklySolveVelocity,
  calculateDifficultyRamp,
} from "../services/analyticsCalculations";

const router = Router();

// Stats Feature 1: Streak Counter
router.get("/stats/streak", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const [solves, streakRecord] = await Promise.all([
      prisma.progress.findMany({
        where: { userId, status: "DONE" },
        select: { completedAt: true, updatedAt: true },
      }),
      prisma.streak.findUnique({
        where: { userId },
      }),
    ]);

    const stats = calculateStreakFromSolves(
      solves,
      streakRecord?.longestStreak || 0,
    );

    res.json(stats);
  } catch (error) {
    console.error("Streak stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Stats Feature 2: GitHub-style Activity Heatmap (Last 365 days)
router.get("/stats/heatmap", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const progress = await prisma.progress.findMany({
      where: { userId, status: "DONE" },
      select: { completedAt: true, updatedAt: true },
    });

    const heatmap = generateHeatmapFromSolves(progress, 365);
    res.json(heatmap);
  } catch (error) {
    console.error("Heatmap stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Stats Feature 3: Weak Topic Alert
router.get("/stats/weak-topic", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const topics = await prisma.topic.findMany({
      include: {
        problems: {
          select: {
            id: true,
            progress: {
              where: { userId, status: "DONE" },
              select: { id: true },
            },
          },
        },
      },
    });

    const weakest = calculateWeakestTopic(topics);
    res.json(weakest);
  } catch (error) {
    console.error("Weak topic stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Stats Feature 4: Topic Mastery Breakdown (for RadarChart)
router.get("/stats/topic-breakdown", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const topics = await prisma.topic.findMany({
      include: {
        problems: {
          select: {
            id: true,
            progress: {
              where: { userId, status: "DONE" },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    const breakdown = calculateTopicBreakdown(topics);
    res.json(breakdown);
  } catch (error) {
    console.error("Topic breakdown stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Stats Feature 5: Weekly Solve Velocity (for LineChart)
router.get("/stats/weekly", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const solves = await prisma.progress.findMany({
      where: { userId, status: "DONE" },
      select: { completedAt: true, updatedAt: true },
    });

    const weekly = calculateWeeklySolveVelocity(solves, 8);
    res.json(weekly);
  } catch (error) {
    console.error("Weekly stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Stats Feature 6: Difficulty Ramp by Month (for Stacked BarChart)
router.get("/stats/difficulty-by-month", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const solves = await prisma.progress.findMany({
      where: { userId, status: "DONE" },
      select: {
        completedAt: true,
        updatedAt: true,
        problem: { select: { difficulty: true } },
      },
    });

    const ramp = calculateDifficultyRamp(solves, 6);
    res.json(ramp);
  } catch (error) {
    console.error("Difficulty by month stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
