import { describe, it, expect, beforeEach, vi } from "vitest";
import "fake-indexeddb/auto";
import {
  enqueuePendingReview,
  getPendingReviews,
  getPendingReviewsCount,
  removePendingReview,
  clearOfflineStores,
  saveReviewQueueSnapshot,
  getCachedReviewQueue,
} from "../db";
import { safeSignOut } from "@/lib/auth/safeSignOut";
import * as nextAuth from "next-auth/react";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
  useSession: vi.fn(),
}));

describe("Phase 4b: Offline Storage & Safe Sign-Out", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearOfflineStores();
  });

  it("should snapshot and retrieve review queue items from IndexedDB", async () => {
    await saveReviewQueueSnapshot([
      {
        problemId: "two-sum",
        title: "Two Sum",
        difficulty: "EASY",
        topicName: "Arrays",
        link: "https://leetcode.com/problems/two-sum",
      },
      {
        problemId: "3sum",
        title: "3Sum",
        difficulty: "MEDIUM",
        topicName: "Two Pointers",
      },
    ]);

    const cached = await getCachedReviewQueue();
    expect(cached).toHaveLength(2);
    const problemIds = cached.map((c) => c.problemId);
    expect(problemIds).toContain("two-sum");
    expect(problemIds).toContain("3sum");
  });

  it("should enqueue pending reviews in outbox and retrieve them in chronological order", async () => {
    const t1 = "2026-11-12T10:00:00.000Z";
    const t2 = "2026-11-12T10:05:00.000Z";

    await enqueuePendingReview({
      clientEventId: "event-2",
      problemId: "3sum",
      rating: 4,
      reviewedAt: t2,
    });

    await enqueuePendingReview({
      clientEventId: "event-1",
      problemId: "two-sum",
      rating: 3,
      reviewedAt: t1,
    });

    const pending = await getPendingReviews();
    expect(pending).toHaveLength(2);
    // Should be sorted by reviewedAt ascending (t1 first, then t2)
    expect(pending[0].clientEventId).toBe("event-1");
    expect(pending[1].clientEventId).toBe("event-2");

    const count = await getPendingReviewsCount();
    expect(count).toBe(2);

    // Remove event-1
    await removePendingReview("event-1");
    const remaining = await getPendingReviews();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].clientEventId).toBe("event-2");
  });

  it("should warn on sign-out if outbox is non-empty and abort if user cancels", async () => {
    await enqueuePendingReview({
      clientEventId: "event-warn",
      problemId: "lru-cache",
      rating: 2,
      reviewedAt: new Date().toISOString(),
    });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    const result = await safeSignOut();
    expect(confirmSpy).toHaveBeenCalled();
    expect(result).toBe(false);
    expect(nextAuth.signOut).not.toHaveBeenCalled();

    // Data should still be preserved
    const count = await getPendingReviewsCount();
    expect(count).toBe(1);
  });

  it("should clear stores and proceed with signOut if outbox is empty or user confirms discard", async () => {
    await enqueuePendingReview({
      clientEventId: "event-confirm",
      problemId: "lru-cache",
      rating: 2,
      reviewedAt: new Date().toISOString(),
    });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    const result = await safeSignOut();
    expect(confirmSpy).toHaveBeenCalled();
    expect(result).toBe(true);
    expect(nextAuth.signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });

    // Stores must be cleared
    const count = await getPendingReviewsCount();
    expect(count).toBe(0);
  });
});
