import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Global search for problems
router.get("/search", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { q, difficulty, status, topicId, bookmarked, tagId } = req.query;

    const where: any = {};

    if (q) {
      where.title = { contains: q as string, mode: "insensitive" };
    }
    if (difficulty) {
      where.difficulty = difficulty as string;
    }
    if (topicId) {
      where.topicId = topicId as string;
    }

    if (status) {
      if (status === "TODO") {
        where.progress = {
          none: { userId },
        };
      } else {
        where.progress = {
          some: {
            userId,
            status: status as any,
          },
        };
      }
    }

    if (bookmarked === "true") {
      where.bookmarks = {
        some: { userId },
      };
    }

    if (tagId) {
      where.problemTags = {
        some: { tagId: tagId as string },
      };
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
      tags: p.problemTags.map((pt: any) => pt.tag),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
