# ADR 0005: Append-Only Activity Events for Streaks and Heatmaps

- **Status:** Accepted
- **Date:** 2026-11-11
- **Deciders:** Engineering Team

---

## Context
User streaks and 365-day activity heatmaps were previously computed by scanning mutable timestamps in `Progress.completedAt` and mutating a single `Streak` record per user. This design had multiple flaws:
- It suffered from write lock contention under concurrent problem solves and reviews.
- It could not differentiate between distinct user actions (problem solved vs. spaced repetition reviewed vs. attempted vs. extension synced).
- It computed days using UTC timestamps, causing streaks and activity blocks to break or desynchronize for users in other timezones.

## Decision
We implemented an event-sourced audit model for user engagement:
1. **ActivityEvent Model:** Created an append-only `ActivityEvent` table:
   - `id`: UUID primary key
   - `userId`: Tenant reference
   - `problemId`: Optional associated problem
   - `type`: Enum (`SOLVED`, `REVIEWED`, `ATTEMPTED`, `SYNCED`)
   - `occurredAt`: High-precision timestamp
   - `metadata`: JSON payload for contextual details (runtime, memory, score)
2. **Timezone-Aware Ingestion:** Added `timezone` (default `"UTC"`) to the `User` model, dynamically converting timestamps to the user's local day boundaries during aggregation.
3. **Optimized Compound Indexing:** Indexed `(userId, occurredAt)` to enable high-speed index-only scans for 1-year rolling activity heatmaps and streak calculations.

## Alternatives Considered
- **Pre-computed Daily Counter Table:** Less flexible; cannot easily slice activity by type or retroactively adjust timezone boundaries.
- **Client-Side Aggregation:** Transmitting thousands of individual progress records to the client degrades mobile performance and increases bundle processing latency.

## Consequences
- **Positive:** Sub-4ms index-only scans across 20,000+ activity records (3.923 ms benchmark); complete historical visibility into all user learning events; accurate timezone calculations.
- **Negative / Trade-offs:** Table grows proportionally with user engagement, requiring periodic index maintenance.

## Implementation Files
- [backend/prisma/schema.prisma](../../backend/prisma/schema.prisma)
- [backend/services/analyticsCalculations.ts](../../backend/services/analyticsCalculations.ts)
- [backend/routes/stats.routes.ts](../../backend/routes/stats.routes.ts)
- [frontend/src/components/dashboard/ActivityCalendarHeatmap.tsx](../../frontend/src/components/dashboard/ActivityCalendarHeatmap.tsx)
