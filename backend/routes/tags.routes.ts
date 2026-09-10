import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Create a tag
router.post("/tags", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, color } = req.body;

    const tag = await prisma.userTag.create({
      data: { userId, name, color: color || "#6366f1" },
    });
    res.json(tag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create tag" });
  }
});

// Get all user tags
router.get("/tags", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const tags = await prisma.userTag.findMany({
      where: { userId },
      include: { problems: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get tags" });
  }
});

// Delete a tag
router.delete(
  "/tags/:tagId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const tagId = req.params.tagId as string;
      await prisma.userTag.delete({ where: { id: tagId, userId } });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete tag" });
    }
  },
);

// Tag a problem
router.post(
  "/tags/:tagId/problems",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const tagId = req.params.tagId as string;
      const problemId = req.body.problemId as string;

      const existing = await prisma.problemTag.findUnique({
        where: { problemId_tagId: { problemId, tagId } },
      });

      if (existing) {
        await prisma.problemTag.delete({ where: { id: existing.id } });
        res.json({ tagged: false });
      } else {
        await prisma.problemTag.create({ data: { problemId, tagId } });
        res.json({ tagged: true });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to tag problem" });
    }
  },
);

export default router;
