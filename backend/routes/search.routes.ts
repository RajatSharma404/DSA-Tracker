import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import { Difficulty, Prisma, ProgressStatus } from "@prisma/client";

const router = Router();

// Global search for problems
router.get("/search", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { q, difficulty, status, topicId, bookmarked, tagId } = req.query;

    const where: Prisma.ProblemWhereInput = {};

    if (typeof q === "string" && q.trim()) {
      where.title = { contains: q.trim(), mode: "insensitive" };
    }
    if (typeof difficulty === "string" && (difficulty === "EASY" || difficulty === "MEDIUM" || difficulty === "HARD")) {
      where.difficulty = difficulty as Difficulty;
    }
    if (typeof topicId === "string" && topicId.trim()) {
      where.topicId = topicId.trim();
    }

    const andConditions: Prisma.ProblemWhereInput[] = [];

    if (typeof status === "string") {
      if (status === "TODO") {
        andConditions.push({
          OR: [
            { progress: { none: { userId } } },
            { progress: { some: { userId, status: ProgressStatus.TODO } } },
          ],
        });
      } else if (status === "DOING" || status === "DONE") {
        andConditions.push({
          progress: {
            some: {
              userId,
              status: status as ProgressStatus,
            },
          },
        });
      }
    }

    if (bookmarked === "true") {
      andConditions.push({
        bookmarks: {
          some: { userId },
        },
      });
    }

    if (typeof tagId === "string" && tagId.trim()) {
      andConditions.push({
        problemTags: {
          some: { tagId: tagId.trim() },
        },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const problems = await prisma.problem.findMany({
      where,
      include: {
        topic: true,
        progress: { where: { userId } },
        bookmarks: { where: { userId } },
        problemTags: { include: { tag: true }, where: { tag: { userId } } },
      },
      orderBy: [{ topic: { orderIndex: "asc" } }, { orderIndex: "asc" }],
    });

    const result = problems.map((p) => ({
      id: p.id,
      title: p.title,
      link: p.link,
      difficulty: p.difficulty,
      topicId: p.topicId,
      topicName: p.topic.name,
      orderIndex: p.orderIndex,
      status: p.progress[0]?.status || "TODO",
      timeSpent: p.progress[0]?.timeSpent || 0,
      nextReviewDate: p.progress[0]?.nextReviewDate,
      isBookmarked: p.bookmarks.length > 0,
      tags: p.problemTags.map((pt) => pt.tag),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
