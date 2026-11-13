# Database Entity-Relationship Diagrams

This directory contains domain-split Entity-Relationship (ER) diagrams generated directly from the canonical Prisma schema ([backend/prisma/schema.prisma](../../backend/prisma/schema.prisma)).

## Domains

| Domain | Models | Link |
| :--- | :--- | :--- |
| **Identity & Authentication Domain** | `User`, `Account`, `Session`, `VerificationToken`, `ExtensionDevice` | [identity.md](./identity.md) |
| **Curriculum & Problem Catalog Domain** | `Topic`, `Problem`, `UserTag`, `ProblemTag`, `TheoryProblemLink` | [curriculum.md](./curriculum.md) |
| **Progress & Spaced Repetition Domain** | `Progress`, `ReviewLog`, `ActivityEvent`, `Streak`, `SolutionHistory`, `ProblemNote`, `Bookmark` | [progress.md](./progress.md) |
| **Theory & Conceptual Learning Domain** | `TheoryTrack`, `TheoryModule`, `TheoryLesson`, `TheoryLessonBlock`, `TheoryProblemLink`, `UserTheoryLessonProgress` | [theory.md](./theory.md) |
| **Assessment & Operational Domain** | `ChallengeSession`, `MockInterview`, `StudyPlan`, `AiUsage`, `SyncReceipt` | [assessment.md](./assessment.md) |

## Schema Freshness
To regenerate these diagrams from the Prisma schema:
```bash
npm run docs:erd
```

To verify that documentation remains synchronized with the database schema in CI:
```bash
node scripts/check-erd-freshness.mjs
```
