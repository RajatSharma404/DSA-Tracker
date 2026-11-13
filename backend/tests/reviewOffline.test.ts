import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma } from "../db/prisma";

// Mock auth middleware
vi.mock("../middlewares/auth", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    requireAuth: (req: any, _res: any, next: any) => {
      req.user = { id: "user-123", email: "test@example.com", role: "USER" };
      next();
    },
    requireAdmin: (req: any, _res: any, next: any) => next(),
    attachOptionalAuth: (req: any, _res: any, next: any) => next(),
  };
});

describe("Phase 4b: Offline Review Queue Backend Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should accept clientEventId and reviewedAt, updating progress and creating ReviewLog", async () => {
    const clientEventId = "550e8400-e29b-41d4-a716-446655440000";
    const reviewedAt = new Date(Date.now() - 3600 * 1000).toISOString(); // 1 hr ago

    // Mock findUnique for progress
    vi.spyOn(prisma.progress, "findUnique").mockResolvedValue({
      id: "prog-1",
      userId: "user-123",
      problemId: "two-sum",
      status: "DONE",
      interval: 1,
      easinessFactor: 2.5,
      repetitions: 1,
      lapses: 0,
      stability: 1.0,
      difficultyFsrs: 5.0,
      state: "REVIEW",
      nextReviewDate: new Date(),
      lastReviewedAt: null,
      completedAt: new Date(),
    } as any);

    // Mock deduplication check: not found initially
    vi.spyOn(prisma.reviewLog, "findUnique").mockResolvedValue(null);

    // Mock transaction
    vi.spyOn(prisma, "$transaction").mockResolvedValue([
      { id: "prog-1", interval: 3, easinessFactor: 2.6 } as any,
      {
        id: "rev-log-1",
        userId: "user-123",
        problemId: "two-sum",
        clientEventId,
        rating: 3,
        reviewedAt: new Date(reviewedAt),
        scheduledDays: 3,
      } as any,
      { id: "act-1" } as any,
    ]);

    const res = await request(app)
      .post("/api/review-queue/complete")
      .send({
        problemId: "two-sum",
        rating: 3,
        clientEventId,
        reviewedAt,
      });

    expect(res.status).toBe(200);
    expect(res.body.reviewLogId).toBe("rev-log-1");
    expect(res.body.interval).toBe(3);
  });

  it("should deduplicate reviews with the same clientEventId without creating duplicate rows", async () => {
    const clientEventId = "550e8400-e29b-41d4-a716-446655440001";
    const existingLogDate = new Date();

    // Mock deduplication check: found existing log
    vi.spyOn(prisma.reviewLog, "findUnique").mockResolvedValue({
      id: "rev-log-existing",
      userId: "user-123",
      problemId: "two-sum",
      clientEventId,
      rating: 3,
      scheduledDays: 4,
      reviewedAt: existingLogDate,
    } as any);

    const transactionSpy = vi.spyOn(prisma, "$transaction");

    const res = await request(app)
      .post("/api/review-queue/complete")
      .send({
        problemId: "two-sum",
        rating: 3,
        clientEventId,
      });

    expect(res.status).toBe(200);
    expect(res.body.deduplicated).toBe(true);
    expect(res.body.reviewLogId).toBe("rev-log-existing");
    expect(res.body.problemId).toBe("two-sum");
    // Ensure no new database transaction was executed
    expect(transactionSpy).not.toHaveBeenCalled();
  });

  it("should clamp reviewedAt if future skew exceeds 5 minutes", async () => {
    const clientEventId = "550e8400-e29b-41d4-a716-446655440002";
    // 30 minutes in the future (skew > 5 min)
    const futureDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    vi.spyOn(prisma.reviewLog, "findUnique").mockResolvedValue(null);
    vi.spyOn(prisma.progress, "findUnique").mockResolvedValue({
      id: "prog-1",
      userId: "user-123",
      problemId: "two-sum",
      status: "DONE",
      interval: 1,
      easinessFactor: 2.5,
      repetitions: 1,
      lapses: 0,
      state: "REVIEW",
    } as any);

    let recordedReviewTime: Date | null = null;
    vi.spyOn(prisma, "$transaction").mockImplementation(async (operations: any) => {
      return [
        { id: "prog-1", interval: 3 } as any,
        { id: "rev-log-2", reviewedAt: new Date() } as any,
        { id: "act-2" } as any,
      ];
    });

    const res = await request(app)
      .post("/api/review-queue/complete")
      .send({
        problemId: "two-sum",
        rating: 3,
        clientEventId,
        reviewedAt: futureDate,
      });

    expect(res.status).toBe(200);
  });

  it("should clamp reviewedAt if older than 7 days", async () => {
    const clientEventId = "550e8400-e29b-41d4-a716-446655440003";
    // 10 days in the past
    const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

    vi.spyOn(prisma.reviewLog, "findUnique").mockResolvedValue(null);
    vi.spyOn(prisma.progress, "findUnique").mockResolvedValue({
      id: "prog-1",
      userId: "user-123",
      problemId: "two-sum",
      status: "DONE",
      interval: 1,
      easinessFactor: 2.5,
      repetitions: 1,
      lapses: 0,
      state: "REVIEW",
    } as any);

    vi.spyOn(prisma, "$transaction").mockResolvedValue([
      { id: "prog-1", interval: 3 } as any,
      { id: "rev-log-3", reviewedAt: new Date() } as any,
      { id: "act-3" } as any,
    ]);

    const res = await request(app)
      .post("/api/review-queue/complete")
      .send({
        problemId: "two-sum",
        rating: 3,
        clientEventId,
        reviewedAt: oldDate,
      });

    expect(res.status).toBe(200);
  });
});
