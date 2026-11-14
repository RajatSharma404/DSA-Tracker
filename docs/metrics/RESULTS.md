# DSA Tracker Pro - Performance & Quality Metrics Report

Generated: 2026-11-12
Branch: `upgrade/phase-6a`
Environment: Windows 11 x64, Node.js v24.15.0, PostgreSQL 18.x, Chromium (Playwright 1.65.0)

---

## 1. Database Query Latencies (`EXPLAIN (ANALYZE, BUFFERS)`)

Benchmark dataset generated via `scripts/seed-bench.ts`:
- **Progress rows:** 5,000 rows (user: `bench-user-1`)
- **ActivityEvent rows:** 20,000 rows (user: `bench-user-1`)
- **Problems & Topics:** Seeded curriculum across difficulties and topics

| Query Scenario | Scan / Execution Plan | Buffers Hit | Execution Time (ms) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Review Queue** (`status='DONE'`, `nextReviewDate <= NOW()`) | `Bitmap Index Scan` on `Progress_userId_status_nextReviewDate_idx` | 18 shared hit | **0.366 ms** | Optimal |
| **Weak Topics Aggregation** (Topic-by-topic solve rate) | `Hash Right Join` + Memoized `Topic_pkey` | 41 shared hit | **0.496 ms** | Optimal |
| **Heatmap & Activity Events** (1-year rolling daily aggregation) | `Index Only Scan` on `activity_events_userId_occurredAt_idx` (0 heap fetches) | 99 shared hit | **3.923 ms** | Optimal |

*Raw PostgreSQL execution plans saved to [docs/metrics/raw-plans.txt](./raw-plans.txt).*
*Index optimization recommendations documented in [docs/metrics/proposals.md](./proposals.md).*

---

## 2. N+1 Query Elimination Benchmark (`scripts/benchmark-n1-sync.ts`)

Benchmark measuring 100 LeetCode submission synchronizations across 10 independent iterations:

| Strategy | Database Round Trips | Median Latency (ms) | Min Latency (ms) | Max Latency (ms) | Improvement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Old Approach (Per-Row)** | 200 round trips | 125.21 ms | 113.42 ms | 138.33 ms | Baseline |
| **Current Approach (Bulk Preload)** | **2 round trips** | **9.66 ms** | **8.67 ms** | **15.77 ms** | **99% fewer DB queries, ~13x faster** |

---

## 3. Frontend Bundle Analysis (`scripts/measure-bundle-sizes.mjs`)

Total JS Chunks analyzed in `frontend/.next/static`: **6.10 MB** across 95 chunks.

### Top 10 Largest Chunks:
1. `a60bf422b5897efc.js`: **2,744.2 KB** (React 19, Three.js / React Three Fiber, Monaco Editor, Lucide icon pack)
2. `e3eabac6e88502de.js`: **344.4 KB**
3. `f615e6c1abd51ef0.js`: **344.4 KB**
4. `4af27f77bd5de33b.js`: **219.3 KB**
5. `a65845394d732d92.js`: **126.2 KB**
6. `cd558a666e20c65e.js`: **117.5 KB**
7. `6c9edaa3c66654ad.js`: **116.3 KB**
8. `a3788dba03702df9.js`: **112.7 KB**
9. `a7c01371262507bf.js`: **111.3 KB**
10. `16a6a0716b245742.js`: **110.7 KB**

---

## 4. Load Testing (k6)

- **Script location:** [scripts/k6-load-test.js](../../scripts/k6-load-test.js)
- **Target Endpoints:** `/api/dashboard/bootstrap` and `/api/review-queue`
- **Ramping Profile:** 1 to 50 Virtual Users (VUs) over 2 minutes (30s ramp up, 1m sustained at 50 VUs, 30s ramp down)
- **Status in Local Environment:** **Not measured** (k6 CLI is not pre-installed on this Windows host environment).
- **Exact Execution Command:**
  ```bash
  # Install k6 (via winget or choco if not installed)
  winget install k6 --source winget
  # Run the load test against the local test backend
  k6 run scripts/k6-load-test.js
  ```

---

## 5. Vitest Unit & Integration Suites

| Suite | Test Files | Total Tests | Status | Duration |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** (`npm test --prefix backend`) | 18 passed (18) | **184 passed** | 100% PASS (+8 extension contract tests) | ~11.8s |
| **Frontend** (`npm test --prefix frontend`) | 50 passed (50) | **218 passed** | 100% PASS | ~32.2s |
| **Total Vitest Tests** | **68 passed (68)** | **402 passed** | **100% PASS (0 failures)** | — |

---

## 6. Playwright End-to-End (E2E) Test Suite

- **Framework:** `@playwright/test@1.65.0`
- **Browser:** Headless Chromium
- **Execution:** `npx playwright test --repeat-each=3` (Total: 45 runs across 8 test suites)
- **Result:** **45 passed / 45 runs (100% PASS, 0 flakiness)**

| Spec File | Purpose & Covered Behaviors | Repeat Runs | Status |
| :--- | :--- | :--- | :--- |
| `e2e/auth.spec.ts` | Redirects unauth users to `/login`, verifies authenticated dashboard entry, validates `/admin` RBAC 403/redirect, runs `@axe-core` accessibility audit on dashboard | 3 / 3 | **PASS** |
| `e2e/solve-loop.spec.ts` | Visits curriculum, marks problem `DONE`, verifies checkmark and status toggle, validates backend progress/streak | 3 / 3 | **PASS** |
| `e2e/review.spec.ts` | Verifies 3 due review items, rates `Good` & `Forgot` (decrements queue to 1), runs `@axe-core` WCAG 2.1 AA audit | 3 / 3 | **PASS** |
| `e2e/flashcards-keyboard.spec.ts` | Keyboard navigation (`Space` to flip, `1`-`4` to rate, `Escape` to exit), runs `@axe-core` WCAG 2.1 AA audit | 3 / 3 | **PASS** |
| `e2e/quick-session.spec.ts` | Validates flashcard card stepper progression (`Card X of Y`) on navigation and review | 3 / 3 | **PASS** |
| `e2e/offline-review.spec.ts` | Emulates browser offline network disconnect, grades problem, validates offline status banner, restores network and verifies flush | 3 / 3 | **PASS** |
| `e2e/feature-flags.spec.ts` | Confirms parked routes (`/pvp`, `/challenge`, `/interviews`) render 404, verifies navigation links hidden when parked | 3 / 3 | **PASS** |
| `e2e/security-smoke.spec.ts` | Verifies tenant IDOR protections (403/404 when fetching another user's progress) and rejection of tampered/expired bearer tokens (401) | 3 / 3 | **PASS** |

### Automated Accessibility Audits (`@axe-core/playwright@4.14.0`)
- **Dashboard (`/`):** 0 critical / 0 serious accessibility violations.
- **Review Queue (`/review`):** 0 critical / 0 serious accessibility violations.
- **Flashcards (`/flashcards`):** 0 critical / 0 serious accessibility violations.

