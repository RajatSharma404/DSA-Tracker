import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../db/prisma";
import { requireAuth, requireAdmin, invalidateUserCache } from "../middlewares/auth";
import { seedStarterTheoryContent } from "../services/theoryService";
import { seedComprehensiveDSA } from "../seedComprehensiveDSA";
import { seedLearnCppCurriculum } from "../seedLearnCppCurriculum";

const router = Router();

router.post(
  "/admin/learn/seed",
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const seededResult = await seedStarterTheoryContent();
      res.json({
        success: true,
        ...seededResult,
      });
    } catch (error) {
      console.error("Theory seed error:", error);
      res.status(500).json({ error: "Failed to seed theory content" });
    }
  },
);

router.post(
  "/admin/learn/seed-comprehensive",
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const result = await seedComprehensiveDSA();
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Comprehensive DSA seed error:", error);
      res
        .status(500)
        .json({ error: "Failed to seed comprehensive DSA content" });
    }
  },
);

router.post(
  "/admin/learn/seed-learncpp",
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const result = await seedLearnCppCurriculum();
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("LearnCpp seed error:", error);
      res
        .status(500)
        .json({ error: "Failed to seed LearnCpp content" });
    }
  },
);

router.get(
  "/admin/users",
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          leetcodeUsername: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(users);
    } catch (_error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

// Update user role
router.patch(
  "/admin/users/:id/role",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      const userId = req.params.id as string;
      if (role !== "USER" && role !== "ADMIN") {
        return res.status(400).json({ error: "Invalid role value" });
      }
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role: role as any } as any,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          leetcodeUsername: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      invalidateUserCache(userId);
      if (user?.email) {
        invalidateUserCache(user.email);
      }
      res.json(user);
    } catch (_error) {
      res.status(500).json({ error: "Error updating user" });
    }
  },
);

// Topic Management
router.post(
  "/admin/topics",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { name, description, orderIndex } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Topic name is required" });
      }
      const parsedOrder = Number.isFinite(parseInt(orderIndex, 10))
        ? parseInt(orderIndex, 10)
        : 0;

      const topic = await prisma.topic.create({
        data: {
          name: name.trim().slice(0, 100),
          description: typeof description === "string" ? description.trim().slice(0, 500) : null,
          orderIndex: parsedOrder,
        },
      });
      res.json(topic);
    } catch (_error) {
      res.status(500).json({ error: "Error creating topic" });
    }
  },
);

router.put(
  "/admin/topics/:id",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { name, description, orderIndex } = req.body;
      const topicId = req.params.id as string;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Topic name is required" });
      }
      const parsedOrder = Number.isFinite(parseInt(orderIndex, 10))
        ? parseInt(orderIndex, 10)
        : 0;

      const topic = await prisma.topic.update({
        where: { id: topicId },
        data: {
          name: name.trim().slice(0, 100),
          description: typeof description === "string" ? description.trim().slice(0, 500) : null,
          orderIndex: parsedOrder,
        },
      });
      res.json(topic);
    } catch (_error) {
      res.status(500).json({ error: "Error updating topic" });
    }
  },
);

router.delete(
  "/admin/topics/:id",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const topicId = req.params.id as string;
      await prisma.topic.delete({ where: { id: topicId } });
      res.json({ success: true });
    } catch (_error) {
      res.status(500).json({ error: "Error deleting topic" });
    }
  },
);

// Problem Management
router.post(
  "/admin/problems",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { title, link, difficulty, topicId, orderIndex } = req.body;
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "Problem title is required" });
      }
      const allowedDiffs = new Set(["EASY", "MEDIUM", "HARD"]);
      const normalizedDiff = allowedDiffs.has(difficulty) ? difficulty : "MEDIUM";
      const parsedOrder = Number.isFinite(parseInt(orderIndex, 10))
        ? parseInt(orderIndex, 10)
        : 0;

      const problem = await prisma.problem.create({
        data: {
          title: title.trim().slice(0, 200),
          link: typeof link === "string" ? link.trim().slice(0, 500) : null,
          difficulty: normalizedDiff as any,
          topicId,
          orderIndex: parsedOrder,
        },
      });
      res.json(problem);
    } catch (_error) {
      res.status(500).json({ error: "Error creating problem" });
    }
  },
);

router.put(
  "/admin/problems/:id",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { title, link, difficulty, topicId, orderIndex } = req.body;
      const probId = req.params.id as string;
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "Problem title is required" });
      }
      const allowedDiffs = new Set(["EASY", "MEDIUM", "HARD"]);
      const normalizedDiff = allowedDiffs.has(difficulty) ? difficulty : "MEDIUM";
      const parsedOrder = Number.isFinite(parseInt(orderIndex, 10))
        ? parseInt(orderIndex, 10)
        : 0;

      const problem = await prisma.problem.update({
        where: { id: probId },
        data: {
          title: title.trim().slice(0, 200),
          link: typeof link === "string" ? link.trim().slice(0, 500) : null,
          difficulty: normalizedDiff as any,
          topicId,
          orderIndex: parsedOrder,
        },
      });
      res.json(problem);
    } catch (_error) {
      res.status(500).json({ error: "Error updating problem" });
    }
  },
);

router.delete(
  "/admin/problems/:id",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const probId = req.params.id as string;
      await prisma.problem.delete({ where: { id: probId } });
      res.json({ success: true });
    } catch (_error) {
      res.status(500).json({ error: "Error deleting problem" });
    }
  },
);

// Seed roadmap topics + problems from dsa-roadmap-seed.json (idempotent)
router.post(
  "/admin/seed",
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const seedDataPath = path.join(__dirname, "../../dsa-roadmap-seed.json");
      const fallbackSeedDataPath = path.join(__dirname, "../dsa-roadmap-seed.json");
      const resolvedPath = fs.existsSync(seedDataPath)
        ? seedDataPath
        : fallbackSeedDataPath;

      if (!fs.existsSync(resolvedPath)) {
        return res.status(500).json({ error: "Seed data file not found" });
      }
      const seedData = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));

      let topicsUpserted = 0;
      let problemsUpserted = 0;

      for (const topicData of seedData.topics) {
        const topic = await prisma.topic.upsert({
          where: { name: topicData.name },
          update: {
            description: topicData.description,
            orderIndex: topicData.order,
          },
          create: {
            name: topicData.name,
            description: topicData.description,
            orderIndex: topicData.order,
          },
        });
        topicsUpserted++;

        for (const problemData of topicData.problems) {
          const existing = await prisma.problem.findFirst({
            where: { title: problemData.title, topicId: topic.id },
          });

          if (existing) {
            await prisma.problem.update({
              where: { id: existing.id },
              data: {
                link: problemData.leetcode,
                difficulty: problemData.difficulty.toUpperCase() as any,
                orderIndex: problemData.order,
              },
            });
          } else {
            await prisma.problem.create({
              data: {
                title: problemData.title,
                link: problemData.leetcode,
                difficulty: problemData.difficulty.toUpperCase() as any,
                orderIndex: problemData.order,
                topicId: topic.id,
              },
            });
          }
          problemsUpserted++;
        }
      }

      res.json({ success: true, topicsUpserted, problemsUpserted });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: "Seed failed" });
    }
  },
);

export default router;
