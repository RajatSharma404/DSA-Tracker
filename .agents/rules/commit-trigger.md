# Single-Word `/commit` Command Rule

When the user enters any of the following triggers:
- `/commit`
- `commit`
- Or any phrase requesting to commit and push changes one file per commit

You MUST immediately activate and execute the **`commit`** skill (`.agents/skills/commit/SKILL.md`).

## Required Autonomous Workflow
Do NOT stop to ask clarifying questions or require multi-turn confirmation. Perform the entire sequence:
1. **Pre-commit quality check**: Ensure all tests, typechecks, and schema checks pass.
2. **Per-file commits**: Stage each file individually (`git add <file>`) and commit it with a tailored Conventional Commit message (`git commit -m "<type>(<scope>): <summary>"`).
3. **Verify clean tree**: Ensure `git status -s` is empty.
4. **Push to remote**: Run `git push origin <branch>`.
5. **Report summary**: Deliver a markdown table with all commit SHAs, file names, and descriptions.
