# ADR 0004: Enforcing Versioned Migrations Over Prisma DB Push

- **Status:** Accepted
- **Date:** 2026-11-10
- **Deciders:** Engineering Team

---

## Context
Deployments on Render and local automated setup scripts previously invoked `prisma db push`. While convenient for early prototyping, `db push` executes ad-hoc database mutations without generating versioned, reviewable SQL migration files. In team workflows and production environments, `db push` risks silent data loss, cannot handle column renames safely, and prevents rollback tracking.

## Decision
We transitioned the project to strict version-controlled migrations:
1. **Initial Baseline:** Baselined the pre-upgrade schema using `prisma migrate diff` into `backend/prisma/migrations/0_init/migration.sql` and resolved it across existing databases.
2. **Production Deployment Script:** Updated `build:render` in `backend/package.json` to:
   ```bash
   prisma generate && tsc && prisma migrate deploy
   ```
3. **Local Dev Demotion:** Relegated `prisma db push` strictly to an explicit local scratch script (`npm run db:push`).
4. **CI Drift Detection:** Added a mandatory CI pipeline check running `prisma migrate diff` to guarantee zero uncommitted schema drift before pull requests can merge.

## Alternatives Considered
- **Continue using `db push` with manual SQL dumps:** Rejected due to non-deterministic schema states and lack of peer review for schema mutations.
- **Third-Party Migration Tools (e.g. Flyway, Liquibase):** Unnecessary added complexity given Prisma's native migration tooling.

## Consequences
- **Positive:** Fully deterministic, auditable, and repeatable database schema deployments; zero risk of unintended data destruction in production.
- **Negative / Trade-offs:** Developers must run `npx prisma migrate dev --name <change>` for any schema modification instead of quick ad-hoc syncs.

## Implementation Files
- [backend/package.json](../../backend/package.json)
- [backend/prisma/migrations/0_init/migration.sql](../../backend/prisma/migrations/0_init/migration.sql)
- [.github/workflows/ci.yml](../../.github/workflows/ci.yml)
