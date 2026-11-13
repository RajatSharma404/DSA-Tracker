import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import { aiRateLimiter } from "../middlewares/rateLimiter";
import { appCacheStore } from "../utils/cacheStore";
import { getAIRecommendations } from "../aiService";
import {
  generateAIHint,
  generatePatternExplanation,
  generateAICodeReview,
  evaluateCodeWithGemini,
  generateAlgoTrace,
  generateStudyPlanWithGemini,
  generateDeterministicStudyPlan,
  detectMistakePatternsWithGemini,
  generateForgotAnalysisWithGemini,
  checkAndConsumeAiQuota,
  getAiQuotaStatus,
  CandidateProblem,
} from "../services/geminiService";
import { getRevisionReminders, getWeakTopics } from "../services";
import { buildNextAction } from "../services/nextActionService";
import { analyzeComplexity } from "../services/complexity";
import { requireFeature } from "../middlewares/featureGate";
import { isFeatureEnabled } from "../features";

const router = Router();
router.use(aiRateLimiter);

/**
 * Length cap validator: reject code > 20k, notes > 5k with 400
 */
function validateInputCaps(req: Request, res: Response): boolean {
  const code = req.body?.code;
  const notes = req.body?.notes;

  if (typeof code === "string" && code.length > 20000) {
    res.status(400).json({ error: "Code exceeds maximum allowed size of 20,000 characters" });
    return false;
  }
  if (typeof notes === "string" && notes.length > 5000) {
    res.status(400).json({ error: "Notes exceed maximum allowed size of 5,000 characters" });
    return false;
  }
  return true;
}

// ==========================================
// AI Quota Status (for frontend badge)
// ==========================================
router.get("/ai/quota", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { role: true, timezone: true },
    });
    const role = user?.role || "USER";
    const tz = user?.timezone || "UTC";

    const [hints, review, plan, explain, patterns, trace] = await Promise.all([
      getAiQuotaStatus(req.user!.id, role, tz, "hints"),
      getAiQuotaStatus(req.user!.id, role, tz, "review"),
      getAiQuotaStatus(req.user!.id, role, tz, "plan"),
      getAiQuotaStatus(req.user!.id, role, tz, "explain"),
      getAiQuotaStatus(req.user!.id, role, tz, "patterns"),
      getAiQuotaStatus(req.user!.id, role, tz, "trace"),
    ]);

    res.json({
      hints,
      review,
      plan,
      explain,
      patterns,
      trace: isFeatureEnabled("algotracer")
        ? trace
        : { allowed: false, remaining: 0, resetTime: "Feature Disabled" },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch AI quota" });
  }
});

// ==========================================
// AI Hint
// ==========================================
router.post("/ai/hint", requireAuth, async (req: Request, res: Response) => {
  try {
    const { problemId } = req.body;
    if (!problemId || typeof problemId !== "string") {
      return res.status(400).json({ error: "Invalid problemId" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { role: true, timezone: true },
    });

    const quota = await checkAndConsumeAiQuota(req.user!.id, user?.role, user?.timezone, "hints");
    if (!quota.allowed) {
      return res.status(429).json({
        error: {
          code: "AI_QUOTA_EXCEEDED",
          message: "Daily quota for AI hints exceeded. Resets at midnight.",
          remaining: 0,
          resetTime: quota.resetTime,
        },
      });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { topic: true },
    });

    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const hint = await generateAIHint(
      problem.title,
      problem.topic.name,
      problem.difficulty
    );
    res.json({ hint, quotaRemaining: quota.remaining });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Error" });
  }
});

// ==========================================
// AI Pattern Explanation
// ==========================================
router.get("/ai/pattern/:topicId", requireAuth, async (req: Request, res: Response) => {
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
});

// ==========================================
// AI Code Review
// ==========================================
router.post("/ai/review", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateInputCaps(req, res)) return;

    const { problemId, code } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code content required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { role: true, timezone: true },
    });

    const quota = await checkAndConsumeAiQuota(req.user!.id, user?.role, user?.timezone, "review");
    if (!quota.allowed) {
      return res.status(429).json({
        error: {
          code: "AI_QUOTA_EXCEEDED",
          message: "Daily quota for code reviews exceeded. Resets at midnight.",
          remaining: 0,
          resetTime: quota.resetTime,
        },
      });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { topic: true },
    });

    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const review = await generateAICodeReview(code, problem.title, problem.topic.name);
    res.json({ review, quotaRemaining: quota.remaining });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Error during code review" });
  }
});

// ==========================================
// AI Algo Trace
// ==========================================
router.post(
  "/ai/trace",
  requireAuth,
  requireFeature("algotracer"),
  async (req: Request, res: Response) => {
  try {
    if (!validateInputCaps(req, res)) return;

    const { problemId, code } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code content required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { role: true, timezone: true },
    });

    const quota = await checkAndConsumeAiQuota(req.user!.id, user?.role, user?.timezone, "trace");
    if (!quota.allowed) {
      return res.status(429).json({
        error: {
          code: "AI_QUOTA_EXCEEDED",
          message: "Daily quota for algorithm tracing exceeded. Resets at midnight.",
          remaining: 0,
          resetTime: quota.resetTime,
        },
      });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const trace = await generateAlgoTrace(code, problem.title);
    res.json({ trace, quotaRemaining: quota.remaining });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Error during algorithm tracing" });
  }
});

// ==========================================
// AI Code Evaluation (with AST complexity)
// ==========================================
router.post("/ai/evaluate", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateInputCaps(req, res)) return;

    const { problemId, code, language } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code content required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { role: true, timezone: true },
    });

    const quota = await checkAndConsumeAiQuota(req.user!.id, user?.role, user?.timezone, "review");
    if (!quota.allowed) {
      return res.status(429).json({
        error: {
          code: "AI_QUOTA_EXCEEDED",
          message: "Daily quota for code evaluations exceeded. Resets at midnight.",
          remaining: 0,
          resetTime: quota.resetTime,
        },
      });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { topic: true },
    });

    if (!problem) return res.status(404).json({ error: "Problem not found" });

    // Run AST complexity estimation
    const astComplexity = analyzeComplexity(code, language, problem.topic.name);

    const evaluation = await evaluateCodeWithGemini(
      code,
      problem.title,
      problem.topic.name,
      problem.difficulty,
      language
    );

    res.json({
      evaluation: {
        ...evaluation,
        estimatedComplexity: astComplexity,
      },
      quotaRemaining: quota.remaining,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Error during code evaluation" });
  }
});

// ==========================================
// Feature 3.3: Weekly Study Plan
// ==========================================
router.post("/ai/study-plan", requireAuth, async (req: Request, res: Response) => {
  try {
    const weeklyHoursSchema = z.object({
      weeklyHours: z.coerce.number().min(1).max(40).default(10),
    });

    const parsed = weeklyHoursSchema.safeParse(req.body);
    const weeklyHours = parsed.success ? parsed.data.weeklyHours : 10;
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, timezone: true },
    });

    const quota = await checkAndConsumeAiQuota(userId, user?.role, user?.timezone, "plan");

    // Gather candidates deterministically server-side
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in14DaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Weakest topics
    const weakTopicsList = await getWeakTopics(userId);
    const weakTopics = weakTopicsList.slice(0, 5).map((t) => t.name);

    // 2. Due reviews from FSRS
    const dueProgress = await prisma.progress.findMany({
      where: {
        userId,
        status: "DONE",
        nextReviewDate: { lte: in7Days },
      },
      include: { problem: { include: { topic: true } } },
      take: 20,
    });

    const dueCandidates: CandidateProblem[] = dueProgress.map((p) => ({
      id: p.problem.id,
      title: p.problem.title,
      difficulty: p.problem.difficulty,
      topicName: p.problem.topic.name,
      isDueReview: true,
    }));

    // 3. Weak-topic problems
    const weakProblems = await prisma.problem.findMany({
      where: {
        topic: { name: { in: weakTopics } },
        progress: {
          none: {
            userId,
            status: "DONE",
          },
        },
      },
      include: { topic: true },
      take: 25,
    });

    const weakCandidates: CandidateProblem[] = weakProblems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      topicName: p.topic.name,
      isDueReview: false,
    }));

    const allCandidates = [...dueCandidates, ...weakCandidates];

    // If still sparse, fetch some general problems
    if (allCandidates.length < 7) {
      const general = await prisma.problem.findMany({
        include: { topic: true },
        take: 15,
      });
      for (const p of general) {
        if (!allCandidates.some((c) => c.id === p.id)) {
          allCandidates.push({
            id: p.id,
            title: p.title,
            difficulty: p.difficulty,
            topicName: p.topic.name,
            isDueReview: false,
          });
        }
      }
    }

    // 4. Past 14d activity
    const activityCount = await prisma.activityEvent.count({
      where: {
        userId,
        occurredAt: { gte: in14DaysAgo },
      },
    });

    // 5. Retrievability estimate
    const reviewLogs = await prisma.reviewLog.findMany({
      where: { userId },
      orderBy: { reviewedAt: "desc" },
      take: 50,
      select: { stabilityAfter: true, elapsedDays: true },
    });
    let avgRetrievability = 0.85;
    if (reviewLogs.length > 0) {
      const sumR = reviewLogs.reduce((acc, log) => {
        const s = log.stabilityAfter || 1;
        const d = log.elapsedDays || 1;
        return acc + Math.exp((-d / s) * 0.1);
      }, 0);
      avgRetrievability = sumR / reviewLogs.length;
    }

    // If quota is exhausted or AI client offline, use deterministic fallback
    let resultPlan;
    let fallbackUsed = false;

    if (!quota.allowed) {
      resultPlan = generateDeterministicStudyPlan(allCandidates, weeklyHours, weakTopics);
      fallbackUsed = true;
    } else {
      const genResult = await generateStudyPlanWithGemini(
        allCandidates,
        weeklyHours,
        weakTopics,
        activityCount,
        avgRetrievability
      );
      resultPlan = genResult.plan;
      fallbackUsed = genResult.isFallback;
    }

    // Persist to StudyPlan model
    const savedPlan = await prisma.studyPlan.create({
      data: {
        userId,
        weekStart: new Date(),
        plan: resultPlan as any,
      },
    });

    res.json({
      plan: resultPlan,
      studyPlanId: savedPlan.id,
      isFallback: fallbackUsed,
      quotaRemaining: quota.remaining,
      resetTime: quota.resetTime,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate study plan" });
  }
});

router.get("/ai/study-plan", requireAuth, async (req: Request, res: Response) => {
  try {
    const active = await prisma.studyPlan.findFirst({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });

    if (!active) {
      return res.json({ plan: null });
    }

    res.json({
      plan: active.plan,
      createdAt: active.createdAt,
      id: active.id,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load study plan" });
  }
});

// ==========================================
// Feature 3.4: Mistake Pattern Detection
// ==========================================
router.get("/ai/mistake-patterns", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const cacheKey = `ai:patterns:${userId}`;

    // 6-hour cache check
    const cached = await appCacheStore.get<any>(cacheKey);
    if (cached) {
      return res.json({ patterns: cached, fromCache: true });
    }

    // Read last 30 non-ACCEPTED solutions
    const nonAccepted = await prisma.solutionHistory.findMany({
      where: {
        userId,
        OR: [{ isCorrect: false }, { verdict: { not: "ACCEPTED" } }],
      },
      include: { problem: { include: { topic: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    // If < 5 failed submissions, return empty without calling model
    if (nonAccepted.length < 5) {
      return res.json({
        patterns: [],
        message: "Need at least 5 submissions to detect patterns",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, timezone: true },
    });

    const quota = await checkAndConsumeAiQuota(userId, user?.role, user?.timezone, "patterns");
    if (!quota.allowed) {
      return res.status(429).json({
        error: {
          code: "AI_QUOTA_EXCEEDED",
          message: "Daily quota for mistake pattern detection reached. Resets at midnight.",
          remaining: 0,
          resetTime: quota.resetTime,
        },
      });
    }

    // Read user notes
    const problemIds = nonAccepted.map((s) => s.problemId);
    const notes = await prisma.problemNote.findMany({
      where: {
        userId,
        problemId: { in: problemIds },
      },
      select: { problemId: true, content: true },
    });
    const notesMap = new Map(notes.map((n) => [n.problemId, n.content]));

    const failedPayload = nonAccepted.map((s) => ({
      problemId: s.problemId,
      problemTitle: s.problem.title,
      topicName: s.problem.topic.name,
      code: s.code,
      notes: notesMap.get(s.problemId),
    }));

    const result = await detectMistakePatternsWithGemini(failedPayload);

    // Cache for 6 hours
    await appCacheStore.set(cacheKey, result.patterns, 6 * 3600);

    res.json({
      patterns: result.patterns,
      quotaRemaining: quota.remaining,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to detect mistake patterns" });
  }
});

// ==========================================
// Feature 3.5: "Why Did I Forget This?"
// ==========================================
router.post("/ai/forgot-analysis", requireAuth, async (req: Request, res: Response) => {
  try {
    const { problemId } = req.body;
    if (!problemId || typeof problemId !== "string") {
      return res.status(400).json({ error: "Invalid problemId" });
    }

    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, timezone: true },
    });

    const quota = await checkAndConsumeAiQuota(userId, user?.role, user?.timezone, "explain");
    if (!quota.allowed) {
      return res.status(429).json({
        error: {
          code: "AI_QUOTA_EXCEEDED",
          message: "Daily quota for 'Why did I forget' analysis exceeded. Resets at midnight.",
          remaining: 0,
          resetTime: quota.resetTime,
        },
      });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { topic: true },
    });

    if (!problem) return res.status(404).json({ error: "Problem not found" });

    // Review logs history for this problem
    const reviewLogs = await prisma.reviewLog.findMany({
      where: { userId, problemId },
      orderBy: { reviewedAt: "asc" },
      select: { rating: true, reviewedAt: true, elapsedDays: true, scheduledDays: true },
    });

    // Latest solution and note
    const [latestSolution, note] = await Promise.all([
      prisma.solutionHistory.findFirst({
        where: { userId, problemId },
        orderBy: { createdAt: "desc" },
        select: { code: true, isCorrect: true },
      }),
      prisma.problemNote.findFirst({
        where: { userId, problemId },
        select: { content: true },
      }),
    ]);

    // Topic mastery score
    const weakTopics = await getWeakTopics(userId);
    const topicStat = weakTopics.find((t) => t.name === problem.topic.name);
    const topicMasteryScore = topicStat ? topicStat.masteryScore : 50;

    const analysis = await generateForgotAnalysisWithGemini(
      {
        id: problem.id,
        title: problem.title,
        topicName: problem.topic.name,
        difficulty: problem.difficulty,
      },
      reviewLogs,
      latestSolution,
      note,
      topicMasteryScore
    );

    res.json({
      analysis,
      quotaRemaining: quota.remaining,
      resetTime: quota.resetTime,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate forgetfulness analysis" });
  }
});

// ==========================================
// AI Recommendations
// ==========================================
router.get("/ai/recommendations", requireAuth, async (req: Request, res: Response) => {
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
          ?.problems.map((p) => p.id) || []
      );
      const solvedInTopic = [...solvedIds].filter((id) =>
        topicProblemIds.has(id)
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
      (p) => p.completedAt && new Date(p.completedAt).getTime() >= weekAgo
    ).length;
    const solvedLast30d = solvedProgress.filter(
      (p) => p.completedAt && new Date(p.completedAt).getTime() >= monthAgo
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
      }
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
        solvedLast7d
      ),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

export default router;
