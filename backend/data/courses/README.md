# Learn courses

Each `.md` file in this folder is one Learn track. The backend installs any
course whose track slug is not in the database yet, the first time Learn is
opened. An installed course is never overwritten (that would wipe learners'
progress); to publish edits to an existing course, give it a new slug or
delete its track first.

## Format

```
---
slug: advanced-dsa
title: Advanced DSA
description: One paragraph shown on the track card.
order: 3
---

# module-slug | Module title | One-line summary
difficulty: ADVANCED          (BEGINNER, INTERMEDIATE or ADVANCED)
minutes: 35
objective: One learning objective per line

::: markdown
Free Markdown.
:::

::: code cpp | Optional title
// code
:::

::: note
A callout, usually pitfalls.
:::

::: quiz
question: The question
- A wrong option
- The right option *
- Another wrong option
explanation: Why the right option is right.
:::

::: problems
leetcode-problem-slug
another-problem-slug
:::
```

Each module becomes one lesson. Practice problems are listed as LeetCode links
and, when the problem exists in the tracker, linked so solves show up in the
lesson. `npm test` parses every course file, so a formatting mistake fails
the tests instead of the live site.
