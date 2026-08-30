import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  progress: {
    findMany: vi.fn(),
  },
  topic: {
    findMany: vi.fn(),
  },
  streak: {
    findFirst: vi.fn(),
  },
}));

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      progress = mockPrisma.progress;
      topic = mockPrisma.topic;
      streak = mockPrisma.streak;
    },
    Prisma: {},
  };
});

import {
  getRevisionReminders,
  getWeakTopics,
  getMasteryStats,
  getDailyProblem,
  getInterviewReadinessIndex,
  getTimeAnalytics,
  getAchievements,
  getWeeklyReport,
} from "../services";

describe("backend/services.ts", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getRevisionReminders", () => {
    it("should return reminders for overdue reviews", async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000); // 4 days ago
      mockPrisma.progress.findMany.mockResolvedValue([
        {
          problem: {
            id: "p1",
            title: "Two Sum",
            topic: { name: "Arrays" },
          },
          completedAt: pastDate.toISOString(),
          nextReviewDate: pastDate,
        },
        {
          problem: {
            id: "p2",
            title: "Valid Parentheses",
            topic: { name: "Stack" },
          },
          completedAt: null,
          nextReviewDate: pastDate,
        },
      ]);

      const reminders = await getRevisionReminders("user-123");
      expect(reminders).toHaveLength(2);
      expect(reminders[0].title).toBe("Two Sum");
      expect(reminders[0].topicName).toBe("Arrays");
      expect(reminders[0].daysSince).toBeGreaterThanOrEqual(3);
      expect(reminders[1].daysSince).toBe(0);
    });

    it("should return empty list when no stale problems exist", async () => {
      mockPrisma.progress.findMany.mockResolvedValue([]);
      const reminders = await getRevisionReminders("user-123");
      expect(reminders).toEqual([]);
    });
  });

  describe("getWeakTopics", () => {
    it("should compute weakness scores correctly for topics", async () => {
      const past = new Date(Date.now() - 1000 * 60 * 60 * 24);
      mockPrisma.topic.findMany.mockResolvedValue([
        {
          id: "t1",
          name: "Dynamic Programming",
          problems: [
            {
              id: "p1",
              progress: [
                {
                  status: "DONE",
                  timeSpent: 60,
                  nextReviewDate: past,
                },
              ],
            },
            {
              id: "p2",
              progress: [],
            },
          ],
        },
        {
          id: "t2",
          name: "Arrays",
          problems: [
            {
              id: "p3",
              progress: [
                {
                  status: "DONE",
                  timeSpent: 15,
                  nextReviewDate: null,
                },
              ],
            },
          ],
        },
      ]);

      mockPrisma.progress.findMany.mockResolvedValue([
        {
          problem: {
            topicId: "t3",
            topic: { name: "Graphs" },
          },
        },
      ]);

      const weakTopics = await getWeakTopics("user-123");
      expect(Array.isArray(weakTopics)).toBe(true);
      expect(weakTopics.length).toBeGreaterThanOrEqual(2);
      expect(weakTopics[0]).toHaveProperty("weaknessScore");
      expect(weakTopics[0]).toHaveProperty("masteryScore");
    });
  });

  describe("getMasteryStats", () => {
    it("should calculate mastery percentages and handle various difficulty weights", async () => {
      const now = new Date();
      mockPrisma.topic.findMany.mockResolvedValue([
        {
          name: "Trees",
          problems: [
            {
              difficulty: "EASY",
              progress: [
                {
                  status: "DONE",
                  timeSpent: 15,
                  completedAt: now.toISOString(),
                  nextReviewDate: new Date(now.getTime() + 10000000),
                },
              ],
            },
            {
              difficulty: "MEDIUM",
              progress: [
                {
                  status: "DONE",
                  timeSpent: 40,
                  completedAt: null,
                  nextReviewDate: new Date(now.getTime() - 10000),
                },
              ],
            },
            {
              difficulty: "HARD",
              progress: [
                {
                  status: "TODO",
                  timeSpent: 0,
                  completedAt: null,
                  nextReviewDate: null,
                },
              ],
            },
          ],
        },
      ]);

      const stats = await getMasteryStats("user-123");
      expect(stats).toHaveLength(1);
      expect(stats[0].subject).toBe("Trees");
      expect(stats[0].solved).toBe(2);
      expect(stats[0].total).toBe(3);
      expect(stats[0].A).toBeGreaterThanOrEqual(0);
      expect(stats[0].A).toBeLessThanOrEqual(100);
    });

    it("should handle topics with 0 problems", async () => {
      mockPrisma.topic.findMany.mockResolvedValue([
        {
          name: "Empty Topic",
          problems: [],
        },
      ]);

      const stats = await getMasteryStats("user-123");
      expect(stats).toHaveLength(1);
      expect(stats[0].A).toBe(0);
      expect(stats[0].solved).toBe(0);
    });
  });

  describe("getDailyProblem", () => {
    it("should return a revision problem if reviews are due", async () => {
      mockPrisma.progress.findMany.mockResolvedValueOnce([
        {
          problem: {
            id: "prob-1",
            title: "Invert Binary Tree",
            difficulty: "EASY",
            link: "https://leetcode.com/problems/invert-binary-tree/",
            topicId: "top-1",
            topic: { name: "Trees" },
          },
        },
      ]);

      const result = await getDailyProblem("user-1");
      expect(result).not.toBeNull();
      expect(result?.source).toBe("REVISION");
      expect(result?.problem.id).toBe("prob-1");
      expect(result?.plan?.mode).toBe("RETENTION_FIRST");
    });

    it("should return weakness-first problem if no overdue reviews exist and there are unsolved problems", async () => {
      // 1st call for dueForReview -> empty
      mockPrisma.progress.findMany.mockResolvedValueOnce([]);

      // topic.findMany for topics
      mockPrisma.topic.findMany.mockResolvedValue([
        {
          id: "top-1",
          name: "Dynamic Programming",
          problems: [
            {
              id: "prob-dp-1",
              title: "Climbing Stairs",
              difficulty: "EASY",
              link: "https://leetcode.com/problems/climbing-stairs",
              progress: [{ status: "DONE", timeSpent: 30, nextReviewDate: null }],
            },
            {
              id: "prob-dp-2",
              title: "Coin Change",
              difficulty: "MEDIUM",
              link: "https://leetcode.com/problems/coin-change",
              progress: [{ status: "TODO" }],
            },
          ],
        },
      ]);

      // progress.findMany for getWeakTopics
      mockPrisma.progress.findMany.mockResolvedValueOnce([]);

      const result = await getDailyProblem("user-1");
      expect(result).not.toBeNull();
      expect(result?.source).toBe("WEAKNESS");
      expect(result?.problem).toBeDefined();
    });

    it("should return null if all problems are completed", async () => {
      mockPrisma.progress.findMany.mockResolvedValueOnce([]); // dueForReview
      mockPrisma.topic.findMany.mockResolvedValue([
        {
          id: "top-1",
          name: "Arrays",
          problems: [
            {
              id: "prob-1",
              title: "Two Sum",
              progress: [{ status: "DONE", timeSpent: 10 }],
            },
          ],
        },
      ]);
      mockPrisma.progress.findMany.mockResolvedValueOnce([]); // getWeakTopics
      mockPrisma.progress.findMany.mockResolvedValueOnce([
        { problemId: "prob-1", status: "DONE" },
      ]); // userProgress

      const result = await getDailyProblem("user-1");
      expect(result).toBeNull();
    });
  });

  describe("getInterviewReadinessIndex", () => {
    it("should return Not Ready for user with 0 progress", async () => {
      mockPrisma.progress.findMany.mockResolvedValue([]);
      mockPrisma.topic.findMany.mockResolvedValue([{ problems: [{ id: "p1" }] }]);

      const res = await getInterviewReadinessIndex("u1");
      expect(res.score).toBe(0);
      expect(res.level).toBe("Not Ready");
    });

    it("should calculate score, level, and breakdown metrics accurately", async () => {
      const now = new Date();
      mockPrisma.progress.findMany.mockResolvedValue([
        {
          problemId: "p1",
          timeSpent: 30,
          completedAt: now.toISOString(),
          nextReviewDate: new Date(now.getTime() + 1000000),
          problem: { id: "p1", difficulty: "MEDIUM" },
        },
        {
          problemId: "p2",
          timeSpent: 50,
          completedAt: now.toISOString(),
          nextReviewDate: new Date(now.getTime() + 1000000),
          problem: { id: "p2", difficulty: "HARD" },
        },
      ]);
      mockPrisma.topic.findMany.mockResolvedValue([
        { id: "t1", problems: [{ id: "p1" }, { id: "p2" }] },
      ]);

      const res = await getInterviewReadinessIndex("u1");
      expect(res.score).toBeGreaterThan(0);
      expect(["Interview Ready", "Nearly Ready", "Developing", "Foundational"]).toContain(
        res.level
      );
      expect(res.metrics.timedMediumHard).toBe(100);
      expect(res.metrics.revisionReliability).toBe(100);
    });
  });

  describe("getTimeAnalytics", () => {
    it("should return default metrics when no solved problems exist", async () => {
      mockPrisma.progress.findMany.mockResolvedValue([]);
      const res = await getTimeAnalytics("u1");
      expect(res.totalTimeMinutes).toBe(0);
      expect(res.totalSolved).toBe(0);
      expect(res.speedInsights).toEqual([]);
    });

    it("should compute average times, fastest/slowest problems, and trends", async () => {
      const now = new Date();
      mockPrisma.progress.findMany.mockResolvedValue([
        {
          timeSpent: 10,
          completedAt: now.toISOString(),
          problem: {
            title: "Easy 1",
            difficulty: "EASY",
            topic: { name: "Arrays" },
          },
        },
        {
          timeSpent: 45,
          completedAt: now.toISOString(),
          problem: {
            title: "Hard 1",
            difficulty: "HARD",
            topic: { name: "Dynamic Programming" },
          },
        },
      ]);

      const res = await getTimeAnalytics("u1");
      expect(res.totalSolved).toBe(2);
      expect(res.totalTimeMinutes).toBe(55);
      expect(res.avgByDifficulty.EASY).toBe(10);
      expect(res.avgByDifficulty.HARD).toBe(45);
      expect(res.fastest?.title).toBe("Easy 1");
      expect(res.slowest?.title).toBe("Hard 1");
      expect(res.weeklyTrends.length).toBe(8);
    });
  });

  describe("getAchievements", () => {
    it("should compute badges and milestone progress", async () => {
      mockPrisma.progress.findMany.mockResolvedValue([
        {
          problemId: "p1",
          status: "DONE",
          problem: { difficulty: "EASY", topic: { id: "t1", name: "Arrays" } },
        },
        {
          problemId: "p2",
          status: "DONE",
          problem: { difficulty: "MEDIUM", topic: { id: "t1", name: "Arrays" } },
        },
      ]);
      mockPrisma.streak.findFirst.mockResolvedValue({
        currentStreak: 5,
        longestStreak: 8,
      });
      mockPrisma.topic.findMany.mockResolvedValue([
        {
          id: "t1",
          name: "Arrays",
          problems: [{ id: "p1" }, { id: "p2" }],
        },
      ]);

      const res = await getAchievements("u1");
      expect(res.stats.totalSolved).toBe(2);
      expect(res.stats.currentStreak).toBe(5);
      expect(res.stats.completedTopics).toBe(1);

      const firstBlood = res.badges.find((b) => b.id === "first-blood");
      expect(firstBlood?.unlocked).toBe(true);

      const streak7 = res.badges.find((b) => b.id === "streak-7");
      expect(streak7?.unlocked).toBe(true);

      const topicMaster = res.badges.find((b) => b.id === "topic-master");
      expect(topicMaster?.unlocked).toBe(true);
    });
  });

  describe("getWeeklyReport", () => {
    it("should generate weekly progress summaries and trends", async () => {
      const now = new Date();
      mockPrisma.progress.findMany.mockResolvedValue([
        {
          problemId: "p1",
          status: "DONE",
          timeSpent: 25,
          completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          problem: { difficulty: "EASY", topic: { name: "Arrays" } },
        },
      ]);
      mockPrisma.streak.findFirst.mockResolvedValue({
        currentStreak: 3,
        longestStreak: 4,
      });
      mockPrisma.topic.findMany.mockResolvedValue([
        {
          name: "Arrays",
          problems: [{ id: "p1" }],
        },
      ]);

      const res = await getWeeklyReport("u1");
      expect(res.thisWeek.solved).toBe(1);
      expect(res.thisWeek.timeMinutes).toBe(25);
      expect(res.summary).toContain("Great week");
      expect(res.strongTopics.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle week with 0 solves gracefully", async () => {
      mockPrisma.progress.findMany.mockResolvedValue([]);
      mockPrisma.streak.findFirst.mockResolvedValue(null);
      mockPrisma.topic.findMany.mockResolvedValue([]);

      const res = await getWeeklyReport("u1");
      expect(res.thisWeek.solved).toBe(0);
      expect(res.summary).toContain("No problems solved this week");
    });
  });
});
