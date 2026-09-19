# Single-Word `/improvement` Command Rule

When the user enters any of the following triggers:
- `/improvement`
- `review my project`
- `audit this codebase`
- `find bugs in my project`
- `what can I improve in my code`
- Or shares a repository / code files and asks for architectural or code improvement feedback

You MUST immediately activate and execute the **`improvement`** skill ([.agents/skills/improvement/SKILL.md](file:///d:/DSA-Tracker/.agents/skills/improvement/SKILL.md)).

## Required Autonomous Workflow
1. **Reconnaissance**: Understand the target project purpose, tech stack (Next.js 15/16, React 19, Tailwind CSS 4, Node/Express 5, Prisma, PostgreSQL, Flask/Python), directory layout, and architectural patterns.
2. **Deep Inspection**: Audit for bugs, race conditions, performance bottlenecks, security flaws (IDOR, XSS, injection), and unhandled edge cases.
3. **Prioritized Report**: Generate the structured senior-engineer markdown report covering:
   - 🐛 **Bug Fixes** (with line references and Before/After diff blocks)
   - ⚠️ **Major Changes** (Architecture, Performance, Security, Scalability - Critical/High/Medium/Low)
   - 🔧 **Minor Changes** (Code quality, naming, dead code, missing types)
   - ✨ **Feature Additions** (Proactive high-value suggestions with implementation patterns)
   - 📁 **File-by-File Breakdown Table**
4. **Be Opinionated & Specific**: Provide concrete, runnable code snippets rather than generic recommendations.
5. **Privacy Compliance**: Mask all credentials, API keys, and sensitive tokens found during the audit.
6. **Autonomous Self-Evolution**: Update the skill runbook if new frameworks or architectural patterns are encountered.
