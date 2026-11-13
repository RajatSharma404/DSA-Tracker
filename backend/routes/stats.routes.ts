import { Router, Request, Response } from "express";
import { ActivityEventType } from "@prisma/client";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import {
  calculateStreakFromSolves,
  generateHeatmapFromSolves,
  calculateStreakFromEvents,
  generateHeatmapFromEvents,
  calculateWeeklySolveVelocityFromEvents,
  calculateWeakestTopic,
  calculateTopicBreakdown,
  calculateWeeklySolveVelocity,
  calculateDifficultyRamp,
} from "../services/analyticsCalculations";

const router = Router();

// Stats Feature 1: Streak Counter (Computed from ActivityEvent in User.timezone)
router.get("/stats/streak", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user, events, streakRecord] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { timezone: true },
      }),
      prisma.activityEvent.findMany({
        where: {
          userId,
          type: { in: [ActivityEventType.SOLVED, ActivityEventType.REVIEWED] },
        },
        select: { occurredAt: true },
      }),
      prisma.streak.findUnique({
        where: { userId },
      }),
    ]);

    let stats = calculateStreakFromEvents(
      events,
      user?.timezone || "UTC",
      streakRecord?.longestStreak || 0,
    );

    // Fallback if no activity events exist yet (e.g. legacy/mock tests)
    if (events.length === 0) {
      const solves = await prisma.progress.findMany({
        where: { userId, status: "DONE" },
        take: 10000,
        select: { completedAt: true, updatedAt: true },
      });
      if (solves.length > 0) {
        stats = calculateStreakFromSolves(
          solves,
          streakRecord?.longestStreak || 0,
        );
      }
    }

    res.json(stats);
  } catch (error) {
    console.error("Streak stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Stats Feature 2: GitHub-style Activity Heatmap (Last 365 days, from ActivityEvent in User.timezone)
router.get("/stats/heatmap", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user, events] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { timezone: true },
      }),
      prisma.activityEvent.findMany({
        where: {
          userId,
          type: { in: [ActivityEventType.SOLVED, ActivityEventType.REVIEWED] },
        },
        select: { occurredAt: true },
      }),
    ]);

    let heatmap = generateHeatmapFromEvents(
      events,
      user?.timezone || "UTC",
      365,
    );

    // Fallback if no activity events exist yet (e.g. legacy/mock tests)
    if (events.length === 0) {
      const progress = await prisma.progress.findMany({
        where: { userId, status: "DONE" },
        take: 10000,
        select: { completedAt: true, updatedAt: true },
      });
      if (progress.length > 0) {
        heatmap = generateHeatmapFromSolves(progress, 365);
      }
    }

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
      take: 200,
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
      take: 200,
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

// Stats Feature 5: Weekly Solve Velocity (from ActivityEvent in User.timezone)
router.get("/stats/weekly", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user, events] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { timezone: true },
      }),
      prisma.activityEvent.findMany({
        where: {
          userId,
          type: ActivityEventType.SOLVED,
        },
        select: { occurredAt: true },
      }),
    ]);

    let weekly = calculateWeeklySolveVelocityFromEvents(
      events,
      user?.timezone || "UTC",
      8,
    );

    // Fallback if no activity events exist yet (e.g. legacy/mock tests)
    if (events.length === 0) {
      const solves = await prisma.progress.findMany({
        where: { userId, status: "DONE" },
        take: 10000,
        select: { completedAt: true, updatedAt: true },
      });
      if (solves.length > 0) {
        weekly = calculateWeeklySolveVelocity(solves, 8);
      }
    }

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
      take: 10000,
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
