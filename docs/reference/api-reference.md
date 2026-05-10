# API Reference

This reference documents backend API routes consumed by the frontend and extension.

Base path assumptions:

- frontend calls relative `/api/*`
- Next.js rewrites non-auth routes to backend base
- backend exposes routes mostly under `/api/*` plus `/` and `/health`

## Authentication

Most business endpoints require bearer auth.

Authorization model:

- token issued by NextAuth JWT callback
- backend validates token against shared secret(s)
- admin endpoints require resolved user role `ADMIN`

## Response conventions

- Success: JSON payload with entity or aggregate data
- Errors: status code + `{ error: string }` or `{ error, details }`

## Domain: Dashboard and Core Roadmap

- `GET /api/dashboard` (auth): dashboard aggregates, streak, weak topics, review reminders, and next-action payload.
- `GET /api/topics` (auth): list topics with solved/total and progress percentage.
- `GET /api/topics/:topicId/problems` (auth): ordered problem list for topic.
- `GET /api/problems/:problemId` (auth): single problem detail.
- `POST /api/progress` (auth): update problem status and time spent.
  - body: `{ problemId, status, timeSpent }`

## Domain: Learn Tracks (Theory)

- `GET /api/learn/tracks` (auth): tracks with nested modules and lesson summary progress.
- `GET /api/learn/tracks/:trackSlug/modules/:moduleSlug/lessons/:lessonSlug` (auth): lesson detail, blocks, siblings, linked problems, user progress.
- `POST /api/learn/lessons/:lessonId/progress` (auth): update lesson progress.

Admin seed helpers:

- `POST /api/admin/learn/seed` (admin)
- `POST /api/admin/learn/seed-comprehensive` (admin)

## Domain: Interviews and Challenges

Interviews:

- `GET /api/interviews` (auth)
- `POST /api/interviews` (auth): create interview row
- `GET /api/interviews/:id` (auth)
- `PATCH /api/interviews/:id` (auth)

Challenges:

- `POST /api/challenges/start` (auth): start challenge
  - body: `{ topicId, duration }`
- `GET /api/challenges/:id` (auth)
- `POST /api/challenges/:id/complete` (auth): mark completed/failed

## Domain: User LeetCode Settings and Sync

- `PATCH /api/user/leetcode` (auth): set LeetCode username.
- `PATCH /api/user/leetcode-session` (auth): set LeetCode session token.
- `POST /api/user/sync-leetcode` (auth): sync solved set from LeetCode.

LeetCode utility endpoints:

- `GET /api/leetcode/submissions/:problemSlug` (auth)
- `GET /api/leetcode/submission/:submissionId/code` (auth)
- `GET /api/leetcode/daily-challenge` (auth)
- `GET /api/leetcode/problem/:titleSlug` (auth)
- `POST /api/leetcode/submit` (auth)
  - body: `{ questionSlug, code, lang }`
- `GET /api/leetcode/submission/:submissionId/check` (auth)

## Domain: AI Assistance

- `POST /api/ai/hint` (auth)
  - body: `{ problemId }`
- `GET /api/ai/pattern/:topicId` (auth)
- `POST /api/ai/review` (auth)
  - body: `{ problemId, code }`
- `POST /api/ai/trace` (auth)
  - body: `{ problemId, code }`
- `POST /api/ai/evaluate` (auth)
  - body: `{ problemId, code, language }`
- `GET /api/ai/recommendations` (auth)

## Domain: Analytics and Reports

- `GET /api/analytics/activity` (auth)
- `GET /api/analytics/mastery` (auth)
- `GET /api/analytics/productivity` (auth)
- `GET /api/analytics/time` (auth)
- `GET /api/analytics/readiness` (auth)
- `GET /api/daily-problem` (auth)
- `GET /api/achievements` (auth)
- `GET /api/weekly-report` (auth)

## Domain: Notes, Vault, and Knowledge Capture

- `GET /api/vault/templates` (auth)
- `GET /api/notes` (auth): all notes for current user.
- `GET /api/notes/:problemId` (auth)
- `POST /api/notes` (auth)
  - body: `{ problemId, content, type }`
- `PUT /api/notes/:noteId` (auth)
  - body: `{ content, type }`
- `DELETE /api/notes/:noteId` (auth)

## Domain: Solutions

- `POST /api/solutions` (auth): persist solution history record.
- `GET /api/solutions` (auth): all solutions for current user.
- `GET /api/solutions/:problemId` (auth): solution history for problem.

Common save payload fields:

- `problemId`, `code`, `language`, `score`
- optional: `isCorrect`, `verdict`, `timeComplexity`, `spaceComplexity`, `isOptimal`, `isAIGenerated`

## Domain: Bookmarks, Tags, Search

Bookmarks:

- `GET /api/bookmarks` (auth)
- `GET /api/bookmarks/check/:problemId` (auth)
- `POST /api/bookmarks/toggle` (auth)

Tags:

- `GET /api/tags` (auth)
- `POST /api/tags` (auth)
- `DELETE /api/tags/:tagId` (auth)
- `POST /api/tags/:tagId/problems` (auth)
- `GET /api/problems/:problemId/tags` (auth)

Search:

- `GET /api/search` (auth)
  - query params: `q`, `difficulty`, `status`, `topicId`, `bookmarked`, `tagId`

## Domain: Review Queue and Export

- `GET /api/review-queue` (auth)
- `POST /api/review-queue/complete` (auth)
  - body: `{ problemId, quality }`
- `GET /api/export/progress?format=json|csv` (auth)

## Domain: Admin

Users:

- `GET /api/admin/users` (admin)
- `PATCH /api/admin/users/:userId/role` (admin)

Topics:

- `POST /api/admin/topics` (admin)
- `PUT /api/admin/topics/:id` (admin)
- `DELETE /api/admin/topics/:id` (admin)

Problems:

- `POST /api/admin/problems` (admin)
- `PUT /api/admin/problems/:id` (admin)
- `DELETE /api/admin/problems/:id` (admin)

Seeding:

- `POST /api/admin/seed` (admin)
- `POST /api/admin/learn/seed` (admin)
- `POST /api/admin/learn/seed-comprehensive` (admin)

## Domain: Extension Integration

- `POST /api/extension/sync` (extension/background caller)
  - body: `{ problemSlug, leetcodeSession }`

This endpoint is designed for browser extension auto-sync after accepted LeetCode submissions.

## Public and health endpoints

- `GET /`: root response
- `GET /health`: health probe endpoint

## API documentation maintenance checklist

When changing `frontend/src/lib/api.ts` or `backend/index.ts`, update this file for:

- new/removed endpoints
- auth requirement changes
- payload field changes
- route path changes
- status code/response contract changes
