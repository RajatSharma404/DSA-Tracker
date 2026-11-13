import { describe, it, expect } from "vitest";
import {
  recallAt,
  daysToThreshold,
  estimateStability,
  buildRetentionReport,
  AT_RISK_THRESHOLD,
} from "../services/retentionService";

const DAY = 86_400_000;
const now = new Date("2026-11-13T12:00:00Z");

describe("retentionService", () => {
  it("recall is 1 at t=0 and 0.9 at t=S", () => {
    expect(recallAt(0, 5)).toBe(1);
    expect(recallAt(5, 5)).toBeCloseTo(0.9, 5);
  });

  it("daysToThreshold inverts recallAt", () => {
    const s = 4;
    expect(recallAt(daysToThreshold(s), s)).toBeCloseTo(AT_RISK_THRESHOLD, 6);
  });

  it("scheduled intervals and easier problems are more stable", () => {
    expect(estimateStability({ interval: 20, easinessFactor: 2.5, difficulty: "HARD" })).toBe(20);
    expect(estimateStability({ interval: 0, easinessFactor: 2.5, difficulty: "EASY" })).toBeGreaterThan(
      estimateStability({ interval: 0, easinessFactor: 2.5, difficulty: "HARD" }),
    );
  });

  it("prefers real FSRS stability and lastReviewedAt when present", () => {
    expect(estimateStability({ interval: 3, easinessFactor: 2.5, difficulty: "HARD", stability: 42 })).toBe(42);
    const report = buildRetentionReport(
      [{ problemId: "x", title: "X", topic: "T", difficulty: "HARD", completedAt: new Date(now.getTime() - 300 * DAY), nextReviewDate: null, interval: 0, easinessFactor: 2.5, stability: 30, lastReviewedAt: now }],
      now,
      1,
    );
    expect(report.items[0].recall).toBe(1);
    expect(report.items[0].stabilityDays).toBe(30);
  });

  it("builds a sorted report with a monotonically decaying forecast", () => {
    const report = buildRetentionReport(
      [
        { problemId: "a", title: "Old Hard", topic: "DP", difficulty: "HARD", completedAt: new Date(now.getTime() - 40 * DAY), nextReviewDate: null, interval: 0, easinessFactor: 2.5 },
        { problemId: "b", title: "Fresh Easy", topic: "Arrays", difficulty: "EASY", completedAt: new Date(now.getTime() - 1 * DAY), nextReviewDate: null, interval: 0, easinessFactor: 2.5 },
        { problemId: "c", title: "No date", topic: "Arrays", difficulty: "EASY", completedAt: null, nextReviewDate: null, interval: 0, easinessFactor: 2.5 },
      ],
      now,
      14,
    );
    expect(report.total).toBe(2);
    expect(report.items[0].problemId).toBe("a");
    expect(report.atRiskNow).toBe(1);
    expect(report.forecast).toHaveLength(15);
    for (let i = 1; i < report.forecast.length; i++) {
      expect(report.forecast[i].averageRecall).toBeLessThanOrEqual(report.forecast[i - 1].averageRecall);
    }
    expect(report.topics[0].topic).toBe("DP");
  });
});
