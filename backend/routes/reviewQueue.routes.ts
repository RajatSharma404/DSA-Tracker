import { Router, Request, Response } from "express";
import { z } from "zod";
import { ActivityEventType } from "@prisma/client";
import { scheduleUnscheduledSolves } from "../services/reviewScheduling";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { getNextRevisionInterval } from "../services/nextActionService";
import {
  schedule,
  mapGradeToRating,
  fromFsrsState,
  FsrsCardInput,
} from "../services/scheduler";
import { invalidateWeakTopicsCache } from "../services";

const router = Router();

const completeReviewSchema = {
  body: z.object({
    problemId: z.string().trim().min(1, "Invalid or missing problemId"),
    quality: z.coerce
      .number()
      .min(0, "Quality must be between 0 and 5")
      .max(5, "Quality must be between 0 and 5")
      .optional(),
    rating: z
      .union([
        z.coerce.number().min(1).max(5),
        z.enum(["AGAIN", "HARD", "GOOD", "EASY"]),
      ])
      .optional(),
    clientEventId: z.string().uuid().optional(),
    reviewedAt: z.string().datetime().optional(),
  }),
};

// Get review queue (problems due for review)
router.get(
  "/review-queue",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      await scheduleUnscheduledSolves(userId);
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

// Complete a review (FSRS / SM-2 spaced repetition with offline replay idempotency)
router.post(
  "/review-queue/complete",
  requireAuth,
  validate(completeReviewSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { problemId, quality, rating: rawRating, clientEventId, reviewedAt } = req.body;

      // Deduplication: if clientEventId was already processed for this user, return 200 idempotently
      if (clientEventId) {
        const existingLog = await prisma.reviewLog.findUnique({
          where: {
            userId_clientEventId: { userId, clientEventId },
          },
        });
        if (existingLog) {
          return res.status(200).json({
            deduplicated: true,
            reviewLogId: existingLog.id,
            problemId: existingLog.problemId,
            rating: existingLog.rating,
            scheduledDays: existingLog.scheduledDays,
            reviewedAt: existingLog.reviewedAt,
          });
        }
      }

      const progress = await prisma.progress.findUnique({
        where: { userId_problemId: { userId, problemId } },
      });

      if (!progress)
        return res.status(404).json({ error: "Progress not found" });

      // Determine target rating (1-4 FSRS)
      let targetRating: number;
      if (rawRating !== undefined) {
        targetRating = mapGradeToRating(rawRating);
      } else if (quality !== undefined) {
        targetRating = mapGradeToRating(quality);
      } else {
        targetRating = 3; // Default to Good
      }

      // Bounds validation for reviewedAt (5 min future skew tolerance, 7 day max age)
      const now = new Date();
      let reviewTime = now;
      if (reviewedAt) {
        const parsedTime = new Date(reviewedAt);
        if (!isNaN(parsedTime.getTime())) {
          const diffMs = parsedTime.getTime() - now.getTime();
          const maxFutureSkewMs = 5 * 60 * 1000;
          const maxPastAgeMs = 7 * 24 * 60 * 60 * 1000;
          if (diffMs <= maxFutureSkewMs && diffMs >= -maxPastAgeMs) {
            reviewTime = parsedTime;
          }
        }
      }

      // Compute FSRS scheduling pure calculation
      const cardInput: FsrsCardInput = {
        due: progress.nextReviewDate || undefined,
        stability: progress.stability,
        difficulty: progress.difficultyFsrs,
        scheduled_days: progress.interval,
        reps: progress.repetitions,
        lapses: progress.lapses,
        state: progress.state,
        last_review: progress.lastReviewedAt || progress.completedAt || undefined,
      };

      const scheduledItem = schedule(cardInput, targetRating, reviewTime);
      const nextReviewDate = scheduledItem.card.due;
      const scheduledDays = scheduledItem.log?.scheduled_days ?? scheduledItem.card.scheduled_days ?? 1;

      // Legacy SM-2 interval fallback calculation for backward compatibility
      let legacyInterval = progress.interval;
      let legacyEasiness = progress.easinessFactor;
      const q = quality !== undefined ? Math.min(5, Math.max(0, quality)) : targetRating === 1 ? 1 : targetRating === 2 ? 3 : targetRating === 3 ? 4 : 5;
      if (q >= 3) {
        legacyInterval = getNextRevisionInterval(legacyInterval);
      } else {
        legacyInterval = 2;
      }
      legacyEasiness = legacyEasiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      if (legacyEasiness < 1.3) legacyEasiness = 1.3;

      const finalInterval = scheduledDays > 0 ? scheduledDays : legacyInterval;

      // Atomic Transaction: Progress update + ReviewLog + ActivityEvent
      const [updatedProgress, reviewLog] = await prisma.$transaction([
        prisma.progress.update({
          where: { userId_problemId: { userId, problemId } },
          data: {
            interval: finalInterval,
            easinessFactor: legacyEasiness,
            nextReviewDate,
            lastReviewedAt: reviewTime,
            repetitions: scheduledItem.card.reps,
            lapses: scheduledItem.card.lapses,
            stability: scheduledItem.card.stability,
            difficultyFsrs: scheduledItem.card.difficulty,
            state: fromFsrsState(scheduledItem.card.state),
          },
        }),
        prisma.reviewLog.create({
          data: {
            userId,
            problemId,
            clientEventId: clientEventId || null,
            rating: targetRating,
            reviewedAt: reviewTime,
            elapsedDays: progress.lastReviewedAt
              ? Math.max(0, Math.floor((reviewTime.getTime() - progress.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24)))
              : 0,
            scheduledDays: finalInterval,
            stabilityBefore: progress.stability,
            stabilityAfter: scheduledItem.card.stability,
            difficultyBefore: progress.difficultyFsrs,
            difficultyAfter: scheduledItem.card.difficulty,
            stateBefore: progress.state,
          },
        }),
        prisma.activityEvent.create({
          data: {
            userId,
            problemId,
            type: ActivityEventType.REVIEWED,
            occurredAt: reviewTime,
            metadata: {
              rating: targetRating,
              scheduledDays: finalInterval,
              clientEventId: clientEventId || null,
            },
          },
        }),
      ]);

      invalidateWeakTopicsCache(userId);

      res.json({
        ...updatedProgress,
        reviewLogId: reviewLog.id,
        nextReviewIn: `${finalInterval} day${finalInterval !== 1 ? "s" : ""}`,
      });
    } catch (err) {
      console.error("Complete review error:", err);
      res.status(500).json({ error: "Failed to complete review" });
    }
  },
);

export default router;
