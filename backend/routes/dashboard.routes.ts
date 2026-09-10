import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import { getWeakTopics, getRevisionReminders } from "../services";
import { buildNextAction } from "../services/nextActionService";
import { calculateStreakFromSolves } from "../services/analyticsCalculations";

const router = Router();

// Unified Dashboard Bootstrap Aggregator Endpoint (5.3)
router.get("/dashboard/bootstrap", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [
      user,
      totalProblems,
      solvedProgress,
      streakRecord,
      weakTopics,
      dueReviews,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          leetcodeUsername: true,
        },
      }),
      prisma.problem.count(),
      prisma.progress.findMany({
        where: { userId, status: "DONE" },
        select: {
          completedAt: true,
          updatedAt: true,
          problem: {
            select: { difficulty: true },
          },
        },
      }),
      prisma.streak.findUnique({
        where: { userId },
      }),
      getWeakTopics(userId),
      getRevisionReminders(userId),
    ]);

    const solvedCount = solvedProgress.length;
    const progressPercentage =
      totalProblems === 0 ? 0 : Math.round((solvedCount / totalProblems) * 100);

    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    for (const p of solvedProgress) {
      const diff = p.problem?.difficulty;
      if (diff === "EASY") easySolved++;
      else if (diff === "MEDIUM") mediumSolved++;
      else if (diff === "HARD") hardSolved++;
    }

    const streakStats = calculateStreakFromSolves(
      solvedProgress,
      streakRecord?.longestStreak || 0,
    );

    const longestStreak = Math.max(
      streakStats.longestStreak,
      streakRecord?.longestStreak || 0,
    );

    const nextAction = buildNextAction(weakTopics, dueReviews);

    res.json({
      user,
      stats: {
        totalProblems,
        solvedProblems: solvedCount,
        progressPercentage,
        easySolved,
        mediumSolved,
        hardSolved,
      },
      streak: {
        currentStreak: streakStats.currentStreak,
        longestStreak,
        lastActivityDate: streakRecord?.lastActivityDate || null,
      },
      dueReviews,
      weakTopics,
      nextAction,
      // Backward compatibility aliases
      totalProblems,
      solvedProblems: solvedCount,
      progressPercentage,
      currentStreak: streakStats.currentStreak,
      longestStreak,
      revisions: dueReviews,
    });
  } catch (error) {
    console.error("Dashboard bootstrap error:", error);
    res.status(500).json({ error: "Failed to bootstrap dashboard data" });
  }
});

router.get("/dashboard", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [totalProblems, solvedProblems, streak, weakTopics, revisions] =
      await Promise.all([
        prisma.problem.count(),
        prisma.progress.count({
          where: { userId, status: "DONE" },
        }),
        prisma.streak.findUnique({
          where: { userId },
        }),
        getWeakTopics(userId),
        getRevisionReminders(userId),
      ]);

    const nextAction = buildNextAction(weakTopics, revisions);

    res.json({
      totalProblems,
      solvedProblems,
      progressPercentage:
        totalProblems === 0
          ? 0
          : Math.round((solvedProblems / totalProblems) * 100),
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      weakTopics,
      revisions,
      nextAction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
