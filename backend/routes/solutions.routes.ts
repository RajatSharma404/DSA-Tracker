import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { analyzeComplexity } from "../services/complexity";

const router = Router();

const saveSolutionSchema = {
  body: z.object({
    problemId: z.string().trim().min(1, "Invalid or missing problemId"),
    code: z
      .string()
      .min(1, "Code content is required")
      .max(65536, "Code exceeds maximum size of 64KB"),
    language: z.string().trim().max(50).optional().default("cpp"),
    isCorrect: z.boolean().optional().default(false),
    score: z.coerce.number().min(0).max(100).optional().default(0),
    verdict: z.string().trim().max(100).optional().nullable(),
    timeComplexity: z.string().trim().max(100).optional().nullable(),
    spaceComplexity: z.string().trim().max(100).optional().nullable(),
    isOptimal: z.boolean().optional().default(false),
    isAIGenerated: z.string().trim().max(50).optional().default("UNKNOWN"),
  }),
};

// Save a solution
router.post(
  "/solutions",
  requireAuth,
  validate(saveSolutionSchema),
  async (req: Request, res: Response) => {
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

    const estimated = analyzeComplexity(code, normalizedLang);

    const solution = await prisma.solutionHistory.create({
      data: {
        userId,
        problemId: problemId.trim(),
        code,
        language: normalizedLang,
        isCorrect: Boolean(isCorrect),
        score: normalizedScore,
        verdict: typeof verdict === "string" ? verdict.trim().slice(0, 100) : null,
        timeComplexity: typeof timeComplexity === "string" ? timeComplexity.trim().slice(0, 100) : estimated.time,
        spaceComplexity: typeof spaceComplexity === "string" ? spaceComplexity.trim().slice(0, 100) : estimated.space,
        estimatedComplexity: estimated as any,
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
