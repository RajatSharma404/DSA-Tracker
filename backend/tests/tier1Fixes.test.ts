import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

const mockPrisma = vi.hoisted(() => ({
  problem: {
    findMany: vi.fn(),
  },
  challengeSession: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../db/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("../middlewares/auth", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: "user-123", email: "test@example.com", role: "USER" };
    req.userId = "user-123";
    next();
  },
}));

import challengesRouter from "../routes/challenges.routes";
import searchRouter from "../routes/search.routes";

const app = express();
app.use(express.json());
app.use("/api", challengesRouter);
app.use("/api", searchRouter);

describe("Tier 1 Critical Bug Fixes & Architecture Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Challenge Randomizer (challenges.routes.ts)", () => {
    it("should return 404 when no problems are found for topic", async () => {
      mockPrisma.problem.findMany.mockResolvedValueOnce([]);

      const res = await request(app)
        .post("/api/challenges/start")
        .send({ topicId: "empty-topic" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("No problems found for this topic");
      expect(mockPrisma.challengeSession.create).not.toHaveBeenCalled();
    });

    it("should sample random problems using Fisher-Yates and not strictly the first two", async () => {
      // 10 problems available in topic
      const fakeProblems = Array.from({ length: 10 }, (_, i) => ({
        id: `prob-${i + 1}`,
      }));
      mockPrisma.problem.findMany.mockResolvedValue(fakeProblems);
      mockPrisma.challengeSession.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: "session-1", ...data, createdAt: new Date() }),
      );

      const sampledSelections = new Set<string>();

      // Run multiple times to observe distribution
      for (let i = 0; i < 20; i++) {
        const res = await request(app)
          .post("/api/challenges/start")
          .send({ topicId: "topic-1", duration: 45 });

        expect(res.status).toBe(200);
        expect(res.body.problemIds).toHaveLength(2);
        sampledSelections.add(res.body.problemIds.sort().join(","));
      }

      // With 10 items choose 2, repeated random sampling across 20 iterations
      // MUST yield multiple distinct combinations (impossible with old buggy take:2)
      expect(sampledSelections.size).toBeGreaterThan(1);
    });

    it("should support custom count and clamp to available problem count", async () => {
      const singleProblem = [{ id: "prob-only-one" }];
      mockPrisma.problem.findMany.mockResolvedValueOnce(singleProblem);
      mockPrisma.challengeSession.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: "session-1", ...data }),
      );

      const res = await request(app)
        .post("/api/challenges/start")
        .send({ topicId: "small-topic", count: 5 });

      expect(res.status).toBe(200);
      expect(res.body.problemIds).toEqual(["prob-only-one"]);
    });

    it("should complete challenge session with valid status", async () => {
      mockPrisma.challengeSession.findFirst.mockResolvedValueOnce({
        id: "session-1",
        userId: "user-123",
      });
      mockPrisma.challengeSession.update.mockResolvedValueOnce({
        id: "session-1",
        status: "COMPLETED",
        endTime: new Date(),
      });

      const res = await request(app)
        .post("/api/challenges/session-1/complete")
        .send({ status: "COMPLETED" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("COMPLETED");
    });

    it("should reject invalid challenge completion status", async () => {
      const res = await request(app)
        .post("/api/challenges/session-1/complete")
        .send({ status: "INVALID_STATUS" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid challenge status");
    });
  });

  describe("2. Search 'TODO' Status Filter (search.routes.ts)", () => {
    it("should construct composite OR condition inside where.AND when status=TODO", async () => {
      mockPrisma.problem.findMany.mockResolvedValueOnce([]);

      await request(app).get("/api/search?status=TODO");

      expect(mockPrisma.problem.findMany).toHaveBeenCalledTimes(1);
      const queryArg = mockPrisma.problem.findMany.mock.calls[0][0];

      // Verifies the fix: matches unattempted problems (progress: none)
      // AND explicitly marked TODO problems (progress: some: { status: TODO })
      expect(queryArg.where.AND).toBeDefined();
      expect(queryArg.where.AND).toEqual([
        {
          OR: [
            { progress: { none: { userId: "user-123" } } },
            { progress: { some: { userId: "user-123", status: "TODO" } } },
          ],
        },
      ]);
    });

    it("should construct simple progress.some condition when status=DONE", async () => {
      mockPrisma.problem.findMany.mockResolvedValueOnce([]);

      await request(app).get("/api/search?status=DONE");

      expect(mockPrisma.problem.findMany).toHaveBeenCalledTimes(1);
      const queryArg = mockPrisma.problem.findMany.mock.calls[0][0];

      expect(queryArg.where.AND).toEqual([
        {
          progress: {
            some: {
              userId: "user-123",
              status: "DONE",
            },
          },
        },
      ]);
    });
  });
});
