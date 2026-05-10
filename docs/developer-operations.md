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

## Backend scripts

- `npm run dev`: run backend TypeScript entry
- `npm run build`: TypeScript compile + Prisma generate
- `npm start`: run compiled backend from `dist`

## Frontend scripts

- `npm run dev`: Next.js dev server
- `npm run build`: Next.js production build
- `npm start`: start production Next.js server

## Database Workflow

Typical local flow:

```bash
docker compose up -d
cd backend
npx prisma db push
npx prisma db seed
cd ../frontend
npx prisma db push
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
