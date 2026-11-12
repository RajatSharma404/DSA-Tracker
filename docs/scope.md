# Feature Scope & Gating Architecture

This document defines the strict tiering, gating mechanisms, and maintenance status of all modules in **DSA Tracker Pro**.

> [!IMPORTANT]
> **Phase 5 Directive & Stability Rule**:
> **Parked features get no changes until the core loop has comprehensive end-to-end (E2E) tests in Phase 6.** Parked features are hidden and disabled via runtime environment flags; their code and database tables remain preserved and intact.

---

## 1. Feature Classification Matrix

| Feature | Tier | Feature Flag | Default | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | `CORE` | *Always ON* | `true` | Central hub for spaced repetition queue, KPIs, and daily actions. |
| **Review Queue** | `CORE` | *Always ON* | `true` | FSRS memory retention engine; primary daily learning loop. |
| **Flashcards** | `CORE` | *Always ON* | `true` | Spaced repetition flashcard active recall with full WCAG 2.1 AA keyboard support. |
| **Topics Curriculum** | `CORE` | *Always ON* | `true` | Structured curriculum navigation, completion tracking, and mastery scores. |
| **Visual Roadmap** | `CORE` | *Always ON* | `true` | Interactive topological visual roadmap connecting problem dependencies. |
| **Problem Workspace** | `CORE` | *Always ON* | `true` | Monaco editor, LeetCode problem descriptions, hints, and local/remote execution. |
| **Chrome Extension** | `CORE` | *Always ON* | `true` | Manifest V3 auto-pairing, cryptographically scoped tokens, and two-way sync. |
| **Analytics & KPIs** | `CORE` | *Always ON* | `true` | Retention decay curves, pace forecasting, and time-investment analytics. |
| **Notes & Solutions** | `CORE` | *Always ON* | `true` | Problem notes, gotchas, time/space complexity tracking, and solution histories. |
| **Settings & Profile** | `CORE` | *Always ON* | `true` | Timezones, pairing device management, and theme preferences. |
| **Admin Control Center**| `CORE` | *Always ON* | `true` | Curriculum seeding, user management, and read-only runtime feature flag inspection. |
| **Search & Discovery** | `CORE` | *Always ON* | `true` | Sub-5ms client search across 2,000+ problems, difficulty filters, and tags. |
| **Weekly Report** | `CORE` | *Always ON* | `true` | Automated weekly performance summary and consistency breakdown. |
| **Achievements** | `CORE` | *Always ON* | `true` | Gamified milestones, badges, and difficulty streaks (feature-filtered). |
| **AI Recommendations**| `CORE` | *Always ON* | `true` | Spaced review reminders, weakness targeting, and momentum warm-ups. |
| **Study Plan** | `CORE` | *Always ON* | `true` | AI-assisted and deterministic goal-based study plan generator. |
| **Learn Tracks** | `FROZEN` | *No flag (docs)*| `true` | LearnCpp and bootcamp modules; stable and feature-complete, no new work. |
| **Vault** | `FROZEN` | *No flag (docs)*| `true` | Theoretical flashcards and revision references; maintenance mode only. |
| **Company Tracks** | `FROZEN` | *No flag (docs)*| `true` | Company-tagged problem clusters; frozen until core E2E complete. |
| **AlgoTracer 2.0** | `SHOWPIECE`| `FEATURE_ALGOTRACER`| `true` | Interactive visual step-through debugger; showcase feature with keyboard navigation. |
| **1v1 PvP Battles** | `PARKED` | `FEATURE_PVP` | `false` | Real-time competitive duel simulator; parked to prioritize core learning loop. |
| **The Arena** | `PARKED` | `FEATURE_ARENA` | `false` | Timed speed challenge mode; parked pending multi-problem test runner hardening. |
| **AI Mock Interviews** | `PARKED` | `FEATURE_INTERVIEWS`| `false` | Audio/chat mock interview simulator; parked to conserve AI quota for hints & reviews. |

---

## 2. Flag System Specification

1. **Backend Single Source of Truth**:
   - Implemented in `backend/features.ts`.
   - Reads environment variables: `FEATURE_PVP`, `FEATURE_ARENA`, `FEATURE_INTERVIEWS`, `FEATURE_ALGOTRACER`.
   - Validated strictly via Zod. Invalid string inputs trigger early startup failure.
   - Exposed via `GET /api/features` (authenticated, cacheable for 60 seconds).
   - Enforced by `requireFeature(name)` middleware mounted on backend routers (returning HTTP 404 with standard error code `FEATURE_DISABLED`).

2. **Frontend Dynamic Resolution**:
   - Resolved dynamically in the Dashboard Server Component layout (`frontend/src/app/(dashboard)/layout.tsx`) without static build-time baking (`NEXT_PUBLIC_*`).
   - Propagated to all client components via `<FeaturesProvider initialFlags={flags}>` and the `useFeature(name)` hook.
   - Parked page routes invoke Next.js `notFound()` on load when their respective flag is false.
   - Navigation links, command palette entries, global hotkeys, and achievement badges are automatically filtered out when their feature is disabled.

