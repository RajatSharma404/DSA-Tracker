# Single-Word `/update` Command Rule

When the user enters any of the following triggers:
- `/update`
- `update`
- `uypdate`
- `eod`
- `wrap up`
- Or any phrase requesting an end-of-day / pre-departure repository sync

You MUST immediately activate and execute the **`update`** skill (`.agents/skills/update/SKILL.md`).

## Required Autonomous Workflow
Do NOT stop to ask clarifying questions or require multi-turn confirmation. Perform the entire sequence:
1. **Pre-flight verification**: Verify TypeScript types (`npx tsc --noEmit`) and run full test suites (`npm test` in frontend and backend).
2. **Platform & Build Validation**: Verify mobile Capacitor sync (`npx cap sync`) and extension files if applicable.
3. **Documentation Sync**: Verify and update `README.md` and `docs/` to reflect any newly created features, APIs, routes, or test counts.
4. **Developer Work Log**: Append a dated entry to `docs/DAILY_LOG.md` recording features completed, bug fixes, test scores, and file changes.
5. **Hygiene & Cleanup**: Verify working directory is clean of unwanted temporary files.
6. **Git Version Control**: Stage all verified changes (`git add -A`), generate a clean Conventional Commit message (`git commit`), and report branch sync status (`git status -sb`).
7. **EOD Briefing**: Output a clean, concise End-of-Day briefing with commit SHA, test metrics, and next steps for the next session.
