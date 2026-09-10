import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Save a solution
router.post("/solutions", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      problemId,
      code,
      language,
      isCorrect,
      score,
      verdict,
      timeComplexity,
      spaceComplexity,
      isOptimal,
      isAIGenerated,
    } = req.body;

    const solution = await prisma.solutionHistory.create({
      data: {
        userId,
        problemId,
        code,
        language,
        isCorrect: isCorrect || false,
        score: score || 0,
        verdict: verdict || null,
        timeComplexity: timeComplexity || null,
        spaceComplexity: spaceComplexity || null,
        isOptimal: isOptimal || false,
        isAIGenerated: isAIGenerated || "UNKNOWN",
      },
    });
    res.json(solution);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save solution" });
  }
});

// Get solution history for a problem
router.get(
  "/solutions/:problemId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const problemId = req.params.problemId as string;

      const solutions = await prisma.solutionHistory.findMany({
        where: { userId, problemId },
        orderBy: { createdAt: "desc" },
      });
      res.json(solutions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get solution history" });
    }
  },
);

// Get all solutions for a user (for analytics)
router.get("/solutions", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const solutions = await prisma.solutionHistory.findMany({
      where: { userId },
      include: { problem: { include: { topic: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(solutions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get solutions" });
  }
});

export default router;
