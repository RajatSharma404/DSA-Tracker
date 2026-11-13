import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import {
  parseFeatureFlags,
  reloadFeatureFlags,
  getFeatureFlags,
  isFeatureEnabled,
} from "../features";
import { getAchievements } from "../services";
import { prisma } from "../db/prisma";

// Mock requireAuth to inject test user
vi.mock("../middlewares/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../middlewares/auth")>();
  return {
    ...actual,
    requireAuth: (req: any, _res: any, next: any) => {
      req.user = { id: "test-user-phase5", email: "phase5@dsatracker.internal", role: "USER" };
      next();
    },
  };
});

describe("Phase 5: Feature Flags & Scope Gating Suite", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.FEATURE_PVP;
    delete process.env.FEATURE_ARENA;
    delete process.env.FEATURE_INTERVIEWS;
    delete process.env.FEATURE_ALGOTRACER;
    reloadFeatureFlags();
  });

  afterEach(() => {
    process.env = originalEnv;
    reloadFeatureFlags();
  });

  describe("5.1: Flag Parsing & Defaults", () => {
    it("should enforce specified defaults when no env vars are present", () => {
      const flags = parseFeatureFlags({});
      expect(flags).toEqual({
        pvp: false,
        arena: false,
        interviews: false,
        algotracer: true,
      });
    });

    it("should parse 'true' and 'false' string values case-insensitively", () => {
      const flags = parseFeatureFlags({
        FEATURE_PVP: "TRUE",
        FEATURE_ARENA: "1",
        FEATURE_INTERVIEWS: "false",
        FEATURE_ALGOTRACER: "FALSE",
      });

      expect(flags).toEqual({
        pvp: true,
        arena: true,
        interviews: false,
        algotracer: false,
      });
    });

    it("should fail startup with a clear error on invalid boolean env values", () => {
      expect(() => {
        parseFeatureFlags({
          FEATURE_PVP: "not-a-boolean",
        });
      }).toThrow(/Invalid environment variable for FEATURE_PVP: must be 'true' or 'false'/);
    });

    it("should expose GET /api/features returning active flags", async () => {
      process.env.FEATURE_ARENA = "true";
      reloadFeatureFlags();

      const app = createApp();
      const res = await request(app).get("/api/features");

      expect(res.status).toBe(200);
      expect(res.header["cache-control"]).toContain("max-age=60");
      expect(res.body).toEqual({
        pvp: false,
        arena: true,
        interviews: false,
        algotracer: true,
      });
    });
  });

  describe("5.2: Backend Gating Middleware (requireFeature)", () => {
    it("should block /api/challenges with 404 FEATURE_DISABLED when arena is disabled", async () => {
      process.env.FEATURE_ARENA = "false";
      reloadFeatureFlags();

      const app = createApp();
      const res = await request(app)
        .post("/api/challenges/start")
        .send({ topicId: "dummy-topic", duration: 30 });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: {
          code: "FEATURE_DISABLED",
          message: "This feature is currently disabled.",
        },
      });
    });

    it("should allow /api/challenges when arena is enabled", async () => {
      process.env.FEATURE_ARENA = "true";
      reloadFeatureFlags();

      // Mock prisma.problem.findMany to return empty array
      vi.spyOn(prisma.problem, "findMany").mockResolvedValueOnce([]);

      const app = createApp();
      const res = await request(app)
        .post("/api/challenges/start")
        .send({ topicId: "dummy-topic", duration: 30 });

      // Should bypass the 404 feature gate and hit handler logic (which returns 404 "No problems found for this topic")
      expect(res.body.error?.code).not.toBe("FEATURE_DISABLED");
    });

    it("should block /api/interviews with 404 FEATURE_DISABLED when interviews are disabled", async () => {
      process.env.FEATURE_INTERVIEWS = "false";
      reloadFeatureFlags();

      const app = createApp();
      const res = await request(app).get("/api/interviews");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: {
          code: "FEATURE_DISABLED",
          message: "This feature is currently disabled.",
        },
      });
    });

    it("should block /api/ai/trace with 404 FEATURE_DISABLED when algotracer is disabled", async () => {
      process.env.FEATURE_ALGOTRACER = "false";
      reloadFeatureFlags();

      const app = createApp();
      const res = await request(app)
        .post("/api/ai/trace")
        .send({ problemId: "two-sum", code: "function test() {}" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: {
          code: "FEATURE_DISABLED",
          message: "This feature is currently disabled.",
        },
      });
    });
  });

  describe("5.4: Achievements Feature-Flag Coupling", () => {
    it("should exclude flagged badges from total count when features are disabled", async () => {
      process.env.FEATURE_ARENA = "false";
      process.env.FEATURE_PVP = "false";
      process.env.FEATURE_INTERVIEWS = "false";
      reloadFeatureFlags();

      vi.spyOn(prisma.progress, "findMany").mockResolvedValueOnce([]);
      vi.spyOn(prisma.streak, "findFirst").mockResolvedValueOnce(null);
      vi.spyOn(prisma.topic, "findMany").mockResolvedValueOnce([]);

      const result = await getAchievements("test-user-phase5");

      // 19 core badges, 0 parked badges
      expect(result.stats.totalBadges).toBe(19);
      expect(result.badges.some((b) => b.id === "arena-champion")).toBe(false);
      expect(result.badges.some((b) => b.id === "pvp-gladiator")).toBe(false);
      expect(result.badges.some((b) => b.id === "mock-interview-ace")).toBe(false);
    });

    it("should include flagged badges in computed list and total count when features are enabled", async () => {
      process.env.FEATURE_ARENA = "true";
      process.env.FEATURE_PVP = "true";
      process.env.FEATURE_INTERVIEWS = "true";
      reloadFeatureFlags();

      vi.spyOn(prisma.progress, "findMany").mockResolvedValueOnce([]);
      vi.spyOn(prisma.streak, "findFirst").mockResolvedValueOnce(null);
      vi.spyOn(prisma.topic, "findMany").mockResolvedValueOnce([]);

      const result = await getAchievements("test-user-phase5");

      // 19 core badges + 3 enabled parked badges = 22 badges
      expect(result.stats.totalBadges).toBe(22);
      expect(result.badges.some((b) => b.id === "arena-champion")).toBe(true);
      expect(result.badges.some((b) => b.id === "pvp-gladiator")).toBe(true);
      expect(result.badges.some((b) => b.id === "mock-interview-ace")).toBe(true);
    });
  });
});

