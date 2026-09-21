import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

const mockPrisma = vi.hoisted(() => ({
  topic: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  problem: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  progress: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../db/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("../middlewares/auth", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: "user-test-tier2", email: "test2@example.com", role: "USER" };
    req.userId = "user-test-tier2";
    next();
  },
}));

vi.mock("../leetcodeService", () => ({
  fetchSessionUsername: vi.fn(),
  fetchAllSolvedProblems: vi.fn(),
  fetchLeetCodeSolvedProblems: vi.fn(),
  fetchProblemSubmissions: vi.fn(),
}));

import { isTopicFloorLocked } from "../services/cityProgressService";
import problemsRouter from "../routes/problems.routes";
import userRouter from "../routes/user.routes";
import { fetchLeetCodeSolvedProblems, fetchProblemSubmissions } from "../leetcodeService";

const app = express();
app.use(express.json());
app.use("/api", problemsRouter);
app.use("/api", userRouter);

describe("Tier 2 Architectural & Scalability Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Targeted Predecessor Floor Lock Check (isTopicFloorLocked)", () => {
    it("should return false in O(1) with zero database queries for Topic 0", async () => {
      const locked = await isTopicFloorLocked("user-test-tier2", 0);
      expect(locked).toBe(false);
      expect(mockPrisma.topic.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.topic.findMany).not.toHaveBeenCalled();
    });

    it("should check ONLY preceding topic (orderIndex - 1) and return false when predecessor is completed", async () => {
      // Topic 1 requires Topic 0 to be completed
      mockPrisma.topic.findFirst.mockResolvedValueOnce({
        id: "topic-0",
        problems: [
          { difficulty: "EASY", progress: [{ id: "prog-1" }] },
          { difficulty: "EASY", progress: [{ id: "prog-2" }] },
          { difficulty: "MEDIUM", progress: [{ id: "prog-3" }] },
          { difficulty: "MEDIUM", progress: [{ id: "prog-4" }] },
          { difficulty: "HARD", progress: [{ id: "prog-5" }] },
        ],
      });

      const locked = await isTopicFloorLocked("user-test-tier2", 1);
      expect(locked).toBe(false);
      expect(mockPrisma.topic.findFirst).toHaveBeenCalledWith({
        where: { orderIndex: 0 },
        select: expect.any(Object),
      });
      // Guarantees we did NOT query findMany across all topics
      expect(mockPrisma.topic.findMany).not.toHaveBeenCalled();
    });

    it("should return true (locked) when predecessor topic is incomplete", async () => {
      mockPrisma.topic.findFirst.mockResolvedValueOnce({
        id: "topic-0",
        problems: [
          { difficulty: "EASY", progress: [{ id: "prog-1" }] },
          // Missing required medium and hard solves
          { difficulty: "MEDIUM", progress: [] },
          { difficulty: "HARD", progress: [] },
        ],
      });

      const locked = await isTopicFloorLocked("user-test-tier2", 1);
      expect(locked).toBe(true);
    });

    it("GET /api/problems/:problemId should use isTopicFloorLocked without full-curriculum scan", async () => {
      mockPrisma.problem.findUnique.mockResolvedValueOnce({
        id: "prob-1",
        title: "Two Sum",
        topicId: "topic-0",
        topic: { id: "topic-0", name: "Arrays", orderIndex: 0 },
        progress: [],
      });

      const res = await request(app).get("/api/problems/prob-1");

      expect(res.status).toBe(200);
      expect(res.body.isFloorLocked).toBe(false);
      expect(res.body.status).toBe("TODO");
      // For Topic 0, zero topic queries occur
      expect(mockPrisma.topic.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.topic.findMany).not.toHaveBeenCalled();
    });
  });

  describe("2. LeetCode Sync N+1 Query Elimination (user.routes.ts)", () => {
    it("should pre-load roadmap problems and progress in bulk without N+1 queries", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: "user-test-tier2",
        leetcodeUsername: "rajat_coder",
        leetcodeSession: null,
      });

      (fetchLeetCodeSolvedProblems as any).mockResolvedValueOnce({
        recentSubmissionList: [
          { title: "Two Sum", titleSlug: "two-sum", statusDisplay: "Accepted", timestamp: 1600000000 },
          { title: "Valid Anagram", titleSlug: "valid-anagram", statusDisplay: "Accepted", timestamp: 1600000001 },
        ],
      });

      // Bulk preloads
      mockPrisma.problem.findMany.mockResolvedValueOnce([
        { id: "p1", title: "Two Sum", link: "https://leetcode.com/problems/two-sum/", topicId: "top-1" },
        { id: "p2", title: "Valid Anagram", link: "https://leetcode.com/problems/valid-anagram/", topicId: "top-1" },
      ]);

      mockPrisma.progress.findMany.mockResolvedValueOnce([
        {
          id: "prog-1",
          problemId: "p1",
          status: "DONE",
          completedAt: new Date(1600000000 * 1000),
          leetcodeRuntime: "5ms",
          leetcodeMemory: "40MB",
        },
      ]);

      mockPrisma.topic.findFirst.mockResolvedValueOnce({ id: "misc-topic" });
      mockPrisma.progress.upsert.mockResolvedValue({});

      const res = await request(app).post("/api/user/sync-leetcode");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.syncedCount).toBe(2);

      // Verifies bulk preload: problem.findMany and progress.findMany were called ONCE
      expect(mockPrisma.problem.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.progress.findMany).toHaveBeenCalledTimes(1);

      // Verifies that for 'p1' (already DONE with runtime/memory), upsert was NOT called
      // Only 'p2' (unsaved) was upserted
      expect(mockPrisma.progress.upsert).toHaveBeenCalledTimes(1);
      expect(mockPrisma.progress.upsert).toHaveBeenCalledWith({
        where: { userId_problemId: { userId: "user-test-tier2", problemId: "p2" } },
        update: expect.any(Object),
        create: expect.any(Object),
      });

      // No external submission network calls made
      expect(fetchProblemSubmissions).not.toHaveBeenCalled();
    });
  });
});
