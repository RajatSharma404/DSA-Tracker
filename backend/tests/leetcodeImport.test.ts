import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

const mockPrisma = vi.hoisted(() => ({
  topic: { findFirst: vi.fn(), create: vi.fn() },
  problem: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
  progress: { findMany: vi.fn(), upsert: vi.fn() },
  user: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
}));

// Review scheduling has its own tests (reviewScheduling.test.ts); these suites mock Prisma narrowly.
vi.mock("../services/reviewScheduling", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/reviewScheduling")>()),
  scheduleUnscheduledSolves: vi.fn().mockResolvedValue(0),
}));
vi.mock("../db/prisma", () => ({ prisma: mockPrisma }));

vi.mock("../middlewares/auth", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: "u1", email: "u1@example.com", role: "USER" };
    next();
  },
}));

vi.mock("../leetcodeService", () => ({
  fetchSessionUsername: vi.fn(),
  fetchAllSolvedProblems: vi.fn(),
  fetchLeetCodeSolvedProblems: vi.fn(),
  fetchProblemSubmissions: vi.fn(),
}));

import {
  sanitizeEntries,
  normalizeDifficulty,
  slugFromLink,
  importSolvedProblems,
} from "../services/leetcodeImportService";
import userRouter from "../routes/user.routes";

const app = express();
app.use(express.json());
app.use("/api", userRouter);

const ROADMAP = [
  { id: "p-two-sum", title: "Two Sum", link: "https://leetcode.com/problems/two-sum/", topicId: "t1" },
  {
    id: "p-two-sum-ii",
    title: "Two Sum II - Input Array Is Sorted",
    link: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    topicId: "t2",
  },
];

describe("leetcodeImportService helpers", () => {
  it("sanitizeEntries drops invalid slugs and keeps the earliest timestamp", () => {
    const out = sanitizeEntries([
      { titleSlug: "two-sum", timestamp: 200 },
      { titleSlug: "two-sum", timestamp: 100, runtime: "3 ms" },
      { titleSlug: "../etc/passwd" },
      { slug: "Valid-Anagram", title: "Valid Anagram" },
      null,
    ]);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ titleSlug: "two-sum", timestamp: 100, runtime: "3 ms" });
    expect(out[1].titleSlug).toBe("valid-anagram");
  });

  it("normalizeDifficulty maps LeetCode casing and defaults to MEDIUM", () => {
    expect(normalizeDifficulty("Easy")).toBe("EASY");
    expect(normalizeDifficulty("HARD")).toBe("HARD");
    expect(normalizeDifficulty(undefined)).toBe("MEDIUM");
  });

  it("slugFromLink extracts the exact slug", () => {
    expect(slugFromLink("https://leetcode.com/problems/two-sum/description/")).toBe("two-sum");
    expect(slugFromLink(null)).toBeNull();
  });
});

describe("importSolvedProblems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.problem.findMany.mockResolvedValue(ROADMAP);
    mockPrisma.progress.findMany.mockResolvedValue([]);
    mockPrisma.progress.upsert.mockResolvedValue({});
  });

  it("matches on the exact slug (two-sum must not match two-sum-ii)", async () => {
    const result = await importSolvedProblems("u1", [{ titleSlug: "two-sum-ii-input-array-is-sorted" }]);
    expect(result.matched).toBe(1);
    expect(mockPrisma.progress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_problemId: { userId: "u1", problemId: "p-two-sum-ii" } },
      }),
    );
  });

  it("leaves undated solves undated instead of stamping them as solved today", async () => {
    await importSolvedProblems("u1", [{ titleSlug: "two-sum" }]);
    const call = mockPrisma.progress.upsert.mock.calls[0][0];
    expect(call.create.completedAt).toBeNull();
    expect(call.update.completedAt).toBeNull();
  });

  it("skips already-complete progress and creates extra-practice problems once", async () => {
    mockPrisma.progress.findMany.mockResolvedValue([
      {
        problemId: "p-two-sum",
        status: "DONE",
        completedAt: new Date(),
        leetcodeRuntime: "1 ms",
        leetcodeMemory: "9 MB",
      },
    ]);
    mockPrisma.topic.findFirst.mockResolvedValue({ id: "misc" });
    mockPrisma.problem.findFirst.mockResolvedValue({ orderIndex: 4 });
    mockPrisma.problem.create.mockImplementation(async ({ data }: any) => ({ id: "new-1", ...data }));

    const result = await importSolvedProblems("u1", [
      { titleSlug: "two-sum" },
      { titleSlug: "lru-cache", title: "LRU Cache", difficulty: "Medium" },
    ]);

    expect(result.unchanged).toBe(1);
    expect(result.created).toBe(1);
    expect(mockPrisma.problem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: "LRU Cache", difficulty: "MEDIUM", orderIndex: 5 }),
    });
    expect(mockPrisma.progress.upsert).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/user/leetcode/import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.problem.findMany.mockResolvedValue(ROADMAP);
    mockPrisma.progress.findMany.mockResolvedValue([]);
    mockPrisma.progress.upsert.mockResolvedValue({});
    mockPrisma.user.update.mockResolvedValue({});
  });

  it("imports the snapshot and saves the LeetCode username", async () => {
    const res = await request(app)
      .post("/api/user/leetcode/import")
      .send({
        username: "Coder_1",
        solved: [{ titleSlug: "two-sum", title: "Two Sum", difficulty: "EASY" }],
        recent: [{ titleSlug: "two-sum", timestamp: 1_700_000_000 }],
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, syncSource: "extension", syncedCount: 1 });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { leetcodeUsername: "coder_1" },
    });
  });

  it("returns 400 for an empty snapshot", async () => {
    const res = await request(app).post("/api/user/leetcode/import").send({ solved: [] });
    expect(res.status).toBe(400);
  });
});
