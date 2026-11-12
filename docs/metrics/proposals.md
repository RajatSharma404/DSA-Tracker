# Database Index Proposals & Query Analysis

Generated: 2026-11-12
Environment: PostgreSQL 18.x (Local Benchmark, 5,000 Progress rows, 20,000 ActivityEvent rows)

## 1. Review Queue Query
- **Query:** `SELECT p.*, prob.title, prob.difficulty, t.name FROM "Progress" p JOIN "Problem" prob ON p."problemId" = prob.id JOIN "Topic" t ON prob."topicId" = t.id WHERE p."userId" = $1 AND p.status = 'DONE' AND p."nextReviewDate" <= NOW() ORDER BY p."nextReviewDate" ASC;`
- **Current Plan:** `Bitmap Index Scan on "Progress_userId_status_nextReviewDate_idx"` + `Index Scan on Topic_pkey`
- **Execution Time:** ~0.37 ms
- **Recommendation:** No additional index needed. The composite index `(userId, status, nextReviewDate)` introduced in Phase 0/1 operates at peak efficiency.

## 2. Weak Topics Aggregation
- **Query:** Topic-by-topic solve rate aggregation over `Problem` and `Progress`.
- **Current Plan:** Hash Right Join over `Progress` (filtering on `userId`) + Memoized `Topic_pkey`.
- **Execution Time:** ~0.50 ms
- **Proposal for Large Datasets:**
  - On tables exceeding 100,000 Progress rows, adding a composite index `(userId, problemId) INCLUDE (easinessFactor, status)` or partial index on `(userId, problemId) WHERE status = 'DONE'` ensures zero heap fetches.
  - *Status:* Advisory proposal for Phase 6b/future scale. Do not apply without explicit user sign-off.

## 3. Heatmap / Activity Events Query
- **Query:** `SELECT DATE_TRUNC('day', "occurredAt") as day, COUNT(*) FROM "activity_events" WHERE "userId" = $1 AND "occurredAt" >= NOW() - INTERVAL '365 days' GROUP BY day;`
- **Current Plan:** `Index Only Scan using "activity_events_userId_occurredAt_idx"` (Heap Fetches: 0)
- **Execution Time:** ~3.92 ms for 20,000 rows
- **Recommendation:** Peak index utilization. The index `(userId, occurredAt)` allows PostgreSQL to evaluate both the user filter, range filter, and date extraction directly within index leaf pages.

