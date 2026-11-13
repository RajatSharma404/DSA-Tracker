import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface CachedReviewItem {
  problemId: string;
  title: string;
  difficulty: string;
  topicName: string;
  link?: string;
  notes?: string;
  gotchas?: string;
  timeComplexityTarget?: string;
  spaceComplexityTarget?: string;
  dueAt?: string;
  nextReviewDate?: string;
  interval?: number;
}

export interface PendingReviewEvent {
  clientEventId: string;
  problemId: string;
  rating: number; // 1: Again, 2: Hard, 3: Good, 4: Easy
  reviewedAt: string; // ISO string
  attempts?: number;
  lastAttemptAt?: string;
}

interface DsaTrackerOfflineDB extends DBSchema {
  reviewQueue: {
    key: string;
    value: CachedReviewItem;
  };
  pendingReviews: {
    key: string;
    value: PendingReviewEvent;
    indexes: { "by-reviewedAt": string };
  };
}

const DB_NAME = "dsa_tracker_offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DsaTrackerOfflineDB>> | null = null;

function getDb(): Promise<IDBPDatabase<DsaTrackerOfflineDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is only available in browser environments"));
  }

  if (!dbPromise) {
    dbPromise = openDB<DsaTrackerOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("reviewQueue")) {
          db.createObjectStore("reviewQueue", { keyPath: "problemId" });
        }
        if (!db.objectStoreNames.contains("pendingReviews")) {
          const store = db.createObjectStore("pendingReviews", { keyPath: "clientEventId" });
          store.createIndex("by-reviewedAt", "reviewedAt");
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Cache snapshot of due problems for offline review.
 */
export async function saveReviewQueueSnapshot(items: CachedReviewItem[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("reviewQueue", "readwrite");
  await tx.store.clear();
  for (const item of items) {
    await tx.store.put(item);
  }
  await tx.done;
}

/**
 * Retrieve cached review queue items.
 */
export async function getCachedReviewQueue(): Promise<CachedReviewItem[]> {
  try {
    const db = await getDb();
    return await db.getAll("reviewQueue");
  } catch {
    return [];
  }
}

/**
 * Enqueue a pending review into the outbox.
 */
export async function enqueuePendingReview(review: Omit<PendingReviewEvent, "attempts">): Promise<PendingReviewEvent> {
  const db = await getDb();
  const entry: PendingReviewEvent = {
    ...review,
    attempts: 0,
  };
  await db.put("pendingReviews", entry);
  return entry;
}

/**
 * Retrieve all pending reviews sorted by reviewedAt ascending.
 */
export async function getPendingReviews(): Promise<PendingReviewEvent[]> {
  try {
    const db = await getDb();
    const all = await db.getAllFromIndex("pendingReviews", "by-reviewedAt");
    return all.sort(
      (a, b) => new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime(),
    );
  } catch {
    return [];
  }
}

/**
 * Get count of pending items in outbox.
 */
export async function getPendingReviewsCount(): Promise<number> {
  try {
    const db = await getDb();
    return await db.count("pendingReviews");
  } catch {
    return 0;
  }
}

/**
 * Remove a successfully synced review from outbox.
 */
export async function removePendingReview(clientEventId: string): Promise<void> {
  const db = await getDb();
  await db.delete("pendingReviews", clientEventId);
}

/**
 * Clear all offline stores (used on sign-out after flush or user discard).
 */
export async function clearOfflineStores(): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction(["reviewQueue", "pendingReviews"], "readwrite");
    await tx.objectStore("reviewQueue").clear();
    await tx.objectStore("pendingReviews").clear();
    await tx.done;
  } catch (err) {
    console.warn("Failed to clear offline stores:", err);
  }
}

