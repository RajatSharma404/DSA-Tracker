import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Get notes for a specific problem
router.get(
  "/notes/:problemId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
      const notes = await prisma.problemNote.findMany({
        where: { userId, problemId: req.params.problemId as string },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
      res.json(notes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  },
);

// Get ALL notes for the user (for the vault page)
router.get("/notes", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const notes = await prisma.problemNote.findMany({
      where: { userId },
      take: limit,
      include: {
        problem: { select: { title: true, topic: { select: { name: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Create a note
router.post("/notes", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { problemId, content, type } = req.body;

    if (!problemId || typeof problemId !== "string" || problemId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid problemId" });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Note content cannot be empty" });
    }

    if (content.length > 10000) {
      return res.status(400).json({ error: "Note content exceeds maximum 10,000 characters" });
    }

    const allowedTypes = new Set(["GOTCHA", "LEARNING", "TIP"]);
    const noteType = allowedTypes.has(type) ? type : "LEARNING";

    const note = await prisma.problemNote.create({
      data: {
        userId,
        problemId: problemId.trim(),
        content: content.trim(),
        type: noteType,
      },
    });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// Update a note
router.put(
  "/notes/:noteId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { content, type } = req.body;

      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "Note content cannot be empty" });
      }

      if (content.length > 10000) {
        return res.status(400).json({ error: "Note content exceeds maximum 10,000 characters" });
      }

      const allowedTypes = new Set(["GOTCHA", "LEARNING", "TIP"]);
      const noteType = allowedTypes.has(type) ? type : "LEARNING";

      const note = await prisma.problemNote.updateMany({
        where: { id: req.params.noteId as string, userId },
        data: { content: content.trim(), type: noteType },
      });
      res.json(note);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update note" });
    }
  },
);

// Delete a note
router.delete(
  "/notes/:noteId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      await prisma.problemNote.deleteMany({
        where: { id: req.params.noteId as string, userId },
      });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete note" });
    }
  },
);

export default router;
