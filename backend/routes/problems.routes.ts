import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import { getUserCityProgressInfo } from "../services/cityProgressService";

const router = Router();

// Get Single Problem by ID
router.get(
  "/problems/:problemId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const problemId = req.params.problemId as string;
      const userId = req.user!.id;

      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: {
          topic: true,
          progress: {
            where: { userId },
          },
        },
      });

      if (!problem) {
        return res.status(404).json({ error: "Problem not found" });
      }

      const cityInfo = await getUserCityProgressInfo(userId);
      const levelIndex = cityInfo.levels.findIndex((l) => l.id === problem.topicId);
      if (levelIndex > 0) {
        const prevLevel = cityInfo.levels[levelIndex - 1];
        if (!prevLevel.isCompleted) {
          return res.status(403).json({ error: "Level is locked. Complete the previous floor to unlock this level." });
        }
      }

      const enrichedProblem = {
        ...problem,
        status: problem.progress[0]?.status || "TODO",
        timeSpent: problem.progress[0]?.timeSpent || 0,
        leetcodeRuntime: problem.progress[0]?.leetcodeRuntime || null,
        leetcodeMemory: problem.progress[0]?.leetcodeMemory || null,
      };

      res.json(enrichedProblem);
    } catch (_err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Get tags for a problem
router.get(
  "/problems/:problemId/tags",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const problemId = req.params.problemId as string;
      const problemTags = await prisma.problemTag.findMany({
        where: { problemId, tag: { userId } },
        include: { tag: true },
      });
      res.json(problemTags.map((pt: any) => pt.tag));
    } catch (_err) {
      res.status(500).json({ error: "Failed to get problem tags" });
    }
  },
);

export default router;
