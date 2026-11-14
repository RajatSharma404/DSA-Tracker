import { Router, Request, Response } from "express";
import { z } from "zod";
import { scheduleSolve } from "../services/reviewScheduling";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  isNonEmptyString,
  isProgressStatus,
} from "../services/nextActionService";
import { getUserCityProgressInfo } from "../services/cityProgressService";

const router = Router();

const updateProgressSchema = {
  body: z.object({
    problemId: z.string().trim().min(1, "Invalid problemId"),
    status: z.enum(["TODO", "DOING", "DONE"], {
      errorMap: () => ({ message: "Invalid status" }),
    }),
    timeSpent: z.coerce.number().min(0, "Invalid timeSpent").max(24 * 60, "Invalid timeSpent").default(0),
  }),
};

// 4. Update Problem Progress
router.post(
  "/progress",
  requireAuth,
  validate(updateProgressSchema),
  async (req: Request, res: Response) => {
  try {
    const { problemId, status, timeSpent } = req.body;
    const userId = req.user!.id;
    const normalizedProblemId =
      typeof problemId === "string" ? problemId.trim() : "";
    const normalizedTimeSpent = Number(timeSpent);

    if (!isNonEmptyString(normalizedProblemId)) {
      return res.status(400).json({ error: "Invalid problemId" });
    }
    if (!isProgressStatus(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    if (
      !Number.isFinite(normalizedTimeSpent) ||
      normalizedTimeSpent < 0 ||
      normalizedTimeSpent > 24 * 60
    ) {
      return res.status(400).json({ error: "Invalid timeSpent" });
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId: normalizedProblemId,
        },
      },
      update: {
        status,
        timeSpent: Math.round(normalizedTimeSpent),
        completedAt: status === "DONE" ? new Date() : null,
      },
      create: {
        userId,
        problemId: normalizedProblemId,
        status,
        timeSpent: Math.round(normalizedTimeSpent),
        completedAt: status === "DONE" ? new Date() : null,
      },
    });

    // Spaced Repetition logic (SM-2 simplified)
    if (status === "DONE") {
      const existing = (await prisma.progress.findUnique({
        where: { userId_problemId: { userId, problemId: normalizedProblemId } },
      })) as any;

      await prisma.progress.update({
        where: {
          userId_problemId: { userId, problemId: normalizedProblemId },
        },
        data: scheduleSolve(existing, new Date()),
      });

      const streak = await prisma.streak.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: new Date(0),
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastActivity = new Date(streak.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Increment streak
        await prisma.streak.update({
          where: { userId },
          data: {
            currentStreak: { increment: 1 },
            longestStreak: Math.max(
              streak.longestStreak,
              streak.currentStreak + 1,
            ),
            lastActivityDate: new Date(),
          },
        });
      } else if (diffDays > 1) {
        // Reset streak
        await prisma.streak.update({
          where: { userId },
          data: {
            currentStreak: 1,
            lastActivityDate: new Date(),
          },
        });
      }
    }

    const cityInfo = await getUserCityProgressInfo(userId);
    const problemRecord = await prisma.problem.findUnique({
      where: { id: normalizedProblemId },
      select: { topicId: true },
    });
    const levelIndex = problemRecord
      ? cityInfo.levels.findIndex((l) => l.id === problemRecord.topicId)
      : -1;
    const isLevelCompleted =
      levelIndex !== -1 ? cityInfo.levels[levelIndex].isCompleted : false;

    res.json({
      ...progress,
      levelCleared: isLevelCompleted,
      newFloorCount: cityInfo.floors,
      currentUnlockedLevel: cityInfo.currentUnlockedLevelId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
