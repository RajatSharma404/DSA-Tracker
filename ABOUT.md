# ABOUT DSA-Tracker

This file is the deep-dive project handbook for DSA-Tracker.
It is intended for anyone who wants to study, maintain, debug, extend, or deploy the project in detail.

## 1) Project Identity

- Project name: DSA Roadmap Tracker
- Monorepo root: `DSA-Tracker/`
- Primary goal: track DSA learning with roadmap progression, coding practice, AI-assisted guidance, spaced repetition, analytics, and interview/challenge workflows.
- App shape: full-stack web app plus browser extension.

## 2) Core Product Surfaces

- Authenticated dashboard and study workflow UI (Next.js app router).
- Backend REST APIs (Express + Prisma + PostgreSQL).
- LeetCode integration (GraphQL/API calls and submission sync).
- Browser extension for passive LeetCode accepted-submission sync.
- Admin panel for managing users/topics/problems.

## 3) Tech Stack (Source of Truth)

### Root

- `concurrently` for running backend and frontend together.

### Frontend (`frontend/package.json`)

- Next.js `16.1.6`
- React `19.2.3`
- TypeScript `^5`
- Tailwind CSS `^4`
- NextAuth `^4.24.13`
- Prisma client `^5.22.0`
- React Flow `^11.11.4`
- Recharts `^3.7.0`
- Monaco editor + vim mode (`@monaco-editor/react`, `monaco-vim`)
- Axios client for API requests

### Backend (`backend/package.json`)

- Express `^5.2.1`
- Prisma `^5.22.0`
- PostgreSQL driver `pg`
- JWT (`jsonwebtoken`)
- Nodemailer (`nodemailer`)
- TypeScript + ts-node + tsx
- Axios for LeetCode API calls

### Data

- PostgreSQL via Prisma schema (`backend/prisma/schema.prisma`)

## 4) Repository Top-Level Purpose

- `backend/`: API server, data access, LeetCode integration, AI heuristics.
- `frontend/`: web app (auth, dashboard, learning flows, admin).
- `extension/`: browser extension service worker + content script.
- `docker-compose.yml`: local PostgreSQL service.
- `ecosystem.config.js`: PM2 process config.
- `dsa-tracker.service`: systemd service template.
- `DEPLOYMENT.md`, `GOOGLE_APP_ENGINE_DEPLOYMENT.md`, `GAE_QUICK_START.md`: deployment instructions.
- `deploy-to-gae.sh`, `deploy-to-gae.bat`: helper scripts.
- `dsa-roadmap-seed.json`: roadmap seed content.
- `CONTRIBUTING.md`: contribution rules.
- `README.md`: getting started and user-level docs.

## 5) Execution Model

### Root scripts

- `npm run dev`: starts backend and frontend concurrently.
- `npm run dev:backend`: starts backend dev server.
- `npm run dev:frontend`: starts frontend dev server.
- `npm run build`: builds backend then frontend.
- `npm run start`: starts production builds concurrently.

### Backend scripts

- `npm run dev`: `ts-node index.ts`
- `npm run build`: TypeScript build + Prisma generate
- `npm run start`: `node dist/index.js`

### Frontend scripts

- `npm run dev`: `next dev`
- `npm run build`: `next build`
- `npm run start`: `next start`
- `npm run lint`: ESLint

## 6) Runtime Ports and URLs

- Frontend default: `http://localhost:3000`
- Backend default: `http://localhost:3001`
- Backend health route: `/health`

## 7) Environment Variables

### Backend (`backend/.env`)

Required and common:

- `PORT`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`

Admin/email notifications:

- `ADMIN_EMAIL`
- `LOGIN_NOTIFY_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `NOTIFY_FROM`

Notes:

- Backend supports multiple token secret candidates using:
  - `NEXTAUTH_SECRET`
  - `AUTH_SECRET`
  - fallback secret
- Login notification emails are rate-limited in memory (`30 min` cooldown per email).

### Frontend (`frontend/.env.local`)

- `DATABASE_URL` (for NextAuth Prisma adapter setup)
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- Optional: `NEXT_PUBLIC_API_URL` for explicit absolute backend API base

## 8) Frontend Request Flow

Main API client file: `frontend/src/lib/api.ts`

- Axios client with automatic token attachment from NextAuth session.
- Handles 401 with one forced session refresh retry.
- Handles 429 with method-aware retry and optional absolute API base fallback.
- Uses `NEXT_PUBLIC_API_URL` when explicitly configured with absolute URL.

## 9) Backend Architecture Overview

Primary file: `backend/index.ts`

Key responsibilities:

- Express app bootstrap.
- Auth middleware (`requireAuth`) and admin guard (`requireAdmin`).
- Upsert user by token email on first authenticated request.
- Auto-promote admin user when email matches configured admin email.
- Route definitions for dashboard, topics, problems, progress, AI, search, review, notes, tags, bookmarks, solutions, interviews, analytics, learn modules, admin, LeetCode sync/submit APIs.

Support modules:

- `backend/services.ts`: dashboard analytics, weak topics, revision reminders, mastery, daily problem, time analytics, achievements, weekly reports.
- `backend/leetcodeService.ts`: GraphQL/API helpers to fetch solved sets, submission details, daily challenge, problem details, and submission checking.
- `backend/aiService.ts`: local heuristic AI-like outputs for hints/reviews/evaluation/tracing/recommendations.
- `backend/templates.ts`: static DSA pattern templates for vault.

## 10) Database Model Deep Reference

Schema file: `backend/prisma/schema.prisma`

### Auth and identity models

- `User`
- `Account`
- `Session`
- `VerificationToken`

### Learning and progress models

- `Topic`
- `Problem`
- `Progress`
- `Streak`
- `MockInterview`
- `ChallengeSession`

### Knowledge and writing models

- `ProblemNote`
- `SolutionHistory`
- `Bookmark`
- `UserTag`
- `ProblemTag`

### Theory-first learning models

- `TheoryTrack`
- `TheoryModule`
- `TheoryLesson`
- `TheoryLessonBlock`
- `TheoryProblemLink`
- `UserTheoryLessonProgress`

### Enums

- `Role`: `USER`, `ADMIN`
- `Difficulty`: `EASY`, `MEDIUM`, `HARD`
- `ProgressStatus`: `TODO`, `DOING`, `DONE`
- `ChallengeStatus`: `IN_PROGRESS`, `COMPLETED`, `FAILED`
- `NoteType`: `GOTCHA`, `LEARNING`, `TIP`
- `TheoryDifficulty`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`
- `TheoryBlockType`: `MARKDOWN`, `CODE`, `NOTE`, `QUIZ`, `IMAGE`
- `TheoryProgressStatus`: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`

## 11) Frontend App Router Map (High-Value Areas)

From `frontend/src/app/`:

- `(auth)/login/`: login screen.
- `(dashboard)/page.tsx`: main dashboard.
- `(dashboard)/topics/`: topic listing and topic drill-down flow.
- `(dashboard)/problems/[problemId]/`: solve page with editor and AI tabs.
- `(dashboard)/challenge/` and `(dashboard)/challenge/[id]/`: challenge setup and active challenge simulator.
- `(dashboard)/roadmap/`: visual roadmap and customizable roadmap builder.
- `(dashboard)/learn/`: theory-first course progression.
- `(dashboard)/analytics/`: charts and time/skill views.
- `(dashboard)/recommendations/`: personalized recommendations.
- `(dashboard)/review/`: review queue.
- `(dashboard)/vault/`: templates and notes.
- `(dashboard)/search/`: filtered search.
- `(dashboard)/settings/`: user settings (LeetCode identifiers/session).
- `(dashboard)/interviews/`: mock interview tracking.
- `admin/`: admin-facing CRUD views.
- `api/auth/`: NextAuth endpoints.

## 12) Component Domains

From `frontend/src/components/`:

- `dashboard/`: data-rich UI units (heatmap, radar, hints, code review, editor, notes, sync widgets, daily focus).
- `roadmap/`: roadmap graph and builder components.
- `layout/`: sidebar shell and nav.
- `providers/`: session/provider wrappers.
- `ui/`: reusable primitives.

## 13) API Surface (Practical Reference)

This section is derived from `frontend/src/lib/api.ts` and corresponds to backend `/api/*` routes.

### Dashboard and topics

- `GET /dashboard`
- `GET /topics`
- `GET /topics/:topicId/problems`
- `GET /problems/:problemId`
- `POST /progress`

### Learn / theory-first

- `GET /learn/tracks`
- `GET /learn/tracks/:trackSlug/modules/:moduleSlug/lessons/:lessonSlug`
- `POST /learn/lessons/:lessonId/progress`
- `POST /admin/learn/seed`

### Interviews

- `GET /interviews`
- `POST /interviews`

### Admin

- `GET /admin/users`
- `PATCH /admin/users/:userId/role`
- `POST /admin/topics`
- `PUT /admin/topics/:id`
- `DELETE /admin/topics/:id`
- `POST /admin/problems`
- `PUT /admin/problems/:id`
- `DELETE /admin/problems/:id`
- `POST /admin/seed`

### Analytics and progression helpers

- `GET /analytics/activity`
- `GET /analytics/mastery`
- `GET /analytics/productivity`
- `GET /analytics/time`
- `GET /daily-problem`
- `GET /achievements`
- `GET /weekly-report`

### User LeetCode settings and sync

- `PATCH /user/leetcode`
- `PATCH /user/leetcode-session`
- `POST /user/sync-leetcode`

### LeetCode retrieval/submit/check

- `GET /leetcode/submissions/:problemSlug`
- `GET /leetcode/submission/:submissionId/code`
- `GET /leetcode/daily-challenge`
- `GET /leetcode/problem/:titleSlug`
- `POST /leetcode/submit`
- `GET /leetcode/submission/:submissionId/check`

### Challenge workflow

- `POST /challenges/start`
- `GET /challenges/:id`
- `POST /challenges/:id/complete`

### AI endpoints

- `POST /ai/hint`
- `GET /ai/pattern/:topicId`
- `POST /ai/review`
- `POST /ai/trace`
- `POST /ai/evaluate`
- `GET /ai/recommendations`

### Solutions, bookmarks, tags

- `POST /solutions`
- `GET /solutions/:problemId`
- `GET /solutions`
- `POST /bookmarks/toggle`
- `GET /bookmarks`
- `GET /bookmarks/check/:problemId`
- `POST /tags`
- `GET /tags`
- `DELETE /tags/:tagId`
- `POST /tags/:tagId/problems`
- `GET /problems/:problemId/tags`

### Search, review queue, export

- `GET /search`
- `GET /review-queue`
- `POST /review-queue/complete`
- `GET /export/progress?format=json|csv`

### Vault and notes

- `GET /vault/templates`
- `GET /notes/:problemId`
- `GET /notes`
- `POST /notes`
- `PUT /notes/:noteId`
- `DELETE /notes/:noteId`

### Extension route

- `POST /extension/sync`

## 14) Auth and Authorization Behavior

- Frontend uses NextAuth session.
- API client reads `accessToken` from session and sends `Authorization: Bearer ...`.
- Backend verifies JWT against candidate secrets.
- Backend auto-upserts user by token email.
- Backend auto-upgrades role to `ADMIN` if email matches configured admin email.
- `requireAdmin` gate protects admin endpoints.

## 15) LeetCode Integration Details

`backend/leetcodeService.ts` includes:

- Public profile solved retrieval.
- Authenticated solved-list pagination with `LEETCODE_SESSION`.
- Session username fetch for identity sync.
- Submission list retrieval.
- Submission details retrieval.
- Daily challenge retrieval.
- Problem details retrieval.
- Submission + status polling helpers.

`backend/index.ts` exposes these through tracker APIs.

## 16) AI Layer Details

`backend/aiService.ts` currently provides local heuristics, not third-party hosted LLM calls.

- Hint generation by topic patterns.
- Pattern explanation blocks.
- Static code review heuristics.
- Static code evaluation (verdict, complexity estimate, recommendations).
- Algorithm trace scaffold.
- Personalized recommendation shaping from solved history + weak topics.

Important practical implication:

- AI output is deterministic/local and should be treated as guidance, not absolute correctness proof.

## 17) Extension Architecture

Files:

- `extension/manifest.json`
- `extension/background.js`
- `extension/content.js`

Behavior:

- Content script runs on LeetCode problem pages.
- Background script listens for sync messages.
- Reads `LEETCODE_SESSION` cookie from browser.
- Attempts sync via configured API bases in storage.
- Fallback API base default: `http://localhost:3001`.
- Calls backend `POST /api/extension/sync`.

Extension configurable keys:

- `dsaApiBaseUrl` (single)
- `dsaApiBaseUrls` (array)

## 18) Roadmap and Builder Notes

Custom roadmap builder includes:

- Drag-and-drop node creation.
- Multi-handle node linking from left/right sides.
- Node-level delete button.
- Keyboard delete/backspace handling for selected nodes.
- Tag-section search filtering.
- Plain-text export/import serialization.

Visual roadmap includes:

- Graph navigation controls and minimap.
- Progress visuals and dependency edges.

## 19) Lazy Loading State (Current)

Project has dynamic lazy loading in multiple pages for heavy interactive modules.

Common pattern:

- `next/dynamic`
- `ssr: false` for browser-only heavy components (editor/AI widgets/graphs)
- lightweight loading placeholders (skeleton blocks)

Files with notable lazy-loading updates include:

- `frontend/src/app/(dashboard)/page.tsx`
- `frontend/src/app/(dashboard)/topics/page.tsx`
- `frontend/src/app/(dashboard)/problems/[problemId]/page.tsx`
- `frontend/src/app/(dashboard)/challenge/[id]/page.tsx`
- `frontend/src/app/(dashboard)/roadmap/page.tsx`
- `frontend/src/app/(dashboard)/layout.tsx`
- `frontend/src/app/admin/layout.tsx`

## 20) Local Setup Reference (Condensed)

1. Start DB: `docker compose up -d`
2. Backend setup:
   - `cd backend`
   - `npm install`
   - create `.env`
   - `npx prisma db push`
   - `npx prisma db seed`
3. Frontend setup:
   - `cd ../frontend`
   - `npm install`
   - create `.env.local`
   - `npx prisma db push`
4. Root install:
   - `cd ..`
   - `npm install`
5. Run app:
   - `npm run dev`

## 21) Build and Production

- Build both sides: `npm run build` from root.
- Start production: `npm run start` from root.
- PM2 config file: `ecosystem.config.js`.
- systemd template: `dsa-tracker.service`.
- Deployment docs:
  - `DEPLOYMENT.md`
  - `GOOGLE_APP_ENGINE_DEPLOYMENT.md`
  - `GAE_QUICK_START.md`

## 22) Common Runtime Warnings and Meaning

### Next lock error

- Error: unable to acquire lock at `frontend/.next/dev/lock`
- Cause: another `next dev` already running.
- Fix:
  - stop stale process
  - remove lock file
  - rerun `npm run dev`

Practical diagnostic note:

- This often looks like an API outage, but it is a frontend process collision.
- Confirm before debugging API/DB:
  - frontend: `http://localhost:3000` returns 200
  - backend: `http://localhost:3001/health` returns `{ "status": "healthy" }`

### Multiple lockfiles warning

- Next may infer workspace root using root-level lockfile while detecting another in `frontend/`.
- Usually non-blocking.

### Middleware deprecation warning

- Next warns that middleware convention is deprecated in current version and recommends proxy convention.
- Usually non-blocking; migration can be planned.

## 23) Operational Safety Notes

- Do not expose `LEETCODE_SESSION`, `NEXTAUTH_SECRET`, SMTP credentials.
- Restrict admin role assignment to explicit allowlist logic.
- Keep CORS and token verification logic aligned between frontend and backend.
- Validate incoming payloads before writes (future hardening area).

## 24) Troubleshooting Checklist (Developer)

- Backend fails start:
  - validate `backend/.env`
  - run `npx prisma generate`
  - confirm DB connectivity
- Duplicate dev startup / lock errors:
  - avoid running root `npm run dev` and `frontend/npm run dev` at the same time
  - stop duplicate `node`/`next dev` processes
  - remove `frontend/.next/dev/lock` if present
  - restart using one command path only
- Frontend API 401:
  - check NextAuth session
  - verify secret alignment backend/frontend
- Empty dashboard:
  - confirm backend running on `:3001`
  - inspect browser network for `/api/dashboard`
- LeetCode sync fails:
  - ensure cookie exists
  - verify extension API base URL points to reachable backend
- Prisma drift:
  - run `npx prisma db push` in both backend and frontend dirs

## 25) How to Study This Codebase Efficiently

Recommended reading order for new contributors:

1. `README.md` (project usage and setup)
2. `backend/prisma/schema.prisma` (domain model)
3. `backend/index.ts` (API and auth flow)
4. `frontend/src/lib/api.ts` (frontend-backend contract)
5. `frontend/src/app/(dashboard)/page.tsx` (dashboard composition)
6. `frontend/src/app/(dashboard)/topics/page.tsx` and `problems/[problemId]/page.tsx` (core learning loop)
7. `frontend/src/app/(dashboard)/roadmap/page.tsx` + roadmap components
8. `extension/background.js` + `content.js` (external sync channel)

## 26) Contribution Expectations

- Follow `CONTRIBUTING.md`.
- Keep PR scope focused.
- For UI changes, include screenshots/video.
- Run lint/build checks before submitting.

## 27) Glossary

- DSA: Data Structures and Algorithms.
- EF/interval/nextReviewDate: spaced repetition scheduling fields on progress records.
- Theory track/module/lesson/block: hierarchy for theory-first curriculum.
- AC: Accepted status on LeetCode.
- Roadmap builder: user-defined node graph serialized to text.

## 28) Source-of-Truth Reminder

If this document and runtime behavior differ, runtime behavior and source files are authoritative.
When updating features, update this file and `README.md` together.
