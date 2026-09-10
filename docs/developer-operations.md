# Developer Operations

This document covers engineering workflows: running, building, seeding, and deploying DSA Tracker.

## Repository Layout

- `frontend/`: Next.js app, NextAuth routes, client-side API layer
- `backend/`: Express API and business logic
- `extension/`: browser extension for sync behavior
- `backend/prisma/`: backend schema and migrations
- `frontend/prisma/`: frontend schema for auth-related data access

## Primary Scripts

## Root scripts

- `npm run dev`: run backend + frontend concurrently
- `npm run build`: build backend then frontend
- `npm run start`: start both services in production mode
- `npm run typecheck`: run TypeScript diagnostics check concurrently across both apps
- `npm run lint`: run ESLint across the frontend codebase
- `npm run check:prisma-sync`: verify backend and frontend Prisma schemas are byte-for-byte in sync
- `npm run sync:prisma`: copy backend Prisma schema to frontend
- `npm run qa`: execute complete local CI quality gate (Prisma sync, typecheck, lint, all 304 tests)

## Backend scripts

- `npm run dev`: run backend TypeScript entry via ts-node
- `npm run build`: TypeScript compile to dist/ + Prisma generate
- `npm start`: run compiled backend from `dist/index.js`
- `npm test`: run backend Vitest test suite (113 tests across 10 files)

## Frontend scripts

- `npm run dev`: Next.js dev server on port 3005 (0.0.0.0 for mobile testing)
- `npm run build`: Next.js production build with standalone output
- `npm start`: start production Next.js server on port 3005
- `npm run lint`: run ESLint (0 errors)
- `npm test`: run frontend Vitest test suite (191 tests across 45 files)
- `npm run cap:sync`: synchronize web assets and plugins to Android native shell

## Database & Container Workflow

Multi-tier Docker Compose (PostgreSQL 15, backend, and Next.js standalone frontend):

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f
```

Local database flow:

```bash
docker compose up -d db
cd backend
npx prisma db push
npx prisma db seed
npm run check:prisma-sync
```

## Seeding Modes

- baseline seed via backend Prisma seed script
- roadmap/admin seed via API endpoint
- comprehensive theory bootcamp seed via admin endpoint

Comprehensive bootcamp endpoint:

- `POST /api/admin/learn/seed-comprehensive`

Requires authenticated admin bearer token.

## Authentication/Authorization Dev Notes

- shared secret between frontend and backend is mandatory
- admin route access is validated on frontend and backend
- credentials login is intentionally disabled by default

## Extension Development Notes

Extension behavior uses:

- manifest V3 service worker
- content script bridge to page
- background message handlers for sync and submission actions

Host permissions include localhost and LeetCode. Remote APIs should be HTTPS unless local dev.

## Deployment Options

## PM2

Use `ecosystem.config.js` to start frontend and backend apps.

```bash
pm2 start ecosystem.config.js
pm2 save
```

## systemd

`dsa-tracker.service` contains a Linux service template for root-level npm start.

## Split service deployment

Frontend and backend can be deployed as separate services if env vars match routing model:

- frontend points rewrites to backend base via `BACKEND_URL`
- backend exposes API and health endpoints

## Operational Checks

- backend health endpoint responds at `/health`
- NextAuth routes resolve under `/api/auth/*`
- non-auth API routes proxy correctly to backend
- DB migrations/schema state matches current Prisma models

## Recommended Change Discipline

Whenever changing API/schema/auth/config:

1. update relevant docs page in `docs/`
2. verify scripts still succeed
3. run local sanity test of login, dashboard load, and one mutation endpoint

## Related Documents

- [Getting Started](./getting-started.md)
- [Environment Variables](./reference/environment-variables.md)
- [Troubleshooting](./troubleshooting.md)
