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

## Single-Word `/commit` Command

When the user enters `/commit`, `commit`, or asks to commit and push changes one file per commit:
- Immediately activate and run the **`commit`** skill runbook (`.agents/skills/commit/SKILL.md`).
- Execute all stages:
  1. **Pre-flight QA**: Verify TypeScript types and tests pass.
  2. **Per-File Commits**: Commit every changed or new file individually with a scoped Conventional Commit message.
  3. **Verify Clean Tree**: Confirm `git status -s` is clean.
  4. **Git Push**: Push the branch to remote tracking repository (`git push origin <branch>`).
  5. **Summary**: Provide a detailed table of all commits and SHAs.

