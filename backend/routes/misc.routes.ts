import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import {
  getDailyProblem,
  getAchievements,
  getWeeklyReport,
} from "../services";

const router = Router();

// Daily problem
router.get(
  "/daily-problem",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const daily = await getDailyProblem(userId);
      res.json(daily);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get daily problem" });
    }
  },
);

// Achievements
router.get(
  "/achievements",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const data = await getAchievements(userId);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get achievements" });
    }
  },
);

// Weekly report
router.get(
  "/weekly-report",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const data = await getWeeklyReport(userId);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get weekly report" });
    }
  },
);

// Export progress (JSON or CSV)
router.get(
  "/export/progress",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const format = req.query.format || "json";

      const progress = await prisma.progress.findMany({
        where: { userId },
        include: {
          problem: { include: { topic: true } },
        },
        orderBy: [
          { problem: { topic: { orderIndex: "asc" } } },
          { problem: { orderIndex: "asc" } },
        ],
      });

      const data = progress.map((p) => ({
        topic: p.problem.topic.name,
        problem: p.problem.title,
        difficulty: p.problem.difficulty,
        status: p.status,
        timeSpent: p.timeSpent,
        completedAt: p.completedAt,
        link: p.problem.link,
        nextReviewDate: p.nextReviewDate,
      }));

      if (format === "csv") {
        const headers =
          "Topic,Problem,Difficulty,Status,Time Spent (min),Completed At,Link,Next Review\n";
        const csv = data
          .map(
            (d) =>
              `"${d.topic}","${d.problem}","${d.difficulty}","${d.status}",${d.timeSpent},"${d.completedAt || ""}","${d.link || ""}","${d.nextReviewDate || ""}"`,
          )
          .join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=dsa-progress.csv",
        );
        res.send(headers + csv);
      } else {
        res.json(data);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to export progress" });
    }
  },
);

export default router;
