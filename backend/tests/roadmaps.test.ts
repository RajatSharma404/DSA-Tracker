import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

const mockPrisma = vi.hoisted(() => ({
  problem: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
  progress: { findMany: vi.fn() },
  topic: { findFirst: vi.fn(), create: vi.fn() },
}));
vi.mock("../db/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../middlewares/auth", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: "u1", role: "USER" };
    next();
  },
}));

import router, { loadCatalog } from "../routes/roadmaps.routes";

const app = express();
app.use(express.json());
app.use("/api", router);

describe("roadmap catalog data", () => {
  const catalog = loadCatalog();

  it("ships at least 20 established roadmaps with well-formed problems", () => {
    expect(catalog.length).toBeGreaterThanOrEqual(20);
    for (const r of catalog) {
      const problems = r.sections.flatMap((s) => s.problems);
      expect(problems.length).toBe(r.problemCount);
      expect(problems.length).toBeGreaterThan(0);
      for (const p of problems) {
        expect(p.slug).toMatch(/^[a-z0-9-]+$/);
        expect(["EASY", "MEDIUM", "HARD"]).toContain(p.difficulty);
      }
    }
  });

  it("has the well-known lists at their canonical sizes", () => {
    const size = (slug: string) => catalog.find((r) => r.slug === slug)?.problemCount;
    expect(size("blind-75")).toBe(75);
    expect(size("neetcode-150")).toBe(150);
    expect(size("grind-75")).toBe(75);
    expect(size("lc-leetcode-75")).toBe(75);
    expect(size("lc-top-interview-150")).toBe(150);
  });
});

describe("roadmap routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.problem.findMany.mockResolvedValue([
      { id: "p-two-sum", link: "https://leetcode.com/problems/two-sum/" },
      { id: "p-3sum", link: "https://leetcode.com/problems/3sum/" },
    ]);
    mockPrisma.progress.findMany.mockResolvedValue([{ problemId: "p-two-sum" }]);
  });

  it("lists roadmaps with the user's solved counts", async () => {
    const res = await request(app).get("/api/roadmaps");
    expect(res.status).toBe(200);
    const blind = res.body.find((r: any) => r.slug === "blind-75");
    expect(blind.solved).toBe(1);
    expect(blind.byDifficulty.EASY + blind.byDifficulty.MEDIUM + blind.byDifficulty.HARD).toBe(75);
  });

  it("returns a roadmap with per-problem status and tracker links", async () => {
    const res = await request(app).get("/api/roadmaps/blind-75");
    expect(res.status).toBe(200);
    const all = res.body.sections.flatMap((s: any) => s.problems);
    expect(all.find((p: any) => p.slug === "two-sum")).toMatchObject({ solved: true, problemId: "p-two-sum" });
    expect(all.find((p: any) => p.slug === "3sum")).toMatchObject({ solved: false, problemId: "p-3sum" });
    expect((await request(app).get("/api/roadmaps/nope")).status).toBe(404);
  });

  it("opens a roadmap problem, creating it when the tracker doesn't have it", async () => {
    mockPrisma.problem.findFirst.mockResolvedValue(null);
    mockPrisma.topic.findFirst.mockResolvedValue({ id: "misc" });
    mockPrisma.problem.create.mockResolvedValue({ id: "new-id" });
    const res = await request(app).post("/api/roadmaps/problems/two-sum/open");
    expect(res.status).toBe(200);
    expect(res.body.problemId).toBe("new-id");
    expect((await request(app).post("/api/roadmaps/problems/not-a-real-thing/open")).status).toBe(404);
  });
});
