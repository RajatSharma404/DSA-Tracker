# DSA Tracker

DSA Tracker is a full-stack learning platform for Data Structures and Algorithms practice.
It combines a structured roadmap, problem solving, theory-first learning, AI-assisted guidance, and progress analytics in one app.

This README is written to help a new contributor or user understand the project quickly and run it reliably.

## Quick Start (5 Minutes)

If you only want to run the app locally as fast as possible, follow this exact checklist.

1. Clone and enter the repo.

```bash
git clone https://github.com/RajatSharma404/DSA-Tracker.git
cd DSA-Tracker
```

2. Start PostgreSQL with Docker.

```bash
docker compose up -d
```

3. Install backend and initialize database.

```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
```

4. Create backend env file at backend/.env.

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

5. Install frontend and create env file.

```bash
cd ../frontend
npm install
npx prisma db push
```

Create frontend/.env.local:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-the-same-secret-as-backend"
```

6. Install root dependencies and run both apps.

```bash
cd ..
npm install
npm run dev
```

7. Open the app.

- Frontend: http://localhost:3000
- Backend health: http://localhost:3001/health

## What This Project Includes

- Personal DSA roadmap tracking with topic and problem progress
- Dashboard with streaks, weak-topic insight, and daily planning
- Theory-first Learn section (tracks, modules, lessons)
- Problem workspace with editor and saved solutions
- AI hint/review/trace style endpoints for guided learning workflows
- Explore/search/bookmark/tag flow for problem management
- Review flow for spaced-practice style reinforcement
- Analytics and achievement surfaces
- Browser extension support for LeetCode sync workflows

## Architecture Overview

The repository is a monorepo with three active app layers:

1. frontend

- Next.js app (App Router)
- UI pages, client state, auth pages, proxy rewrites

2. backend

- Express API server
- Prisma data access
- Learning logic, progress, AI-related endpoints, extension sync

3. database

- PostgreSQL (Docker locally, managed DB in deployment)

### Request Flow

1. Browser calls frontend routes.
2. Frontend calls /api/\*.
3. Next.js rewrite forwards non-auth /api/\* to backend.
4. Backend handles business logic and Prisma DB operations.

Important: NextAuth routes stay on frontend (/api/auth/\*), while app API routes proxy to backend.

## Tech Stack

### Frontend

- Next.js 16
- React 19
- Tailwind CSS 4
- NextAuth
- Axios
- Monaco editor + monaco-vim
- ReactFlow
- Recharts

### Backend

- Express 5
- Prisma 5
- PostgreSQL
- TypeScript
- JWT-related auth utilities

### Tooling

- Docker Compose (local DB)
- npm workspaces by folder-level scripts
- PM2/systemd options for Linux hosting
- Render-friendly deployment layout

## Repository Layout

```text
DSA-Tracker/
  backend/                     Express API + Prisma schema + seed
  frontend/                    Next.js application
  extension/                   Browser extension (LeetCode sync helpers)
  docker-compose.yml           Local PostgreSQL service
  package.json                 Root scripts to run frontend+backend together
  DEPLOYMENT.md                Detailed deployment documentation
  CONTRIBUTING.md              Contribution workflow
```

## Local Development Setup (Detailed)

### 1) Prerequisites

Install these first:

- Node.js 20 or newer
- npm 10 or newer
- Docker Desktop (or Docker Engine)
- Git

Check versions:

```bash
node -v
npm -v
docker -v
git --version
```

### 2) Clone Repository

```bash
git clone https://github.com/RajatSharma404/DSA-Tracker.git
cd DSA-Tracker
```

### 3) Start PostgreSQL

Local docker-compose default settings:

- User: postgres
- Password: password
- DB: dsatracker
- Port: 5432

Start DB:

```bash
docker compose up -d
```

Verify:

```bash
docker ps
```

### 4) Backend Setup

```bash
cd backend
npm install
```

Create backend/.env:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
NEXTAUTH_SECRET="replace-with-long-random-secret"
AUTH_SECRET="replace-with-same-secret"
ADMIN_EMAIL="you@example.com"
CORS_ORIGINS="http://localhost:3000"
ALLOW_INSECURE_CREDENTIALS_LOGIN="false"
```

Optional mail-related variables for login notification flows:

```env
LOGIN_NOTIFY_EMAIL="you@example.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-app-password"
NOTIFY_FROM="DSA Tracker <your-smtp-user>"
```

Initialize backend schema/data:

```bash
npx prisma db push
npx prisma db seed
```

### 5) Frontend Setup

```bash
cd ../frontend
npm install
```

Create frontend/.env.local:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-the-same-secret-used-in-backend"
```

Apply frontend-side Prisma schema:

```bash
npx prisma db push
```

### 6) Root Setup and Start

```bash
cd ..
npm install
npm run dev
```

This runs:

- backend dev server on 3001
- frontend dev server on 3000

### 7) Smoke Test

Open and verify:

- Frontend: http://localhost:3000
- Backend health: http://localhost:3001/health

If health is up and frontend loads login/dashboard shell, setup is successful.

## Core Scripts

### Root scripts

```bash
npm run dev      # starts backend + frontend together
npm run build    # builds backend then frontend
npm run start    # starts backend + frontend in prod mode
```

### Backend scripts

```bash
cd backend
npm run dev      # ts-node server
npm run build    # prebuild install + tsc + prisma generate
npm start        # node dist/index.js
```

### Frontend scripts

```bash
cd frontend
npm run dev
npm run build
npm start
```

## Environment Variable Reference

### Backend variables

| Variable                         | Required | Purpose                               |
| -------------------------------- | -------- | ------------------------------------- |
| NODE_ENV                         | Yes      | Runtime mode (development/production) |
| PORT                             | Yes      | Backend listening port                |
| DATABASE_URL                     | Yes      | Prisma/PostgreSQL connection string   |
| NEXTAUTH_SECRET                  | Yes      | Shared auth secret                    |
| AUTH_SECRET                      | No       | Alternate secret key name             |
| ADMIN_EMAIL                      | No       | Auto-admin promotion or admin logic   |
| CORS_ORIGINS                     | No       | Comma-separated allowlist             |
| ALLOW_INSECURE_CREDENTIALS_LOGIN | No       | Dev-only insecure fallback            |
| LOGIN_NOTIFY_EMAIL               | No       | Login notification receiver           |
| SMTP_HOST                        | No       | SMTP host                             |
| SMTP_PORT                        | No       | SMTP port                             |
| SMTP_USER                        | No       | SMTP username                         |
| SMTP_PASS                        | No       | SMTP password/app password            |
| NOTIFY_FROM                      | No       | Email from identity                   |

### Frontend variables

| Variable                     | Required                  | Purpose                               |
| ---------------------------- | ------------------------- | ------------------------------------- |
| DATABASE_URL                 | Yes                       | NextAuth Prisma adapter DB access     |
| NEXTAUTH_URL                 | Yes                       | Public frontend URL                   |
| NEXTAUTH_SECRET              | Yes                       | Must match backend secret             |
| BACKEND_URL                  | Recommended in production | Frontend proxy target for backend API |
| NEXT_PUBLIC_API_URL          | Optional                  | Legacy/fallback API base              |
| NEXT_PUBLIC_FORCE_REMOTE_API | Optional                  | Force browser to use remote API base  |

Production recommendation: set BACKEND_URL on frontend service and avoid NEXT_PUBLIC_API_URL unless you intentionally need direct remote API behavior.

## API Surface (High-Level)

The backend exposes multiple authenticated and utility routes.

Examples:

- GET /health
- GET /api/dashboard
- GET /api/topics
- POST /api/progress
- GET /api/search
- GET /api/learn/tracks
- GET /api/learn/tracks/:trackSlug/modules/:moduleSlug/lessons/:lessonSlug
- POST /api/learn/lessons/:lessonId/progress
- POST /api/ai/hint
- POST /api/ai/review
- POST /api/ai/trace
- POST /api/extension/sync

Most /api routes require authenticated context, while /health is public.

## Feature Map by Product Area

### Dashboard

- Progress summary
- Streak visibility
- Weak topic focus
- Daily guidance and activity insights

### Learn

- Track -> module -> lesson learning model
- Progress state per lesson
- Structured theory-first workflow

### Problems Workspace

- Language editor flow
- Submission persistence
- Solution retrieval and updates

### Explore and Organization

- Search
- Bookmarks
- Tags
- Notes

### Interview and Challenge Areas

- Interview logging
- Timed challenge workflows

### AI-Assisted Utilities

- Hints
- Reviews
- Trace-style assistance

## Browser Extension (extension folder)

Purpose:

- Assist LeetCode-related sync workflows with backend endpoint integration

Install locally (Chrome/Edge):

1. Open chrome://extensions or edge://extensions.
2. Enable Developer Mode.
3. Click Load unpacked.
4. Select the extension directory from this repo.

If syncing against deployed backend, configure extension storage base URL to your backend domain.

### LeetCode editor and submit flow

The solve flow supports multiple languages and can submit directly to LeetCode through backend + extension integration.

Supported languages:

- C++
- C
- Java
- Python3

Recommended setup for direct submit:

1. Log in to LeetCode in the same browser profile.
2. Copy the LEETCODE_SESSION cookie value from browser devtools.
3. Paste it in the app Settings page.
4. Open a problem and use the Solve page/editor.
5. Select language, write code, and submit.

Submit lifecycle:

1. Client sends code + language.
2. Backend forwards submission request.
3. App polls submission status.
4. Verdict, runtime, and memory are shown.
5. Accepted submissions can update progress automatically.

Common fixes:

- Session missing/expired: refresh LEETCODE_SESSION.
- Wrong profile: ensure LeetCode login and extension use the same browser profile.
- Stale extension runtime: reload extension and refresh both app + LeetCode tabs.

### Comprehensive DSA bootcamp seeding

The repository includes a full tutoring curriculum generator/seed flow for the Learn section.

What gets created:

- 1 theory track: Complete DSA Bootcamp (C++)
- 20 modules in sequence
- 20 lessons
- 40 content blocks (theory + practice/checkpoint)

Admin seed endpoint:

- POST /api/admin/learn/seed-comprehensive

Example call:

```bash
curl -X POST http://localhost:3001/api/admin/learn/seed-comprehensive \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response shape:

```json
{
  "success": true,
  "trackId": "<uuid>",
  "modulesCreated": 20,
  "lessonsCreated": 20,
  "blocksCreated": 40,
  "trackTitle": "Complete DSA Bootcamp (C++)"
}
```

Topic order in the bootcamp:

1. Complexity Analysis
2. Arrays
3. Strings
4. Linked Lists
5. Stack and Queue
6. Hashing
7. Binary Trees
8. Binary Search Trees
9. Heaps and Priority Queues
10. Tries
11. Graphs Basics
12. Sorting Algorithms
13. Binary Search
14. Recursion Fundamentals
15. Backtracking Strategies
16. Greedy Algorithms
17. Dynamic Programming
18. Advanced DSU/Segment Trees/BIT
19. Bit Manipulation
20. Advanced Graphs

## Deployment Summary

This section merges the practical deployment paths for both Render and Linux VM setups.

### Backend service (Render)

- Root Directory: backend
- Install Command: npm install
- Build Command: npm run build
- Start Command: npm start
- Environment: Node

Required env vars:

- NODE_ENV=production
- PORT=3001 (or Render provided port handling style)
- DATABASE_URL=<render-postgres-internal-url>
- NEXTAUTH_SECRET=<long-random-secret>

### Frontend service (Render)

- Root Directory: frontend
- Install Command: npm install
- Build Command: npm run build
- Start Command: npm start

Required env vars:

- DATABASE_URL=<render-postgres-internal-url>
- NEXTAUTH_URL=<frontend-public-url>
- NEXTAUTH_SECRET=<same-secret-as-backend>
- BACKEND_URL=<backend-public-url>

Render note:

- Prefer BACKEND_URL and same-origin /api proxy behavior.
- Avoid setting NEXT_PUBLIC_API_URL unless you intentionally bypass proxy routing.

### Cache and stale deploys

If deploy appears stale:

1. Use Manual Deploy.
2. Choose Clear build cache and deploy if available.
3. If that option is not shown, update a dummy env var (for example CACHE_BUSTER) and redeploy.

### Linux VM deployment (systemd or PM2)

Prerequisites:

- Ubuntu/Debian server
- Node.js 20+
- Docker installed
- Optional domain + SSL setup

Build on server:

```bash
git clone <your-repo-url>
cd DSA-Tracker
npm install
npm run build
```

Option A: systemd

1. Update dsa-tracker.service with your user/path/node binary.
2. Install and enable service.

```bash
sudo cp dsa-tracker.service /etc/systemd/system/dsa-tracker.service
sudo systemctl daemon-reload
sudo systemctl enable --now dsa-tracker
sudo systemctl status dsa-tracker
```

Option B: PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx and SSL (Linux)

Typical reverse proxy pattern:

- Frontend on localhost:3000
- Backend API on localhost:3001

Then secure with certbot:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Troubleshooting

### Build fails with many Cannot find module TypeScript errors

Cause: dependencies/tooling are not available during compile in deployment environment.

Fix:

1. Ensure backend Root Directory is backend.
2. Ensure Install Command is npm install.
3. Ensure Build Command is npm run build.
4. Redeploy with cleared cache.

### Local backend build fails with Windows EPERM on Prisma engine rename

This is usually a local file lock on the Prisma engine binary.

Try:

1. Stop running node processes using backend/node_modules/.prisma files.
2. Close terminals or watchers using backend.
3. Re-run npm install and npm run build.

### Next dev lock conflict in frontend

If frontend/.next/dev/lock blocks startup:

1. Stop duplicate next dev processes.
2. Delete frontend/.next/dev/lock.
3. Start only one frontend dev server.

### Learn data fails only in deployed environment

Check frontend BACKEND_URL and redeploy with clean cache.

Also verify backend /health and /api/learn/tracks from deployed URLs.

### Auth/session mismatch issues

Ensure NEXTAUTH_SECRET is identical in frontend and backend environments.

### LeetCode submit flow fails

1. Verify LEETCODE_SESSION is set and valid.
2. Verify LeetCode login is active in same browser profile.
3. Reload extension from chrome://extensions.
4. Retry with a problem that has valid LeetCode slug/link data.

### Comprehensive seed endpoint fails

1. Confirm request has admin JWT.
2. Confirm backend DB schema is applied.
3. Check backend logs for prisma constraint or duplicate key errors.
4. Re-run npx prisma db push and retry.

## Contributing

Contribution workflow (merged summary):

1. Create a branch.
2. Keep commits focused.
3. Include test/verification notes in PR description.

Suggested branch flow:

```bash
git checkout main
git pull origin main
git checkout -b feat/your-change
```

Commit style (recommended):

- feat: new feature
- fix: bug fix
- docs: documentation-only changes
- refactor: structural code improvement without behavior change
- chore: tooling/dependency/build updates

Before opening PR:

1. Run the app locally and verify both frontend + backend start.
2. Run lint where applicable.
3. Add screenshots for UI changes.
4. Document manual verification steps.

## License

MIT. See LICENSE.
