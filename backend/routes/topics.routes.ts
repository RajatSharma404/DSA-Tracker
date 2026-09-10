import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// 2. Get All Topics with Progress
router.get("/topics", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const topics = await prisma.topic.findMany({
      include: {
        problems: {
          include: {
            progress: {
              where: { userId },
            },
          },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    const enrichedTopics = topics.map((topic) => {
      const total = topic.problems.length;
      const solved = topic.problems.filter(
        (p) => p.progress[0]?.status === "DONE",
      ).length;
      return {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        totalProblems: total,
        solvedProblems: solved,
        progressPercentage:
          total === 0 ? 0 : Math.round((solved / total) * 100),
      };
    });

    res.json(enrichedTopics);
  } catch (_error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. Get Problems for a Topic
router.get(
  "/topics/:topicId/problems",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const topicId = req.params.topicId as string;
      const userId = req.user!.id;

      const problems = await prisma.problem.findMany({
        where: { topicId },
        include: {
          progress: {
            where: { userId },
          },
        },
        orderBy: { orderIndex: "asc" },
      });

      const enrichedProblems = problems.map((problem) => ({
        ...problem,
        status: problem.progress[0]?.status || "TODO",
        timeSpent: problem.progress[0]?.timeSpent || 0,
        leetcodeRuntime: problem.progress[0]?.leetcodeRuntime || null,
        leetcodeMemory: problem.progress[0]?.leetcodeMemory || null,
      }));

      res.json(enrichedProblems);
    } catch (_err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
