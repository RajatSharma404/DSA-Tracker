# Architecture

This document describes runtime boundaries and request flow across frontend, backend, database, and extension.

## High-Level Components

- Frontend app: Next.js App Router in `frontend/`
- Backend API: Express server in `backend/`
- Database: PostgreSQL accessed by Prisma clients
- Browser extension: optional sync bridge in `extension/`

## Runtime Ports (Local)

- frontend: `3000`
- backend: `3001`
- postgres: `5432`

## Request Flow

## Browser -> Frontend

Users interact with Next.js pages and client components.

## Frontend -> API

Frontend API calls use `/api` relative base by default. Rewrites in `frontend/next.config.ts` split traffic:

- `/api/auth/*` stays in Next.js for NextAuth handlers
- all other `/api/*` rewrites to backend `BACKEND_URL` base

This preserves a single same-origin API surface for clients while separating auth handler and business API execution.

## Auth Token Flow

1. user signs in via NextAuth route
2. JWT callback signs `accessToken` with shared secret
3. client axios interceptor attaches bearer token
4. backend verifies token against `NEXTAUTH_SECRET` and fallback `AUTH_SECRET`

## Authorization

- frontend middleware in `frontend/src/proxy.ts` blocks unauthenticated dashboard pages
- `/admin` route requires token role `ADMIN`
- backend also checks auth/role before protected mutations and admin actions

## Backend Responsibilities

Backend (`backend/index.ts`) is the business core:

- roadmap/topic/problem retrieval and mutation
- user progress and spaced repetition logic
- analytics aggregation and reports
- challenge and interview operations
- AI endpoint orchestration
- note/solution/tag/bookmark persistence
- LeetCode submission and sync endpoints
- extension sync endpoint

## Data Access Layer

Prisma client in backend maps domain models defined in `backend/prisma/schema.prisma` to PostgreSQL tables.

Frontend also includes Prisma schema for auth adapter compatibility in NextAuth contexts.

## Extension Integration Flow

Extension workflow:

1. content script detects accepted submission on LeetCode
2. background worker reads `LEETCODE_SESSION` cookie
3. background posts `problemSlug` + session token to `/api/extension/sync`
4. backend resolves/updates user progress and related records

Security notes from implementation:

- extension allows localhost HTTP bases for development
- non-local bases must be HTTPS
- extension can store one or multiple candidate API bases

## Deployment Topologies

Supported operational patterns from repository files:

- local monorepo concurrent dev
- PM2 process manager (`ecosystem.config.js`)
- systemd service (`dsa-tracker.service`)
- split frontend/backend service deployment

## Failure Isolation

- frontend can still render auth routes even when backend is unavailable
- backend health endpoint supports readiness checks
- extension sync errors are isolated from core web app runtime

## Related Documents

- [Developer Operations](./developer-operations.md)
- [API Reference](./reference/api-reference.md)
- [Data Model Reference](./reference/data-model.md)
- [Environment Variables](./reference/environment-variables.md)
