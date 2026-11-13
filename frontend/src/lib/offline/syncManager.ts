import {
  getPendingReviews,
  removePendingReview,
  getPendingReviewsCount,
  PendingReviewEvent,
} from "./db";
import { dsaApi } from "../api";

export type SyncState = "synced" | "syncing" | "offline" | "pending";

type SyncListener = (state: SyncState, pendingCount: number) => void;

class OutboxSyncManager {
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initEventListeners();
    }
  }

  private initEventListeners() {
    window.addEventListener("online", () => {
      this.notify();
      this.flushOutbox();
    });

    window.addEventListener("offline", () => {
      this.notify();
    });

    window.addEventListener("focus", () => {
      if (navigator.onLine) {
        this.flushOutbox();
      }
    });

    // 60-second periodic flush while online
    this.timer = setInterval(() => {
      if (navigator.onLine) {
        this.flushOutbox();
      }
    }, 60_000);

    // Initial check
    this.flushOutbox();
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.getCurrentStatus().then(({ state, count }) => listener(state, count));
    return () => this.listeners.delete(listener);
  }

  public async getCurrentStatus(): Promise<{ state: SyncState; count: number }> {
    if (typeof window === "undefined") {
      return { state: "synced", count: 0 };
    }
    const isOnline = navigator.onLine;
    const count = await getPendingReviewsCount();

    if (!isOnline) return { state: "offline", count };
    if (this.isSyncing) return { state: "syncing", count };
    if (count > 0) return { state: "pending", count };
    return { state: "synced", count: 0 };
  }

  private async notify() {
    const { state, count } = await this.getCurrentStatus();
    this.listeners.forEach((fn) => fn(state, count));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("dsa-sync-status", { detail: { state, count } }),
      );
    }
  }

  /**
   * Flush all items in outbox one by one in reviewedAt order.
   */
  public async flushOutbox(): Promise<{ processed: number; remaining: number }> {
    if (this.isSyncing || typeof window === "undefined" || !navigator.onLine) {
      const count = await getPendingReviewsCount();
      return { processed: 0, remaining: count };
    }

    this.isSyncing = true;
    this.notify();

    let processedCount = 0;
    try {
      const items = await getPendingReviews();
      for (const item of items) {
        try {
          await dsaApi.completeReview(item.problemId, item.rating, {
            clientEventId: item.clientEventId,
            reviewedAt: item.reviewedAt,
            rating: item.rating,
          });

          // Successfully processed or deduplicated: remove from outbox
          await removePendingReview(item.clientEventId);
          processedCount++;
        } catch (err: any) {
          const status = err?.response?.status;

          // Drop item on permanent 4xx (e.g. 404 Problem not found or 400 Bad Request)
          if (status && status >= 400 && status < 500) {
            console.warn(
              `[Outbox] Dropping permanent 4xx failure (${status}) for review ${item.clientEventId}:`,
              err?.response?.data || err.message,
            );
            await removePendingReview(item.clientEventId);
            continue;
          }

          // Stop processing on 5xx or network disconnect to retry later
          console.warn("[Outbox] Transient sync error, halting outbox queue:", err.message);
          break;
        }
      }
    } finally {
      this.isSyncing = false;
      this.notify();
    }

    const remaining = await getPendingReviewsCount();
    return { processed: processedCount, remaining };
  }

  /**
   * Progressive enhancement: register Service Worker Background Sync where supported
   */
  public async requestBackgroundSync(): Promise<void> {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "SyncManager" in window
    ) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if ("sync" in reg) {
          await (reg as any).sync.register("sync-reviews");
        }
      } catch (err) {
        console.warn("[BackgroundSync] Registration skipped:", err);
      }
    }
  }

  public destroy() {
    if (this.timer) clearInterval(this.timer);
    this.listeners.clear();
  }
}

export const syncManager = new OutboxSyncManager();

