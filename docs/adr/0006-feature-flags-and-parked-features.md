# ADR 0006: Feature Flags and Parked Experimental Modules

- **Status:** Accepted
- **Date:** 2026-11-12
- **Deciders:** Engineering Team

---

## Context
Over successive iterations, DSA Tracker Pro accumulated several speculative or experimental modules, notably:
- PvP Real-Time Multiplayer (`/pvp`)
- Timed Coding Arena Challenge (`/challenge`)
- AI Mock Technical Interviews (`/interviews`)

These features were incomplete, required active WebSocket infrastructure, or diverted user attention from the core spaced-repetition study loop. However, outright deletion would discard significant frontend and backend engineering work. Commenting out code violated clean code directives and introduced technical debt.

## Decision
We adopted a structured **Feature Flagging & Parked State Strategy**:
1. **Feature Tiering ([docs/scope.md](../scope.md)):**
   - **Core (Always ON):** Dashboard, Review Queue, Flashcards, Problems, Extension, Analytics, Settings.
   - **Frozen (Active, No New Dev):** Theory tracks, Company tracks, Problem vault.
   - **Showpiece (Default ON):** AlgoTracer AST code visualizer.
   - **Parked (Default OFF):** PvP, Challenge Arena, Mock Interviews.
2. **Backend Gate Middleware:** Implemented `backend/middlewares/featureGate.ts`, which returns HTTP 404 for any route associated with a disabled feature.
3. **Frontend Runtime Context:** Created `FeaturesProvider` (`frontend/src/components/providers/FeaturesProvider.tsx`), resolving flags at build and runtime to hide navigation items, command palette entries, and page routes.
4. **Zero Code Deletion:** Parked code remains fully intact, typechecked, and testable without polluting the production UI.

## Alternatives Considered
- **Git Branch Deletion:** Purging code and relying on git history alone makes feature resurrection difficult and risks merge bitrot.
- **Third-Party Feature Flag SaaS (LaunchDarkly, Split):** Overkill for a self-hostable open-source project; adds external network dependency.

## Consequences
- **Positive:** Pristine, distraction-free user experience by default; zero dead or commented-out code; instant reactivation via environment variables (`FEATURE_PVP=true`, etc.).
- **Negative / Trade-offs:** Parked routes and schemas must still compile and pass general typechecking and schema migrations.

## Implementation Files
- [backend/features.ts](../../backend/features.ts)
- [backend/middlewares/featureGate.ts](../../backend/middlewares/featureGate.ts)
- [backend/routes/features.routes.ts](../../backend/routes/features.routes.ts)
- [frontend/src/components/providers/FeaturesProvider.tsx](../../frontend/src/components/providers/FeaturesProvider.tsx)
- [frontend/src/types/features.ts](../../frontend/src/types/features.ts)
- [docs/scope.md](../scope.md)
