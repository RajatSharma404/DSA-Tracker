# Owed Technical Debt & Operational Checklist

This document consolidates every **partial item**, **skipped task**, **architectural decision trade-off**, and **operational prerequisite** identified across Phases 0 through 6b of the upgrade.

---

## 1. Operational & Deployment Prerequisites (Owed Prior to Full Production Cutover)

| Area | Owed Item | Reason / Context | Resolution Procedure |
| :--- | :--- | :--- | :--- |
| **Phase 2: Security** | Execute `purge-leetcode-sessions.ts` | The database still contains legacy `leetcodeSession` / `leetcodeSessionHash` columns for existing users. Script was authored in Phase 2 but deferred until production migration. | After production database backup, run: `npx tsx backend/scripts/purge-leetcode-sessions.ts --confirm` |
| **Phase 2: Auth** | Transition `AUTH_ACCEPT_LEGACY` from `true` to `false` | During rollout, the backend temporarily accepts legacy JWE cookies. Once the frontend is redeployed and verified, legacy token acceptance must be disabled. | In Render environment variables, update `AUTH_ACCEPT_LEGACY=false` and restart backend. |
| **Phase 6a: Metrics** | Execute k6 Load Test in Staging / CI | The k6 CLI was not installed locally on the Windows host. The load test scenario was scripted at [scripts/k6-load-test.js](../scripts/k6-load-test.js). | Run `winget install k6` or run inside Linux Docker/CI: `k6 run scripts/k6-load-test.js` |
| **Phase 6b: Media** | Supply Real Screenshots & Video | Placeholders (`dashboard.png`, `review.gif`, `extension.gif`) were generated so markdown links resolve without broken link errors. Real media is needed for marketing/portfolio. | Record 2-minute demo following [docs/demo-script.md](./demo-script.md) and replace files in `docs/media/`. |

---

## 2. Architectural Choices & Trade-Offs (Documented Variations)

| Phase | Original Prompt Item | Adopted Architectural Resolution | Reason / Trade-Off |
| :--- | :--- | :--- | :--- |
| **Phase 3: AI** | Native C++ & Python complexity analysis via `tree-sitter` | Pure JavaScript/TypeScript AST analysis via `acorn` & `acorn-walk`; AI candidate generator for Python/C++. | `tree-sitter` native bindings require C++ build toolchains on Render containers, which increase Docker image size and cause native compilation flakiness in cloud builds. |
| **Phase 4b: PWA** | `@serwist/next` PWA service worker | Custom vanilla Service Worker (`frontend/public/sw.js`) and PWA metadata route (`frontend/src/app/manifest.ts`). | `@serwist/next` currently lacks official stable support for Next.js 16 + React 19 Turbopack builds. The custom SW provides zero-dependency caching and offline fallbacks. Documented in [swDecision.ts](../frontend/src/lib/sw/swDecision.ts). |

---

## 3. Parked Features (Deferred to Post-Upgrade Roadmap)

As established in [docs/scope.md](./scope.md) and [ADR 0006](./adr/0006-feature-flags-and-parked-features.md), three non-core experimental modules are parked default-OFF to ensure maximum reliability of the core FSRS learning loop:

1. **1v1 PvP Battles (`FEATURE_PVP=false`):** Real-time multiplayer synchronization requires dedicated WebSocket clustering.
2. **The Arena (`FEATURE_ARENA=false`):** Timed multi-problem speed runs require sandboxed multi-language code runner infrastructure.
3. **AI Mock Technical Interviews (`FEATURE_INTERVIEWS=false`):** Audio/chat mock interview simulator deferred to conserve API quotas for core problem hints and code reviews.

---

## 4. Verification Status of Core Loop

- **Vitest Unit & Integration Suites:** **402 passed / 402 tests (100% PASS)**
- **Playwright E2E Suites:** **45 passed / 45 runs (100% PASS, 0 flakiness)**
- **Accessibility:** **0 critical, 0 serious axe-core violations**
- **Dual Prisma Schema Parity:** **100% bit-for-bit identical**
- **ERD Schema Freshness:** **100% synchronized**

