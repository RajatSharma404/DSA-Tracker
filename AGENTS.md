# DSA Tracker Pro - Agent Directives & Command Rules

## Single-Word `/update` Command

When the user enters `/update`, `update`, `uypdate`, `eod`, or asks for an end-of-day / before-leaving-desk wrap up:
- Activate **`clean-code-guard`**, **`vitest-skill`**, **`deployment-procedures`**, and **`git-commit-message`** runbooks.
- Execute all 7 stages:
  1. **Pre-flight QA**: TypeScript type checks (`npx tsc --noEmit`) and unit tests (`npm test` in `frontend` and `backend` using `vitest-skill`).
  2. **Cross-Platform & Offline Sync**: Verify Chrome extension Manifest V3 and PWA / Capacitor assets (`chrome-extension-developer`, `progressive-web-app`).
  3. **Documentation**: Keep `README.md` and `docs/` fully updated with new features, test metrics, and architecture.
  4. **Daily Developer Log**: Append an entry to `docs/DAILY_LOG.md`.
  5. **Hygiene & Clean Code**: Clean up any temporary or stray files; enforce SOLID/DRY rules (`clean-code`).
  6. **Git Version Control**: Stage changes (`git add -A`) and commit with Conventional Commits format (`git-commit-message`).
  7. **EOD Briefing**: Provide a concise summary of changes, commit SHA, and test metrics.

## Specialized Domain Skills & Directives (Upgraded from agentic-awesome-skills)

- **`/solution` or `/add-solution`**: Activate **`lemmaly`**, **`matematico-tao`**, and **`cpp-pro`** to state Big-O, data structures, and algorithm family before coding; calculate complexity invariants; and scaffold clean multi-language solutions.
- **`/schema` or `/db-sync`**: Activate **`database-migration`** and **`database-design`** to ensure dual-Prisma schema parity between backend and frontend, execute non-destructive zero-downtime migrations (`prisma db push` / `prisma migrate deploy`), and optimize composite indexes.
- **`/extension` or `/ext-sync`**: Activate **`chrome-extension-developer`** and **`browser-extension-builder`** to validate Manifest V3 permissions, background service worker listeners, DOM event parsers, and API sync.
- **`/mobile` or `/cap-sync`**: Activate **`progressive-web-app`** to sync frontend builds to native Android via Capacitor and verify PWA offline queues and service worker caching.
- **`/security` or `/audit`**: Activate **`007`**, **`broken-authentication`**, and **`prompt-injection-defense`** to audit IDOR protections, JWT cookies, NextAuth session tokens, rate limits, sanitize inputs, and safeguard AI prompts.
- **`/improvement` or `/audit-full`**: Activate **`clean-code`**, **`clean-code-guard`**, **`backend-dev-guidelines`**, **`api-design-principles`**, and **`nextjs-app-router-patterns`** to perform an exhaustive full-stack project audit across frontend, backend, and DB; brainstorm multi-solution approaches; and produce an actionable step-by-step implementation plan.
- **`/frontend` or `/ui`**: Activate **`tailwind-design-system`**, **`frontend-ui-dark-ts`**, and **`react-nextjs-development`** for modern dark-themed UI components, design tokens, and smooth micro-interactions.
- **`/3d` or `/city`**: Activate **`3d-web-experience`** and **`threejs-fundamentals`** to optimize React Three Fiber shaders, scene graphs, lighting, and WebGL rendering in the 3D City Progress visualizer.
- **`/ai` or `/tutoring`**: Activate **`prompt-engineering`** and **`prompt-injection-defense`** for Gemini AI tutoring prompts, AST code visualizer heuristics, and safe evaluation.
- **`/deploy` or `/docker`**: Activate **`deployment-procedures`** and **`docker-expert`** to validate multi-stage Docker builds, Render deployment configs, and environment variable guards.
- **`/test` or `/qa`**: Activate **`vitest-skill`** and **`test-driven-development`** for test-driven development, mocked API contracts, and coverage gates.

## 🔄 Autonomous Skill Self-Evolution & Technology Modernization Protocol

Whenever any new technology, framework, dependency, runtime, npm package, database model, route, component, or architectural pattern is introduced, upgraded, or deprecated:
1. **Universal Skill Self-Update**: The agent MUST automatically inspect `.agents/skills/` and update ALL affected `SKILL.md` runbooks, checklists, and scripts so skills perpetually adapt to the latest technology and never suffer from obsolescence or documentation drift.
2. **Automated Tooling Modernization**: Update all helper scripts (`scripts/*.mjs`, `scripts/*.ps1`, `scripts/*.sh`) in the skills to support new build systems, test runners, compiler flags, and CLI arguments.
3. **Proactive Modernization**: Do not wait for explicit user commands to modernize skills; automatically synchronize skill runbooks during daily commits, EOD updates, and feature implementations.

