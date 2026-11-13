# ADR 0008: Local-First Offline Review Queue and Outbox

- **Status:** Accepted
- **Date:** 2026-11-12
- **Deciders:** Engineering Team

---

## Context
Developers reviewing flashcards or solving algorithmic problems frequently encounter intermittent network connectivity (e.g. commuting, mobile browsing, offline environments). Previously, any review grade submitted without an active internet connection failed immediately, losing user progress and breaking spaced repetition continuity.

## Decision
We implemented a local-first offline review pipeline backed by IndexedDB and an idempotent outbox:
1. **IndexedDB Outbox (`idb` v8):** Flashcard and review ratings submitted while offline are persisted locally in an IndexedDB object store (`offline_reviews`).
2. **Client-Side Event Identification:** Each review mutation generates a unique `clientEventId` (UUID v4) prior to writing to the outbox.
3. **Optimistic UI Updates:** The review queue immediately updates client state, decrementing counters and advancing to the next card without blocking on network latency.
4. **Reconnection Synchronization:** An offline sync manager listens for browser online events (`window.addEventListener('online')`) and flushes queued ratings to `/api/review-queue/review`.
5. **Backend Idempotency:** The review controller checks `ReviewLog.clientEventId`. If a review with the same client ID was already committed, the backend safely ignores duplicate processing and returns HTTP 200, preventing repeated FSRS calculations or duplicate activity events.

## Alternatives Considered
- **Service Worker Background Sync API:** Inconsistently supported across browsers (unsupported in WebKit / Safari iOS and Firefox).
- **LocalStorage Outbox:** Lacks transaction safety, has restrictive 5MB quota limits, and blocks the main thread during JSON serialization.

## Consequences
- **Positive:** Uninterrupted flashcard review experience offline; zero data loss; guaranteed at-most-once processing on server synchronization.
- **Negative / Trade-offs:** Requires client-side IndexedDB management and storage quota error handling.

## Implementation Files
- [frontend/src/lib/offline/db.ts](../../frontend/src/lib/offline/db.ts)
- [frontend/src/lib/offline/syncManager.ts](../../frontend/src/lib/offline/syncManager.ts)
- [backend/routes/reviewQueue.routes.ts](../../backend/routes/reviewQueue.routes.ts)
- [frontend/src/components/offline/SyncStatusChip.tsx](../../frontend/src/components/offline/SyncStatusChip.tsx)
- [backend/prisma/migrations/20261112110000_offline_client_event_id/migration.sql](../../backend/prisma/migrations/20261112110000_offline_client_event_id/migration.sql)
