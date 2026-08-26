"use client";

import { dsaApi } from "./api";
import { queryCache } from "./queryCache";
import { toast } from "sonner";
import { soundEffects } from "./soundEffects";

export interface QueuedMutation {
  id: string;
  type: "UPDATE_PROGRESS" | "TOGGLE_BOOKMARK";
  payload: any;
  timestamp: number;
}

const STORAGE_KEY = "dsa_offline_mutations";

class OfflineQueueManager {
  private queue: QueuedMutation[] = [];
  private isSyncing = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.loadQueue();
      window.addEventListener("online", () => this.replayQueue());
    }
  }

  private loadQueue() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
      window.dispatchEvent(
        new CustomEvent("dsa-offline-queue-changed", {
          detail: { count: this.queue.length },
        }),
      );
    } catch {
      // Storage quota fallback
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public enqueue(type: QueuedMutation["type"], payload: any) {
    const mutation: QueuedMutation = {
      id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      payload,
      timestamp: Date.now(),
    };
    this.queue.push(mutation);
    this.saveQueue();
  }

  public async replayQueue() {
    if (this.isSyncing || this.queue.length === 0) return;
    this.isSyncing = true;

    const count = this.queue.length;
    toast.info(`Connection restored. Syncing ${count} offline updates...`);

    const itemsToProcess = [...this.queue];
    this.queue = [];
    this.saveQueue();

    let successCount = 0;

    for (const item of itemsToProcess) {
      try {
        if (item.type === "UPDATE_PROGRESS") {
          await dsaApi.updateProgress(
            item.payload.problemId,
            item.payload.status,
            item.payload.timeSpent || 0,
          );
          successCount++;
        } else if (item.type === "TOGGLE_BOOKMARK") {
          await dsaApi.toggleBookmark(item.payload.problemId);
          successCount++;
        }
      } catch (err) {
        // If still failing, re-enqueue
        this.queue.push(item);
      }
    }

    this.saveQueue();
    this.isSyncing = false;

    if (successCount > 0) {
      queryCache.invalidate("");
      soundEffects.playSuccess();
      toast.success(`Successfully synchronized ${successCount} offline updates!`);
    }
  }
}

export const offlineQueue = new OfflineQueueManager();
