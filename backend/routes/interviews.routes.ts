import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/interviews", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);

    const interviews = await prisma.mockInterview.findMany({
      where: { userId },
      take: limit,
      orderBy: { date: "desc" },
    });

    res.json(interviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/interviews",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { date, score, feedback } = req.body;
      const userId = req.user!.id;

      const newInterview = await prisma.mockInterview.create({
        data: {
          userId,
          date: new Date(date),
          score: parseInt(score),
          feedback,
        },
      });

      res.json(newInterview);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

export default router;
