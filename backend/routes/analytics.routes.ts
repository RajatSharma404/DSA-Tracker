import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import {
  getMasteryStats,
  getTimeAnalytics,
  getInterviewReadinessIndex,
} from "../services";

const router = Router();

router.get(
  "/analytics/activity",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const progress = await prisma.progress.findMany({
        where: { userId, status: "DONE" },
        select: { completedAt: true },
      });

      const activity: Record<string, number> = {};
      progress.forEach((p) => {
        if (p.completedAt) {
          const completedAt = new Date(p.completedAt);
          if (Number.isNaN(completedAt.getTime())) {
            return;
          }

          if (completedAt.getFullYear() < 2000) {
            return;
          }

          const yyyy = completedAt.getFullYear();
          const mm = String(completedAt.getMonth() + 1).padStart(2, "0");
          const dd = String(completedAt.getDate()).padStart(2, "0");
          const date = `${yyyy}-${mm}-${dd}`;
          activity[date] = (activity[date] || 0) + 1;
        }
      });

      const formattedActivity = Object.entries(activity).map(
        ([date, count]) => ({
          date,
          count,
        }),
      );

      res.json(formattedActivity);
    } catch (_err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get(
  "/analytics/mastery",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const stats = await getMasteryStats(req.user!.id);
      res.json(stats);
    } catch (_err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get(
  "/analytics/time",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const analytics = await getTimeAnalytics(userId);
      res.json(analytics);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get time analytics" });
    }
  },
);

router.get(
  "/analytics/readiness",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const readiness = await getInterviewReadinessIndex(req.user!.id);
      res.json(readiness);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get interview readiness" });
    }
  },
);

router.get(
  "/analytics/productivity",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const solutions = await prisma.solutionHistory.findMany({
        where: { userId },
        select: { createdAt: true, score: true, isCorrect: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      });

      // Group by hour of day
      const hourlyData: Record<
        number,
        { count: number; totalScore: number; correct: number }
      > = {};
      for (let h = 0; h < 24; h++) {
        hourlyData[h] = { count: 0, totalScore: 0, correct: 0 };
      }

      solutions.forEach((s) => {
        const hour = new Date(s.createdAt).getHours();
        hourlyData[hour].count++;
        hourlyData[hour].totalScore += s.score;
        if (s.isCorrect) hourlyData[hour].correct++;
      });

      const productivity = Object.entries(hourlyData).map(([hour, data]) => ({
        hour: parseInt(hour),
        submissions: data.count,
        avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
        successRate:
          data.count > 0 ? Math.round((data.correct / data.count) * 100) : 0,
      }));

      const solvedByDifficulty = await prisma.progress.findMany({
        where: { userId, status: "DONE" },
        include: { problem: true },
      });

      const diffDist = { EASY: 0, MEDIUM: 0, HARD: 0 };
      solvedByDifficulty.forEach((p) => {
        diffDist[p.problem.difficulty as keyof typeof diffDist]++;
      });

      // Score trend over time
      const recentSolutions = await prisma.solutionHistory.findMany({
        where: { userId },
        select: { createdAt: true, score: true, isCorrect: true },
        orderBy: { createdAt: "asc" },
        take: 50,
      });

      const scoreTrend = recentSolutions.map((s, idx) => ({
        index: idx + 1,
        score: s.score,
        date: s.createdAt,
      }));

      res.json({
        productivity,
        difficultyDistribution: diffDist,
        scoreTrend,
        totalSubmissions: solutions.length,
        avgScore:
          solutions.length > 0
            ? Math.round(
                solutions.reduce((a, b) => a + b.score, 0) / solutions.length,
              )
            : 0,
        successRate:
          solutions.length > 0
            ? Math.round(
                (solutions.filter((s) => s.isCorrect).length /
                  solutions.length) *
                  100,
              )
            : 0,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get productivity analytics" });
    }
  },
);

export default router;
