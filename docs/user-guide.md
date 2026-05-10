# User Guide

This guide is for daily platform usage by learners and admins.

## Account and Login

Supported login paths:

- Google OAuth (enabled when Google credentials are configured)
- credentials login (legacy mode, disabled by default unless explicitly allowed)

After sign-in, the frontend keeps a session token and includes a signed access token in API requests.

## Daily Learning Workflow

Recommended loop:

1. Open dashboard to review due items and weak-topic signals.
2. Solve at least one roadmap problem.
3. Complete review queue items due today.
4. Capture insights in notes or vault.
5. Check weekly report and adjust next-day plan.

## Working with Topics and Problems

Typical actions:

- browse topics and progress
- open problem list by topic
- change status: `TODO` -> `DOING` -> `DONE`
- log time spent
- review history and solve metadata

Progress updates influence:

- streak
- analytics metrics
- review queue scheduling
- recommendations

## Learning Tracks and Lessons

Inside Learn:

- choose a track
- navigate modules and lessons in order
- consume lesson blocks
- update lesson progress

Progress states:

- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`

## Review Queue

The review queue provides due problems based on spaced-repetition fields. For each review item:

1. attempt recall and solution
2. submit review quality
3. system recalculates interval and next review date

## AI Assistant Features

Available assistance APIs support:

- hints for current problem
- topic pattern explanation
- review of your submitted code
- trace walk-through for algorithm flow
- code evaluation and score context

Best use pattern:

- ask for hints before full analysis
- use trace/review after your own attempt
- store learnings in notes

## Notes, Vault, Tags, and Bookmarks

Personal knowledge management includes:

- notes attached to problem IDs
- note types: `GOTCHA`, `LEARNING`, `TIP`
- bookmarks for quick revisit
- colored tags for custom organization

## Challenge Arena

Challenge mode allows timed sessions for specific topics. Session lifecycle:

- start challenge with topic and duration
- solve assigned set under time constraint
- complete as `COMPLETED` or `FAILED`

## Mock Interviews

Interview records store:

- interview date
- optional score
- optional feedback

Use this page to track interview readiness over time.

## Search

Use global search and filters to discover practice targets quickly:

- text query
- difficulty
- status
- topic
- bookmarked-only
- tag

## Weekly Report and Analytics

Analytics pages expose:

- activity trends
- productivity and time patterns
- topic mastery signals
- readiness index
- achievement state

Use weekly report for planning next sprint of study.

## Admin Operations

Admin-only surfaces include:

- user role management
- topic CRUD
- problem CRUD
- roadmap seeding
- learn-track seed endpoints

Admin routes are protected by both frontend middleware and backend role checks.

## Extension Sync Usage

If extension is installed:

1. log in to LeetCode in same browser profile
2. keep valid `LEETCODE_SESSION` cookie
3. solve and submit on LeetCode
4. extension sends accepted-problem sync call to backend

For setup details, see [Developer Operations](./developer-operations.md) and [Troubleshooting](./troubleshooting.md).
