# DSA Tracker Pro

[![CI Pipeline](https://github.com/RajatSharma404/DSA-Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/RajatSharma404/DSA-Tracker/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/RajatSharma404/DSA-Tracker/actions/workflows/e2e.yml/badge.svg)](https://github.com/RajatSharma404/DSA-Tracker/actions/workflows/e2e.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/next.js-16.1.6-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/react-19.2.3-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/express-5.2.1-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/prisma-5.22.0-indigo.svg)](https://www.prisma.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

> **DSA Tracker Pro** is an engineering-grade full-stack platform that combines the **Free Spaced Repetition Scheduler (FSRS v6)** with two-way **LeetCode browser synchronization** and **local-first offline review queues**. Built for developers preparing for technical interviews, it eliminates memory decay through mathematically optimized review intervals, provides instant sub-10ms progress synchronization, and guarantees uninterrupted offline flashcard review via IndexedDB outbox persistence.

---

## Showcase

![DSA Tracker Pro Dashboard](./docs/media/dashboard.png)

*(Placeholder asset: supply `./docs/media/dashboard.png`, `./docs/media/review.gif`, and `./docs/media/extension.gif` to showcase the UI)*

---

## Feature Matrix

Feature tiers are enforced via runtime environment flags documented in [docs/scope.md](./docs/scope.md):

| Feature | Tier | Status | Description |
| :--- | :--- | :--- | :--- |
| **Review Queue** | `CORE` | **Active** | FSRS spaced repetition engine predicting memory retention decay and interval scheduling. |
| **Flashcards** | `CORE` | **Active** | Active recall flashcards with full WCAG 2.1 AA keyboard support (`Space`, `1`-`4`, `Esc`). |
| **Chrome Extension** | `CORE` | **Active** | Manifest V3 auto-pairing, zero-cookie permissions, and bulk sub-10ms LeetCode synchronization. |
| **Dashboard** | `CORE` | **Active** | Unified hub with 365-day SVG activity heatmap, due queue counters, and weak topic alerts. |
| **Curriculum Catalog** | `CORE` | **Active** | Structured problem taxonomy across 20+ algorithmic domains with multi-tag filtering. |
| **Visual Roadmap** | `CORE` | **Active** | Interactive dependency graph visualizing prerequisite algorithmic topics and difficulty tracks. |
| **Problem Workspace** | `CORE` | **Active** | Monaco editor shell with syntax highlighting, contextual hints, and solution history tracking. |
| **Analytics & KPIs** | `CORE` | **Active** | Rolling retention decay curves, difficulty breakdowns, and timezone-aware velocity forecasting. |
| **Notes & Solutions** | `CORE` | **Active** | Markdown notes with AST code complexity heuristics (acorn) and multi-revision history. |
| **Study Plan** | `CORE` | **Active** | AI-assisted and deterministic goal-driven study schedule generation. |
| **Admin Control** | `CORE` | **Active** | Protected curriculum seeding, user role administration, and runtime feature flag auditing. |
| **Settings & Profile** | `CORE` | **Active** | Timezone configuration, pairing device revocation, and theme preferences. |
| **Learn Tracks** | `FROZEN` | **Stable** | Foundational C++ and data structure modules; maintenance mode, no new feature development. |
| **Problem Vault** | `FROZEN` | **Stable** | Curated reference solutions and problem templates; stable and frozen. |
| **Company Tracks** | `FROZEN` | **Stable** | Tier-1 tech company problem bundles; stable and frozen pending core expansion. |
| **AlgoTracer 2.0** | `SHOWPIECE`| **Active** | Interactive step-by-step AST execution tracer and memory visualizer (`FEATURE_ALGOTRACER`). |
| **1v1 PvP Battles** | `PARKED` | **Default OFF** | Real-time competitive multiplayer duel mode; disabled via `FEATURE_PVP=false`. |
| **The Arena** | `PARKED` | **Default OFF** | Timed speed challenge arena; disabled via `FEATURE_ARENA=false`. |
| **AI Mock Interviews**| `PARKED` | **Default OFF** | Audio and chat technical mock interview simulator; disabled via `FEATURE_INTERVIEWS=false`. |

---

## Architecture & System Context

DSA Tracker Pro decouples client-facing NextAuth session management from backend API business execution through short-lived HS256 tokens and a same-origin proxy:

```mermaid
flowchart TB
    subgraph UserMachine["User Device Boundary"]
        Browser["Web Browser / PWA"]
        Ext["Chrome Extension (MV3)"]
        IDB[("IndexedDB Outbox")]
        Browser <--> IDB
    end

    subgraph AppServer["Application Tier"]
        NextApp["Next.js Frontend (:3005)"]
        Proxy["Same-Origin Proxy (/api)"]
        ExpressAPI["Express 5 Backend (:3001)"]
        NextApp --> Proxy
        Proxy --> ExpressAPI
    end

    subgraph DataTier["Data Tier"]
        PG[("PostgreSQL Database")]
        ExpressAPI --> PG
    end

    subgraph ThirdParty["Third-Party Boundary"]
        GoogleAuth["Google OAuth 2.0"]
        GeminiAPI["Google Gemini AI"]
        LeetCode["LeetCode Site"]
    end

    Browser --> NextApp
    Ext -.->|"Bearer dsat_..."| ExpressAPI
    Ext -->|"DOM Detection"| LeetCode
    NextApp <--> GoogleAuth
    ExpressAPI --> GeminiAPI
```

*Complete architectural documentation, request pipelines, and authentication flows are detailed in [docs/architecture.md](./docs/architecture.md).*

---

## How It Works: The Core Loop

1. **Auto-Sync:** The Chrome Extension sniffs accepted LeetCode submissions from the DOM and synchronizes them to `/api/extension/sync` using cryptographically scoped `dsat_` pairing tokens in a single bulk database transaction.
2. **FSRS Scheduling:** The scheduler (`ts-fsrs`) updates multidimensional memory metrics (`stability`, `difficulty`, `repetitions`, `lapses`) and calculates the optimal next review date.
3. **Active Review:** Users evaluate due cards daily in the Flashcards interface with 4 rating buttons (`Again`, `Hard`, `Good`, `Easy`) or keyboard shortcuts (`1`-`4`).
4. **Local-First Resilience:** If network connectivity drops, ratings are stored in an IndexedDB outbox queue (`clientEventId`). State updates optimistically and syncs automatically upon reconnection.
5. **Analytics & Adaptation:** Continuous activity events feed into timezone-adjusted streaks, 365-day heatmaps, and weak topic aggregations to adapt daily recommendations.

---

## Tech Stack

| Domain | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) | `16.1.6` | App Router, Server Components, client proxy |
| **UI Library** | [React](https://react.dev/) | `19.2.3` | Concurrent rendering, hooks, transitions |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^4.0.0` | Design token system, responsive dark theme |
| **Backend** | [Express](https://expressjs.com/) | `5.2.1` | REST API routing, rate limiting, security middleware |
| **Runtime** | [Node.js](https://nodejs.org/) | `>=22.0.0` | Server JavaScript runtime |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) & [Prisma](https://www.prisma.io/) | `>=15.0` / `5.22.0` | Relational persistence, migrations, type-safe queries |
| **Spaced Repetition**| [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) | `6.0.0` | Free Spaced Repetition Scheduler algorithm |
| **AI Integration** | [`@google/genai`](https://www.npmjs.com/package/@google/genai) | `2.21.0` | Official Google Gemini SDK (`gemini-2.5-flash`) |
| **Extension** | Manifest V3 | `3.0` | Chrome extension background service worker & content script |
| **Unit Testing** | [Vitest](https://vitest.dev/) | `4.1.11` | ESM unit and integration testing |
| **E2E Testing** | [Playwright](https://playwright.dev/) | `1.65.0` | End-to-end multi-browser test automation |
| **Accessibility** | [`@axe-core/playwright`](https://www.npmjs.com/package/@axe-core/playwright) | `4.14.0` | Automated WCAG 2.1 AA accessibility auditing |

---

## Quick Start

### Prerequisites
- **Node.js:** `>= 22.0.0` (LTS recommended)
- **npm:** `>= 10.0.0`
- **PostgreSQL:** `>= 15.0` running locally or via Docker

---

### Environment Variables

#### Backend (`backend/.env`)
| Variable | Required? | Default | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string (`postgresql://user:pass@localhost:5432/dsa_tracker`) |
| `BACKEND_JWT_SECRET` | **Yes** | — | High-entropy secret (min 32 bytes) for signing and verifying backend HS256 tokens |
| `PORT` | No | `3001` | HTTP port for the Express backend server |
| `NODE_ENV` | No | `development` | Runtime environment mode (`development`, `production`, `test`) |
| `CORS_ORIGINS` | Prod: **Yes**| `""` | Comma-separated list of allowed frontend origins (e.g. `http://localhost:3005`) |
| `COOKIE_ENCRYPTION_KEY` | Prod: **Yes**| — | 32-byte key for AES-256-GCM symmetric encryption |
| `COOKIE_ENCRYPTION_KEY_PREVIOUS`| No | — | Secondary decryption key used during encryption key rotation |
| `GEMINI_API_KEY` | If AI: **Yes**| — | Google Gemini API key for AI hints, code review, and study planning |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model identifier (see official Google Gemini API docs) |
| `ADMIN_EMAIL` | No | `""` | User email address automatically promoted to `ADMIN` role upon first login |
| `USER_CACHE_TTL_MS` | No | `300000` | In-memory cache duration (5m) for user authentication and role validation |
| `FEATURE_PVP` | No | `false` | Feature flag toggle for 1v1 PvP mode (Parked) |
| `FEATURE_ARENA` | No | `false` | Feature flag toggle for Arena challenges (Parked) |
| `FEATURE_INTERVIEWS` | No | `false` | Feature flag toggle for AI mock interviews (Parked) |
| `FEATURE_ALGOTRACER` | No | `true` | Feature flag toggle for AlgoTracer visualizer (Showpiece) |
| `AI_DAILY_LIMIT_HINTS` | No | `30` | Daily per-user limit for AI problem hints |
| `AI_DAILY_LIMIT_REVIEW` | No | `15` | Daily per-user limit for AI code reviews |
| `AI_DAILY_LIMIT_PLAN` | No | `3` | Daily per-user limit for AI study plan generation |

#### Frontend (`frontend/.env.local`)
| Variable | Required? | Default | Description |
| :--- | :--- | :--- | :--- |
| `NEXTAUTH_SECRET` | **Yes** | — | Secret key used to encrypt NextAuth session cookies |
| `NEXTAUTH_URL` | Prod: **Yes** | `http://localhost:3005`| Canonical base URL for NextAuth authentication redirects |
| `BACKEND_JWT_SECRET` | **Yes** | — | Shared secret with backend to mint short-lived backend tokens |
| `GOOGLE_CLIENT_ID` | If OAuth: **Yes**| — | Google Cloud OAuth 2.0 Web Client ID |
| `GOOGLE_CLIENT_SECRET` | If OAuth: **Yes**| — | Google Cloud OAuth 2.0 Web Client Secret |
| `INTERNAL_BACKEND_URL` | No | `http://localhost:8080/api` | Direct server-to-server backend URL for SSR layout flag resolution |
| `ALLOW_INSECURE_CREDENTIALS_LOGIN` | No | `false` | Enables test credential authentication for local dev and Playwright tests |

---

### Step-by-Step Local Setup

1. **Clone & Install Dependencies:**
   ```bash
   git clone https://github.com/RajatSharma404/DSA-Tracker.git
   cd DSA-Tracker
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

2. **Configure Environment Files:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   # Populate DATABASE_URL, BACKEND_JWT_SECRET, and NEXTAUTH_SECRET with secure keys
   ```

3. **Deploy Database Migrations:**
   ```bash
   # Run versioned migrations (never run db push in production)
   cd backend
   npx prisma migrate deploy
   ```

4. **Seed Curriculum & Test Data:**
   ```bash
   npx prisma db seed
   cd ..
   ```

5. **Start Development Servers:**
   ```bash
   npm run dev
   ```
   - **Frontend:** `http://localhost:3005`
   - **Backend API:** `http://localhost:3001`

---

## Verification & Test Commands

DSA Tracker Pro maintains strict test gates across unit, integration, contract, and end-to-end specifications:

```bash
# 1. Typecheck both backend and frontend without emitting JS
npm run typecheck

# 2. Lint frontend React and Next.js components
npm run lint

# 3. Run all Vitest unit and integration suites
npm test

# 4. Run Vitest with coverage instrumentation
npm run test:coverage

# 5. Run Playwright E2E suites with 3x repetition
npx playwright test --repeat-each=3

# 6. Verify schema synchronization between backend and frontend
npm run check:prisma-sync

# 7. Verify ERD documentation freshness against database schema
npm run check:erd

# 8. Validate all Mermaid diagrams in documentation
npm run check:mermaid

# 9. Verify markdown links and anchors
npm run check:links
```

---

## Performance & Quality Metrics

*Measured on 2026-11-12 on Windows 11 x64, Node.js v24.15.0, PostgreSQL 18.x, Chromium (Playwright 1.65.0); see [docs/metrics/RESULTS.md](./docs/metrics/RESULTS.md) for full methodology.*

| Metric Category | Benchmark Scenario | Measured Result | Status |
| :--- | :--- | :--- | :--- |
| **Review Queue Query** | `EXPLAIN (ANALYZE, BUFFERS)` on 5,000 progress rows | **0.366 ms** (18 shared buffers hit) | Optimal |
| **Weak Topics Aggregation**| Hash right join with memoized topic index | **0.496 ms** (41 shared buffers hit) | Optimal |
| **Activity Heatmap Scan** | 1-year rolling daily aggregation on 20,000 events | **3.923 ms** (99 buffers hit, 0 heap fetches) | Optimal |
| **N+1 Sync Optimization** | Bulk preload LeetCode submission sync | **9.66 ms** (2 DB round trips vs 200 baseline) | **13x Faster** |
| **Vitest Test Suite** | 68 test files across backend and frontend | **402 passed / 402 tests (100% PASS)** | 0 Failures |
| **Playwright E2E Suite** | 8 suites running with `--repeat-each=3` | **45 passed / 45 runs (100% PASS)** | 0 Flakiness |
| **Accessibility (a11y)** | `@axe-core` scans on Dashboard, Review, Flashcards | **0 critical, 0 serious violations** | WCAG 2.1 AA |

---

## Security Model

- **Zero LeetCode Session Cookie Storage:** The Chrome extension never accesses, reads, or transmits the user's `LEETCODE_SESSION` cookie. The `cookies` permission is completely omitted from `extension/manifest.json`.
- **Pairing Token Isolation:** The extension authenticates strictly via high-entropy `dsat_` pairing tokens (`crypto.randomBytes(32)`). The backend stores only the one-way SHA-256 hash in the `ExtensionDevice` table.
- **Short-Lived Backend Tokens:** Frontend requests use 10-minute HS256 tokens minted via `/api/backend-token`. No persistent session secrets are exposed to client JavaScript.
- **AST Code Complexity Sandbox:** User solution code complexity is extracted using AST parsing (`acorn`) without executing untrusted code on the server.
- **Strict Rate Limiting:** Global rate limiters, AI endpoint quotas, and 100kb request body size limits protect against DoS and credential stuffing.

---

## Deployment & Hosting

- **Render / Container Deployments:** Detailed configuration instructions for Render free-tier web services, environment variable definitions, and PostgreSQL connection pooling are located in [docs/hosting.md](./docs/hosting.md).
- **Production Build Command:**
  ```bash
  prisma generate && tsc && prisma migrate deploy
  ```

---

## Roadmap & Maintenance

| Feature Area | Status | Target Phase |
| :--- | :--- | :--- |
| **Core Spaced Repetition (FSRS)** | **Completed** | Phase 1 |
| **Extension Security & Pairing** | **Completed** | Phase 2 |
| **Gemini AI Client Hardening** | **Completed** | Phase 3 |
| **Offline Review Queue & PWA** | **Completed** | Phase 4b |
| **E2E Test Gates & Accessibility**| **Completed** | Phase 6a |
| **Comprehensive Docs & ERDs** | **Completed** | Phase 6b |
| **The Arena (Timed Speed Runs)** | *Parked (Default OFF)*| Post-Upgrade |
| **1v1 PvP Multiplayer** | *Parked (Default OFF)*| Post-Upgrade |
| **AI Mock Technical Interviews** | *Parked (Default OFF)*| Post-Upgrade |

---

## Documentation Index

- [System Architecture](./docs/architecture.md)
- [Architecture Decision Records (ADRs)](./docs/adr/README.md)
- [Entity-Relationship (ER) Diagrams](./docs/erd/README.md)
- [Feature Scope & Gating](./docs/scope.md)
- [Hosting & Deployment Guide](./docs/hosting.md)
- [Operational Runbook](./docs/runbook.md)
- [Live Demo Walkthrough Script](./docs/demo-script.md)
- [Security Policy](./SECURITY.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

## License

This project is licensed under the [ISC License](file:///d:/DSA-Tracker/package.json).
