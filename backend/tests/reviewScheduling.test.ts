import { describe, it, expect } from "vitest";
import { planBacklog, scheduleFirstSolve, scheduleSolve, BACKLOG_PER_DAY } from "../services/reviewScheduling";

const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-11-14T12:00:00Z");

describe("scheduleFirstSolve", () => {
  it("puts a fresh solve in Review with a day-scale interval", () => {
    const s = scheduleFirstSolve(now);
    expect(s.state).toBe("REVIEW");
    expect(s.stability).toBeGreaterThan(0);
    expect(s.interval).toBeGreaterThanOrEqual(1);
    expect(s.nextReviewDate.getTime()).toBeGreaterThanOrEqual(now.getTime() + DAY);
    expect(s.lastReviewedAt).toEqual(now);
  });
});

describe("scheduleSolve", () => {
  it("treats a re-solve of a scheduled problem as a review that grows stability", () => {
    const first = scheduleFirstSolve(new Date(now.getTime() - 10 * DAY));
    const again = scheduleSolve(
      { ...first, completedAt: null } as never,
      now,
    );
    expect(again.stability).toBeGreaterThan(first.stability);
    expect(again.repetitions).toBeGreaterThan(first.repetitions);
    expect(again.nextReviewDate.getTime()).toBeGreaterThan(now.getTime());
  });

  it("starts a new card when there is no schedule yet", () => {
    expect(scheduleSolve(null, now).stability).toBeCloseTo(scheduleFirstSolve(now).stability);
  });
});

describe("planBacklog", () => {
  it("spreads overdue solves so at most BACKLOG_PER_DAY are due each day, most overdue first", () => {
    const rows = Array.from({ length: 35 }, (_, i) => ({
      id: `p${i}`,
      solvedAt: new Date(now.getTime() - (200 - i) * DAY),
    }));
    const plan = planBacklog(rows, now);
    const dueNow = plan.filter((p) => p.nextReviewDate.getTime() <= now.getTime());
    expect(dueNow).toHaveLength(BACKLOG_PER_DAY);
    // The oldest solves are the first to come due.
    expect(dueNow.map((p) => p.id)).toEqual(rows.slice(0, BACKLOG_PER_DAY).map((r) => r.id));
    const days = new Map<string, number>();
    for (const p of plan) {
      const k = p.nextReviewDate.toDateString();
      days.set(k, (days.get(k) ?? 0) + 1);
    }
    expect(Math.max(...days.values())).toBeLessThanOrEqual(BACKLOG_PER_DAY);
  });

  it("leaves recent solves on their own FSRS date", () => {
    const solvedAt = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const [p] = planBacklog([{ id: "recent", solvedAt }], now);
    expect(p.nextReviewDate).toEqual(scheduleFirstSolve(solvedAt).nextReviewDate);
  });

  it("treats undated solves as old enough to review", () => {
    const [p] = planBacklog([{ id: "undated", solvedAt: null }], now);
    expect(p.nextReviewDate.getTime()).toBeLessThanOrEqual(now.getTime());
  });
});
