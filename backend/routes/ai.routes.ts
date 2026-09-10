import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import {
  getAIRecommendations,
} from "../aiService";
import {
  generateAIHint,
  generatePatternExplanation,
  generateAICodeReview,
  evaluateCodeWithGemini,
  generateAlgoTrace,
} from "../services/geminiService";
import { getRevisionReminders } from "../services";
import { buildNextAction } from "../services/nextActionService";

const router = Router();

// AI Hint
router.post("/ai/hint", requireAuth, async (req: Request, res: Response) => {
  try {
    const { problemId } = req.body;
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { topic: true },
    });

    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const hint = await generateAIHint(
      problem.title,
      problem.topic.name,
      problem.difficulty,
    );
    res.json({ hint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Error" });
  }
});

// AI Pattern Explanation
router.get(
  "/ai/pattern/:topicId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const topic = await prisma.topic.findUnique({
        where: { id: req.params.topicId as string },
      });

      if (!topic) return res.status(404).json({ error: "Topic not found" });

      const explanation = await generatePatternExplanation(topic.name);
      res.json({ explanation });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "AI Error" });
    }
  },
);

// AI Code Review
router.post("/ai/review", requireAuth, async (req: Request, res: Response) => {
  try {
    const { problemId, code } = req.body;
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { topic: true },
    });

    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const review = await generateAICodeReview(
      code,
      problem.title,
      problem.topic.name,
    );
    res.json({ review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Error during code review" });
  }
});

// AI Algo Trace
router.post("/ai/trace", requireAuth, async (req: Request, res: Response) => {
  try {
    const { problemId, code } = req.body;
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const trace = await generateAlgoTrace(code, problem.title);
    res.json({ trace });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Error during algorithm tracing" });
  }
});

// AI Code Evaluation
router.post(
  "/ai/evaluate",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { problemId, code, language } = req.body;
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: { topic: true },
      });

      if (!problem) return res.status(404).json({ error: "Problem not found" });

      const evaluation = await evaluateCodeWithGemini(
        code,
        problem.title,
        problem.topic.name,
        problem.difficulty,
        language,
      );
      res.json({ evaluation });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "AI Error during code evaluation" });
    }
  },
);

// AI Recommendations
router.get(
  "/ai/recommendations",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const [allTopicsWithProblems, solvedProgress, solutions, revisions] =
        await Promise.all([
          prisma.topic.findMany({
            include: {
              problems: {
                select: { id: true },
              },
            },
            orderBy: { orderIndex: "asc" },
          }),
          prisma.progress.findMany({
            where: { userId, status: "DONE" },
            include: { problem: { include: { topic: true } } },
            orderBy: { completedAt: "desc" },
          }),
          prisma.solutionHistory.findMany({
            where: { userId, isCorrect: true },
            include: { problem: { include: { topic: true } } },
            orderBy: { createdAt: "desc" },
            take: 200,
          }),
          getRevisionReminders(userId),
        ]);

      const allTopics = allTopicsWithProblems.map((t) => ({
        id: t.id,
        name: t.name,
        total: t.problems.length,
      }));
      const topicNames = allTopics.map((t) => t.name);

      const recentSolutionByProblem = new Map<
        string,
        (typeof solutions)[number]
      >();
      for (const solution of solutions) {
        if (!recentSolutionByProblem.has(solution.problemId)) {
          recentSolutionByProblem.set(solution.problemId, solution);
        }
      }

      const solvedProblems = solvedProgress.map((p) => {
        const latestSolution = recentSolutionByProblem.get(p.problemId);
        return {
          title: p.problem.title,
          topic: p.problem.topic.name,
          difficulty: p.problem.difficulty,
          score: latestSolution?.score ?? 0,
          isOptimal: latestSolution?.isOptimal ?? false,
        };
      });

      const solvedIds = new Set(solvedProgress.map((p) => p.problemId));
      const topicCompletion = allTopics.map((topic) => {
        const topicProblemIds = new Set(
          allTopicsWithProblems
            .find((t) => t.id === topic.id)
            ?.problems.map((p) => p.id) || [],
        );
        const solvedInTopic = [...solvedIds].filter((id) =>
          topicProblemIds.has(id),
        ).length;
        const completionPct =
          topic.total > 0 ? (solvedInTopic / topic.total) * 100 : 0;
        return {
          name: topic.name,
          total: topic.total,
          solved: solvedInTopic,
          completionPct,
        };
      });

      const weakTopics = topicCompletion
        .filter((t) => t.total > 0 && t.completionPct < 50)
        .sort((a, b) => a.completionPct - b.completionPct)
        .map((t) => t.name);

      const strongTopics = topicCompletion
        .filter((t) => t.total > 0 && t.completionPct >= 70)
        .sort((a, b) => b.completionPct - a.completionPct)
        .slice(0, 5)
        .map((t) => t.name);

      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      const solvedLast7d = solvedProgress.filter(
        (p) => p.completedAt && new Date(p.completedAt).getTime() >= weekAgo,
      ).length;
      const solvedLast30d = solvedProgress.filter(
        (p) => p.completedAt && new Date(p.completedAt).getTime() >= monthAgo,
      ).length;

      const recommendations = await getAIRecommendations(
        solvedProblems,
        weakTopics,
        topicNames,
        {
          revisionReminders: revisions,
          weakTopicBreakdown: topicCompletion
            .filter((t) => weakTopics.includes(t.name))
            .slice(0, 5)
            .map((topic) => ({
              name: topic.name,
              completionPct: topic.completionPct,
            })),
          solvedLast7d,
          solvedLast30d,
        },
      );

      res.json({
        ...recommendations,
        strongTopics,
        weakTopicBreakdown: topicCompletion
          .filter((t) => weakTopics.includes(t.name))
          .slice(0, 5),
        strongTopicBreakdown: topicCompletion
          .filter((t) => strongTopics.includes(t.name))
          .slice(0, 5),
        realTime: {
          generatedAt: new Date().toISOString(),
          totalSolved: solvedProgress.length,
          solvedLast7d,
          solvedLast30d,
        },
        nextAction: buildNextAction(
          topicCompletion
            .filter((t) => weakTopics.includes(t.name))
            .slice(0, 5)
            .map((topic) => ({
              name: topic.name,
              completionPct: topic.completionPct,
            })),
          revisions,
          solvedLast7d,
        ),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  },
);

export default router;
