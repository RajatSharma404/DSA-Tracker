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

    if (!problemId || typeof problemId !== "string" || problemId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemId" });
    }

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code content is required" });
    }

    if (code.length > 65536) {
      return res.status(400).json({ error: "Code exceeds maximum size of 64KB" });
    }

    const normalizedLang = typeof language === "string" ? language.trim().slice(0, 50) : "cpp";
    const normalizedScore = Number.isFinite(Number(score))
      ? Math.max(0, Math.min(100, Math.round(Number(score))))
      : 0;

    const solution = await prisma.solutionHistory.create({
      data: {
        userId,
        problemId: problemId.trim(),
        code,
        language: normalizedLang,
        isCorrect: Boolean(isCorrect),
        score: normalizedScore,
        verdict: typeof verdict === "string" ? verdict.trim().slice(0, 100) : null,
        timeComplexity: typeof timeComplexity === "string" ? timeComplexity.trim().slice(0, 100) : null,
        spaceComplexity: typeof spaceComplexity === "string" ? spaceComplexity.trim().slice(0, 100) : null,
        isOptimal: Boolean(isOptimal),
        isAIGenerated: typeof isAIGenerated === "string" ? isAIGenerated.trim().slice(0, 50) : "UNKNOWN",
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
