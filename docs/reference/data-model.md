# Data Model Reference

This reference is based on backend Prisma schema in `backend/prisma/schema.prisma`.

## Core Identity and Auth Models

- `User`: identity, role, optional LeetCode linkage, root relationship holder.
- `Account`, `Session`, `VerificationToken`: NextAuth persistence models.
- `Role` enum: `USER`, `ADMIN`.

## Roadmap and Practice Models

- `Topic`: problem grouping and ordering.
- `Problem`: challenge item with topic relation, difficulty, and order index.
- `Difficulty` enum: `EASY`, `MEDIUM`, `HARD`.

## User Progress and Retention Models

- `Progress`: user-problem state and spaced-repetition fields.
  - status lifecycle via `ProgressStatus` (`TODO`, `DOING`, `DONE`)
  - retention fields: `easinessFactor`, `interval`, `nextReviewDate`
  - optional LeetCode runtime/memory capture fields
- `Streak`: user consistency metrics (current and longest streak)

Unique constraint:

- one progress row per `(userId, problemId)`.

## Challenge and Interview Models

- `ChallengeSession`: timed challenge assignment and completion state.
- `ChallengeStatus` enum: `IN_PROGRESS`, `COMPLETED`, `FAILED`.
- `MockInterview`: date, optional score, optional feedback.

## Knowledge Capture and Curation Models

- `ProblemNote`: user notes tied to problem and note type.
- `NoteType` enum: `GOTCHA`, `LEARNING`, `TIP`.
- `SolutionHistory`: submitted code archive and quality metadata.
- `Bookmark`: user-problem saved state.
- `UserTag`: per-user custom tag with color.
- `ProblemTag`: join table connecting tags and problems.

## Theory Learning Models

- `TheoryTrack`: top-level learning track.
- `TheoryModule`: grouped unit under track, optionally linked to a topic.
- `TheoryLesson`: structured lesson under module.
- `TheoryLessonBlock`: typed content blocks with ordering.
- `TheoryProblemLink`: links lessons/modules to roadmap problems.
- `UserTheoryLessonProgress`: per-user lesson progress state.

Enums:

- `TheoryDifficulty`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`
- `TheoryBlockType`: `MARKDOWN`, `CODE`, `NOTE`, `QUIZ`, `IMAGE`
- `TheoryProgressStatus`: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`

## Relationship Highlights

- one `Topic` has many `Problem`
- one `User` has many `Progress`, `MockInterview`, `ChallengeSession`, `ProblemNote`, `SolutionHistory`, `Bookmark`, `UserTag`
- many-to-many `Problem` <-> `UserTag` via `ProblemTag`
- theory hierarchy is strictly ordered by track/module/lesson/block
- lesson progress keyed by composite primary key `(userId, lessonId)`

## Data Lifecycle Notes

- most user-owned records cascade on user delete
- problem/topic deletion cascades through dependent rows
- lesson/module/track deletion cascades through theory children
- review scheduling is stateful and evolves through progress/review endpoints

## Practical Query Surfaces

Common read paths in application logic:

- dashboard aggregates from progress, streak, topic/problem coverage
- review queue filters by `nextReviewDate`
- analytics consume progress timestamps and problem/topic joins
- search joins problems with progress/bookmarks/tags
- learn pages join track/module/lesson + lesson progress + linked problems

## Frontend Prisma Schema Note

`frontend/prisma/schema.prisma` contains a reduced subset focused on auth and core records used by frontend-side auth operations. Backend schema is the authoritative domain superset.
