import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Toggle bookmark
router.post(
  "/bookmarks/toggle",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { problemId } = req.body;

      const existing = await prisma.bookmark.findUnique({
        where: { userId_problemId: { userId, problemId } },
      });

      if (existing) {
        await prisma.bookmark.delete({ where: { id: existing.id } });
        res.json({ bookmarked: false });
      } else {
        await prisma.bookmark.create({ data: { userId, problemId } });
        res.json({ bookmarked: true });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to toggle bookmark" });
    }
  },
);

// Get all bookmarks
router.get("/bookmarks", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        problem: {
          include: {
            topic: true,
            progress: { where: { userId } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(bookmarks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get bookmarks" });
  }
});

// Check if a problem is bookmarked
router.get(
  "/bookmarks/check/:problemId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const problemId = req.params.problemId as string;
      const bookmark = await prisma.bookmark.findUnique({
        where: { userId_problemId: { userId, problemId } },
      });
      res.json({ bookmarked: !!bookmark });
    } catch (_err) {
      res.status(500).json({ error: "Failed to check bookmark" });
    }
  },
);

export default router;
