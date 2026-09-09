# DSA Tracker Pro - Agent Directives & Command Rules

## Single-Word `/update` Command

When the user enters `/update`, `update`, `uypdate`, `eod`, or asks for an end-of-day / before-leaving-desk wrap up:
- Immediately activate and run the **`update`** skill runbook (`.agents/skills/update/SKILL.md`).
- Execute all 7 stages:
  1. **Pre-flight QA**: TypeScript type checks (`npx tsc --noEmit`) and tests (`npm test` in `frontend` and `backend`).
  2. **Cross-Platform**: Mobile Capacitor sync and browser extension verification.
  3. **Documentation**: Keep `README.md` and `docs/` fully updated with new features and test counts.
  4. **Daily Developer Log**: Append an entry to `docs/DAILY_LOG.md`.
  5. **Hygiene**: Clean up any temporary or stray files.
  6. **Git Version Control**: Stage changes (`git add -A`) and commit with Conventional Commits format (`git commit`).
  7. **EOD Briefing**: Provide a concise summary of changes, commit SHA, and test metrics.
