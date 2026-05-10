# Product Overview

DSA Tracker is a full-stack learning platform for structured Data Structures and Algorithms mastery. It combines guided theory tracks, problem solving, review scheduling, analytics, and AI-assisted workflows in one system.

## Product Goals

- Convert interview preparation into a measurable system.
- Blend theory-first learning with deliberate practice.
- Improve retention through spaced repetition.
- Reduce context-switching by centralizing notes, tags, bookmarks, review, and coding history.

## Core Experience Areas

## 1) Dashboard

The dashboard aggregates high-signal learning metrics and next actions:

- solved count and progress percentage
- streak status
- weak-topic signals
- due reviews
- activity trend and pace projections
- recommendation for next best action

## 2) Topics and Problems

Topic pages break the roadmap into domains (arrays, strings, trees, graphs, and more), each containing ordered problems with status lifecycle:

- `TODO`
- `DOING`
- `DONE`

Progress updates feed analytics, review scheduling, and readiness scoring.

## 3) Theory Learning Tracks

Theory content is modeled as:

- Track -> Module -> Lesson -> Block

Lesson blocks support markdown, code, notes, quiz, and image content. Learner progress tracks completion status, percent, time spent, and resume location.

## 4) Review Queue (Spaced Repetition)

Review scheduling is persisted per user-problem using spaced-repetition fields:

- easiness factor
- interval
- next review date

Learners submit review quality feedback, which adjusts next schedule.

## 5) AI Assistance

AI features are integrated into practice flow:

- hint generation
- pattern explanation
- code review
- algorithm tracing
- code evaluation
- recommendations

Design intent: guide reasoning without replacing problem-solving effort.

## 6) Challenge Arena and Interviews

Time-boxed challenge sessions and mock interviews provide exam-like pressure loops:

- challenge start and completion tracking
- interview records with score and feedback

## 7) Knowledge Capture: Vault + Notes + Solutions

Learning artifacts are first-class entities:

- vault templates
- notes per problem (gotcha, learning, tip)
- full solution history with language, verdict, complexity notes, and generation source
- bookmarks and custom tags

## 8) Search and Curation

Global search supports filtering by:

- text query
- difficulty
- status
- topic
- bookmark state
- tag

## 9) Browser Extension Integration

A Chrome/Edge extension can detect accepted LeetCode submissions and trigger sync through backend endpoints, keeping tracker progress and external solving activity aligned.

## Roles and Access

- User: full personal learning workflow.
- Admin: roadmap/track/user-management capabilities plus seed endpoints.

Middleware and backend auth enforce route and role boundaries.

## System Composition

- Frontend: Next.js App Router with NextAuth and API proxying.
- Backend: Express + Prisma business API.
- Database: PostgreSQL.
- Optional extension: browser-side sync bridge.

## Read next

- [User Guide](./user-guide.md)
- [Architecture](./architecture.md)
- [API Reference](./reference/api-reference.md)
