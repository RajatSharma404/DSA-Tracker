# ADR 0007: AI Candidate Generator with Server-Side Heuristic Chooser

- **Status:** Accepted
- **Date:** 2026-11-12
- **Deciders:** Engineering Team

---

## Context
The application utilizes Google Gemini AI to assist users with contextual algorithmic hints, code review architectural feedback, and custom study plans. Relying purely on raw LLM responses caused multiple issues:
- Unpredictable formatting or missing schema fields.
- Hallucinated or mathematically inaccurate Big-O time and space complexity evaluations.
- Vulnerability to prompt injection attacks when user code contains adversarial system override instructions.
- Quota exhaustion during peak usage without sensible daily limits.

## Decision
We implemented the **AI Candidate Generator / Server-Side Heuristic Chooser** architecture:
1. **Configurable Model & Timeouts:** Replaced hardcoded model strings with `GEMINI_MODEL` (defaulting to official `gemini-2.5-flash`), backed by strict 8-second request timeouts and fallback handlers.
2. **Deterministic AST Ground Truth:** For code complexity evaluation, we introduced an AST parser (`acorn` and `acorn-walk` in `backend/services/complexity/`) to extract loop depths, recursion trees, and allocation patterns. The server uses this deterministic analysis as ground truth, using AI purely to provide natural language explanations.
3. **Prompt Injection Defense:** User code is strictly wrapped in quarantined, escaped markdown delimiters with explicit non-executable system boundaries. System prompts instruct the model to ignore any instructions inside user submission blocks.
4. **Fine-Grained Quota Rate Limiting:** Enforced daily per-user quotas via `AiUsage` tracking table (`AI_DAILY_LIMIT_HINTS`, `AI_DAILY_LIMIT_REVIEW`, `AI_DAILY_LIMIT_PLAN`).

## Alternatives Considered
- **Direct Client-to-Gemini SDK Calls:** Rejected because it exposes API keys to client browsers and prevents server-side rate-limiting and validation.
- **Regex-Only Complexity Heuristics:** Fragile and easily confounded by nested functions, closures, or non-standard syntax.

## Consequences
- **Positive:** Reliable, deterministic complexity metrics; robust defense against prompt injection; zero risk of unexpected AI billing spikes.
- **Negative / Trade-offs:** Requires server compute overhead for AST traversal prior to generating AI prompts.

## Implementation Files
- [backend/services/geminiService.ts](../../backend/services/geminiService.ts)
- [backend/services/complexity/](../../backend/services/complexity/)
- [backend/routes/ai.routes.ts](../../backend/routes/ai.routes.ts)
- [backend/prisma/schema.prisma](../../backend/prisma/schema.prisma)
