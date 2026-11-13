# Architecture Decision Records (ADRs)

This directory documents the core architectural decisions made during the modernization and hardening of **DSA Tracker Pro**.

Each record captures the context, problem statement, decisions made, alternatives considered, consequences, and implementing source files.

---

## Index of Architectural Decisions

| ADR | Title | Status | Date | Primary Scope |
| :--- | :--- | :--- | :--- | :--- |
| [0001](./0001-fsrs-over-sm2.md) | **FSRS Spaced Repetition Over SM-2** | Accepted | 2026-11-11 | Core Engine / Scheduling |
| [0002](./0002-backend-jwt-and-proxy.md) | **Backend JWT and Same-Origin Proxy Decoupling** | Accepted | 2026-11-11 | Security / Authentication |
| [0003](./0003-extension-pairing-tokens.md) | **Chrome Extension Pairing Tokens** | Accepted | 2026-11-11 | Extension / Least Privilege |
| [0004](./0004-prisma-migrate-deploy-over-db-push.md) | **Enforcing Versioned Migrations Over DB Push** | Accepted | 2026-11-10 | Database / CI Operations |
| [0005](./0005-activity-events-streaks-and-heatmaps.md) | **Append-Only Activity Events for Streaks & Heatmaps** | Accepted | 2026-11-11 | Analytics / Performance |
| [0006](./0006-feature-flags-and-parked-features.md) | **Feature Flags and Parked Experimental Modules** | Accepted | 2026-11-12 | Scope / Architecture |
| [0007](./0007-ai-arranger-server-chooser.md) | **AI Candidate Generator with Heuristic Chooser** | Accepted | 2026-11-12 | AI / Security & Defense |
| [0008](./0008-offline-review-outbox.md) | **Local-First Offline Review Queue and Outbox** | Accepted | 2026-11-12 | PWA / Offline Reliability |

---

## Format & Template

All ADRs adhere to the following standard structure:
- **Context:** The problem, requirements, and limitations prompting the architectural change.
- **Decision:** The chosen design, technology, or algorithm and why it addresses the context.
- **Alternatives Considered:** Alternative approaches evaluated and specific reasons for rejection.
- **Consequences:** The positive outcomes, operational trade-offs, and downstream impacts.
- **Implementation Files:** Direct clickable links to the files implementing the decision.

