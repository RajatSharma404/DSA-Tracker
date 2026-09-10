import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  problem: {
    count: vi.fn(),
  },
  progress: {
    findMany: vi.fn(),
  },
  streak: {
    findUnique: vi.fn(),
  },
}));

vi.mock("../db/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("../services", () => ({
  getWeakTopics: vi.fn().mockResolvedValue([
    {
      name: "Dynamic Programming",
      totalProblems: 20,
      solvedProblems: 4,
      avgTimeSpent: 35,
      completionPct: 20,
      overdueReviews: 2,
      masteryScore: 25,
      weaknessScore: 85,
    },
  ]),
  getRevisionReminders: vi.fn().mockResolvedValue([
    {
      id: "prob-1",
      title: "Climbing Stairs",
      topicName: "Dynamic Programming",
      daysSince: 4,
    },
  ]),
}));

vi.mock("../middlewares/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../middlewares/auth")>();
  return {
    ...actual,
    requireAuth: (req: any, _res: any, next: any) => {
      req.user = { id: "test-user-uuid", role: "USER" };
      next();
    },
  };
});

import { app } from "../app";

describe("GET /api/dashboard/bootstrap Aggregator Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should aggregate user, stats, active streak, due reviews, and weak topics in a single roundtrip", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "test-user-uuid",
      email: "engineer@example.com",
      name: "Staff Engineer",
      role: "USER",
      leetcodeUsername: "algo_master",
    });

    mockPrisma.problem.count.mockResolvedValue(150);

    const now = new Date();
    mockPrisma.progress.findMany.mockResolvedValue([
      {
        completedAt: now,
        updatedAt: now,
        problem: { difficulty: "EASY" },
      },
      {
        completedAt: now,
        updatedAt: now,
        problem: { difficulty: "MEDIUM" },
      },
      {
        completedAt: now,
        updatedAt: now,
        problem: { difficulty: "HARD" },
      },
    ]);

    mockPrisma.streak.findUnique.mockResolvedValue({
      id: "streak-1",
      userId: "test-user-uuid",
      currentStreak: 7,
      longestStreak: 21,
      lastActivityDate: now,
    });

    const res = await request(app).get("/api/dashboard/bootstrap");

    expect(res.status).toBe(200);

    // 1. User Profile
    expect(res.body.user).toEqual({
      id: "test-user-uuid",
      email: "engineer@example.com",
      name: "Staff Engineer",
      role: "USER",
      leetcodeUsername: "algo_master",
    });

    // 2. Stats
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.totalProblems).toBe(150);
    expect(res.body.stats.solvedProblems).toBe(3);
    expect(res.body.stats.progressPercentage).toBe(2);
    expect(res.body.stats.easySolved).toBe(1);
    expect(res.body.stats.mediumSolved).toBe(1);
    expect(res.body.stats.hardSolved).toBe(1);

    // 3. Streak
    expect(res.body.streak).toBeDefined();
    expect(res.body.streak.currentStreak).toBeGreaterThanOrEqual(1);
    expect(res.body.streak.longestStreak).toBe(21);
    expect(res.body.streak.lastActivityDate).toBeDefined();

    // 4. Due Reviews
    expect(Array.isArray(res.body.dueReviews)).toBe(true);
    expect(res.body.dueReviews.length).toBe(1);
    expect(res.body.dueReviews[0].title).toBe("Climbing Stairs");

    // 5. Weak Topics
    expect(Array.isArray(res.body.weakTopics)).toBe(true);
    expect(res.body.weakTopics.length).toBe(1);
    expect(res.body.weakTopics[0].name).toBe("Dynamic Programming");

    // 6. Next Action
    expect(res.body.nextAction).toBeDefined();

    // 7. Backward compatibility aliases
    expect(res.body.totalProblems).toBe(150);
    expect(res.body.solvedProblems).toBe(3);
    expect(res.body.progressPercentage).toBe(2);
    expect(res.body.currentStreak).toBe(res.body.streak.currentStreak);
    expect(res.body.longestStreak).toBe(21);
    expect(res.body.revisions).toEqual(res.body.dueReviews);
  });

  it("should handle empty progress and streak records gracefully", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "test-user-uuid",
      email: "newbie@example.com",
      name: "New User",
      role: "USER",
      leetcodeUsername: null,
    });

    mockPrisma.problem.count.mockResolvedValue(0);
    mockPrisma.progress.findMany.mockResolvedValue([]);
    mockPrisma.streak.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/dashboard/bootstrap");

    expect(res.status).toBe(200);
    expect(res.body.stats.totalProblems).toBe(0);
    expect(res.body.stats.solvedProblems).toBe(0);
    expect(res.body.stats.progressPercentage).toBe(0);
    expect(res.body.stats.easySolved).toBe(0);
    expect(res.body.streak.currentStreak).toBe(0);
    expect(res.body.streak.longestStreak).toBe(0);
    expect(res.body.streak.lastActivityDate).toBeNull();
  });
});
