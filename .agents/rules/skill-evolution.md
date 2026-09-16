# Autonomous Skill Self-Evolution Rule

Whenever changes are made to the **DSA Tracker Pro** codebase, the agent MUST automatically verify whether any skill in `.agents/skills/` requires an update to reflect new architectural features, routes, models, or configurations.

## Automatic Update Triggers & Target Skills

1. **New API Route or Middleware**:
   - Update `.agents/skills/security-gate/SKILL.md` (route inventory, IDOR ownership check, and rate limiting rules).
   - If the route interacts with the browser extension, update `.agents/skills/extension-sync/SKILL.md`.

2. **Prisma Schema or Database Model Shift**:
   - Update `.agents/skills/schema-guard/SKILL.md` with the new model name and sync check.
   - Run `npm run sync:prisma` to ensure byte-for-byte schema parity.

3. **New DSA Solution, Topic, or Language Added**:
   - Update `.agents/skills/solution-vault/SKILL.md` to document the new topic directory or language extension template.
   - Run `node scripts/sync-solutions.js` to refresh `solutions/README.md`.

4. **Mobile Native Plugins or PWA Cache Updates**:
   - Update `.agents/skills/mobile-sync/SKILL.md` with new Capacitor plugin instructions or permissions.

5. **New QA Checks or NPM Scripts Added**:
   - Update `.agents/skills/update/SKILL.md` and `.agents/skills/commit/SKILL.md` so that Stage 1 quality gates run the updated tests.

## Maintenance Guidelines
- Always preserve valid YAML frontmatter (`name` and `description`).
- Keep skill runbooks clean, actionable, and formatted with mermaid workflow diagrams.
- Strictly adhere to Google/Gemini privacy and security policies (zero secret exposure, no unauthorized scraping, safe non-destructive database actions).
