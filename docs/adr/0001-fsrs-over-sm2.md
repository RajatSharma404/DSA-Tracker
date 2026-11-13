# ADR 0001: FSRS Spaced Repetition Over SM-2

- **Status:** Accepted
- **Date:** 2026-11-11
- **Deciders:** Engineering Team

---

## Context
The legacy implementation of the spaced repetition engine utilized a partial variant of the SuperMemo 2 (SM-2) algorithm. The database schema lacked a `repetitions` counter on the `Progress` model, causing the scheduler to evaluate every review as an initial iteration or compute distorted intervals. Furthermore, SM-2 assumes uniform forgetting curves and conflates memory stability with item difficulty into a single scalar "easiness factor", resulting in review pileups and premature card starvation.

## Decision
We replaced the SM-2 scheduler with the **Free Spaced Repetition Scheduler (FSRS v6)** using the `ts-fsrs` engine:
1. **Schema Enhancements:** Added `repetitions`, `lapses`, `stability`, `difficultyFsrs`, `lastReviewedAt`, and review `state` (NEW, LEARNING, REVIEW, RELEARNING) to the `Progress` model.
2. **Review Audit Trail:** Created a dedicated `ReviewLog` model recording every review event, capturing before-and-after snapshots of stability, difficulty, state, elapsed days, and scheduled days.
3. **Four-Grade Evaluation:** Standardized reviews on four explicit grades: `Again` (1), `Hard` (2), `Good` (3), and `Easy` (4).
4. **Data Backfill:** Authored an idempotent migration backfill script (`scripts/backfill-phase1.ts`) to populate repetitions and historical FSRS parameters from existing progress records.

## Alternatives Considered
- **Patch SM-2 with repetitions:** Retaining SM-2 while adding the missing counter would solve interval distortion but preserve SM-2's fundamental inability to adaptively model forgetting curves.
- **Anki Modified SM-2:** Incorporates lapse handling but remains inferior to modern FSRS machine-learning baselines.

## Consequences
- **Positive:** Mathematically optimal review spacing, significant reduction in review backlog fatigue, accurate recall probability estimation.
- **Negative / Trade-offs:** Requires tracking multidimensional float state (`stability`, `difficultyFsrs`) and maintaining audit rows.

## Implementation Files
- [backend/services/scheduler.ts](../../backend/services/scheduler.ts)
- [backend/routes/reviewQueue.routes.ts](../../backend/routes/reviewQueue.routes.ts)
- [backend/prisma/schema.prisma](../../backend/prisma/schema.prisma)
- [backend/scripts/backfill-activity-and-fsrs.ts](../../backend/scripts/backfill-activity-and-fsrs.ts)
