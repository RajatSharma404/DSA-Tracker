# Contributing to DSA Tracker Pro

Thank you for contributing to **DSA Tracker Pro**! To maintain architectural stability, database integrity, and high test coverage, all contributors must follow the engineering protocols outlined below.

---

## 1. Development Setup

### Prerequisites
- **Node.js:** `>= 22.0.0`
- **npm:** `>= 10.0.0`
- **PostgreSQL:** `>= 15.0`

### Installation & Initialization
```bash
# 1. Clone repository
git clone https://github.com/RajatSharma404/DSA-Tracker.git
cd DSA-Tracker

# 2. Install dependencies across root, backend, and frontend
npm install
npm install --prefix backend
npm install --prefix frontend

# 3. Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 4. Apply database migrations
cd backend && npx prisma migrate deploy && cd ..

# 5. Seed initial curriculum data
cd backend && npx prisma db seed && cd ..

# 6. Start development servers concurrently
npm run dev
```

- **Frontend Application:** `http://localhost:3005`
- **Backend API:** `http://localhost:3001`

---

## 2. Branching & Git Workflow

- **Branch Naming:**
  - Modernization phases: `upgrade/phase-<number>` (e.g. `upgrade/phase-6b`)
  - Features: `feat/<short-description>`
  - Fixes: `fix/<short-description>`
  - Documentation & Chores: `docs/<short-description>`, `chore/<short-description>`
- **Commit Message Convention:** Conventional Commits standard (`type(scope): imperative subject`):
  - `feat(scheduler): implement FSRS interval calculation`
  - `fix(extension): sanitize payload schema before bulk upsert`
  - `docs(adr): document local-first offline review outbox`
  - `test(e2e): add keyboard navigation spec for flashcards`

---

## 3. The Dual-Prisma Schema Parity Rule

DSA Tracker Pro maintains two Prisma schema files:
1. `backend/prisma/schema.prisma` (Primary source of truth for database migrations and Express models)
2. `frontend/prisma/schema.prisma` (Client mirror used for NextAuth adapter type generation)

> [!IMPORTANT]
> **Both schemas must remain 100% bit-for-bit identical at all times.**
> Whenever you modify `backend/prisma/schema.prisma`, you must synchronize it to the frontend:
> ```bash
> npm run sync:prisma
> npm run check:prisma-sync
> ```
> The CI pipeline will automatically reject any pull request where the schemas differ.

---

## 4. How to Add a Database Migration

Never use `prisma db push` for shared code or production environments. All schema modifications require versioned Prisma migrations:

1. Edit `backend/prisma/schema.prisma`.
2. Generate the migration SQL file:
   ```bash
   cd backend
   npx prisma migrate dev --name <descriptive_change_name>
   cd ..
   ```
3. Synchronize to the frontend schema:
   ```bash
   npm run sync:prisma
   ```
4. Verify zero schema drift:
   ```bash
   npm run check:prisma-sync
   ```
5. Update or regenerate the Mermaid ER diagrams:
   ```bash
   npm run docs:erd
   npm run check:erd
   ```

---

## 5. Pre-Commit Quality & Test Gates

Before opening a pull request or committing changes, all verification gates must pass locally:

```bash
# 1. Typecheck TypeScript across both tiers
npm run typecheck

# 2. Lint frontend React and Next.js components
npm run lint

# 3. Run all Vitest unit and integration suites
npm test

# 4. Run Playwright E2E suites with repeat check
npx playwright test --repeat-each=3

# 5. Verify ERD freshness and Mermaid syntax
npm run check:erd
npm run check:mermaid

# 6. Verify documentation links
npm run check:links
```

---

## 6. Code Style & Engineering Standards

- **Design Tokens Only:** All frontend styles must use CSS variables and tokens from `frontend/src/app/globals.css`. Never introduce hardcoded hex color values or ad-hoc Tailwind color utilities.
- **Strict TypeScript:** No new `any` types. No `@ts-ignore` suppressions.
- **Input Validation:** All backend routes and controller inputs must be validated with Zod schemas before business execution.
- **Zero Server-Side Code Execution:** Never introduce `eval()`, `new Function()`, or dynamic execution primitives.
- **Clean Code & Feature Flags:** Do not leave commented-out blocks of dead code. Experimental or incomplete features must be cleanly gated via `backend/features.ts` and `FeaturesProvider` matching [docs/scope.md](file:///d:/DSA-Tracker/docs/scope.md).

