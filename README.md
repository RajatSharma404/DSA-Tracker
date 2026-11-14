# DSA Tracker

**Solve it once. Still know it on interview day.**

A LeetCode problem you solved three weeks ago is mostly gone. DSA Tracker sits on top of LeetCode: it records every accepted solve, tracks how well you still remember each problem, and brings it back for a short review just before it slips.

Free, open source, self-hostable. LeetCode stays the judge.

![Landing page: one problem's recall over 60 days, with and without reviews](./docs/media/landing.png)

## Why not just LeetCode?

| | LeetCode on its own | With DSA Tracker |
| :-- | :-- | :-- |
| **Remembering** | A green check that stays forever, whether or not you could solve it again. | Models how much of each problem you still remember ([FSRS](https://github.com/open-spaced-repetition/ts-fsrs)) and schedules a review right before it slips. |
| **Roadmaps** | Its own study plans, tracked one at a time. | 22 established lists built in. One solve counts toward every list it's on. |
| **What to do today** | A problem of the day. | One ordered list: reviews that are due, the next problem on your roadmap, then a pick for your weakest pattern. |
| **Understanding** | Accepted or Wrong Answer. | Step through your own code line by line, and see the mistakes you keep repeating. |
| **Effort** | | Nothing changes in how you practise. Accepted submissions sync on their own. |

## What's inside

![Dashboard: today's list, progress and topics](./docs/media/dashboard.png)

- **Automatic sync.** Accepted submissions on leetcode.com are picked up as they happen, along with runtime, memory and your code. Your full solve history can be imported in one click.
- **Spaced review.** Every solved problem has a memory model behind it. The review queue and flashcards show what's due; a forecast shows what you're about to forget, per topic, a month ahead.
- **22 built-in roadmaps**, taken from their original sources: Blind 75, NeetCode 150 and All, Grind 75 and 169, LeetCode Patterns, LeetCode 75, Top Interview 150, Top 100 Liked, company lists (Google, Amazon, Meta, Microsoft, Bloomberg, Apple) and LeetCode's topic study plans. You can also build your own.
- **Built-in editor** that submits to LeetCode's real judge and shows the verdict, failing case and percentiles.
- **Code tracer.** Paste any JavaScript and step through it: the current line, every variable, the array and the call stack. Python and C++ get an animated walkthrough of the detected algorithm.
- **Insights.** Mistake patterns, weekly report, activity history, your LeetCode contest rating, and a shareable "DSA DNA" skill fingerprint.
- **Nine themes**, all from established palettes (Catppuccin, Rosé Pine, Nord, Tokyo Night, Gruvbox and others), light and dark.

![Code tracer stepping through bubble sort](./docs/media/tracer.png)

## Connecting LeetCode

Open **LeetCode Sync** in the app and pick whichever suits you. All three keep your LeetCode cookie in your own browser; it is never sent to the tracker.

| Option | Sync | Submit from the editor | Setup |
| :-- | :-: | :-: | :-- |
| **Browser extension** (Chrome, Arc, Edge, Brave) | ✓ | ✓ | Download the zip from the app, unzip, then *Load unpacked* on your browser's extensions page with developer mode on. Working from a clone? `npm run extension` does this for you. |
| **Userscript** (Tampermonkey / Violentmonkey, any browser) | ✓ | | One click to install from the app. |
| **Bookmarklet** | one-off import | | Drag it to your bookmarks bar, click it on leetcode.com. |

The extension pairs itself the first time you open the app with it installed. Submissions made while the tracker is offline are queued and retried.

## Run it locally

You need **Node.js 22+** and **PostgreSQL 15+**. If you don't have Postgres, `docker compose up -d db` starts one with the values used below.

**1. Install**

```bash
git clone https://github.com/RajatSharma404/DSA-Tracker.git
cd DSA-Tracker
npm install && npm install --prefix backend && npm install --prefix frontend
```

**2. Configure.** Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker"
PORT=3001
NEXTAUTH_URL="http://localhost:3005"
CORS_ORIGINS="http://localhost:3005"
NEXTAUTH_SECRET="<random string>"
BACKEND_JWT_SECRET="<random string, at least 32 characters>"
ALLOW_INSECURE_CREDENTIALS_LOGIN="true"
```

and `frontend/.env.local`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker"
NEXTAUTH_URL="http://localhost:3005"
NEXTAUTH_SECRET="<same as backend>"
BACKEND_JWT_SECRET="<same as backend>"
BACKEND_URL="http://localhost:3001"
INTERNAL_BACKEND_URL="http://localhost:3001/api"
ALLOW_INSECURE_CREDENTIALS_LOGIN="true"
NEXT_PUBLIC_ALLOW_INSECURE_CREDENTIALS_LOGIN="true"
```

`openssl rand -base64 32` makes a good secret. `ALLOW_INSECURE_CREDENTIALS_LOGIN` lets you sign in with just an email, which is handy locally; leave it off anywhere public and set up Google sign-in instead. Every variable, including AI features (`GEMINI_API_KEY`) and feature flags, is listed in [docs/reference/environment-variables.md](./docs/reference/environment-variables.md).

**3. Create the database and seed the curriculum**

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
cd ..
```

**4. Start**

```bash
npm run dev
```

The app is at **http://localhost:3005** and the API at http://localhost:3001. Signed-out visitors see the landing page; sign in to reach the dashboard.

Something not working? See [docs/troubleshooting.md](./docs/troubleshooting.md).

## Development

```text
frontend/    Next.js 16 app (App Router, React 19, Tailwind 4)
backend/     Express 5 API, Prisma, PostgreSQL
extension/   Manifest V3 browser extension (also builds the userscript and zip)
scripts/     Roadmap fetcher, extension builder, schema and docs checks
e2e/         Playwright tests
docs/        Architecture, API and data-model reference, runbooks
```

```bash
npm run typecheck          # both projects
npm test                   # Vitest, backend and frontend
npm run lint
npm run e2e                # Playwright (needs npm run e2e:db first)
npm run check:prisma-sync  # backend and frontend schemas must match
```

The backend and frontend each keep a copy of the Prisma schema. Change `backend/prisma/schema.prisma`, then run `npm run sync:prisma`.

Roadmaps live in `backend/data/roadmaps.json` and are regenerated from their sources with `node scripts/fetch-roadmaps.mjs`.

## Documentation

- [Getting started](./docs/getting-started.md) and [user guide](./docs/user-guide.md)
- [Architecture](./docs/architecture.md) and [decision records](./docs/adr/README.md)
- [API reference](./docs/reference/api-reference.md) and [data model](./docs/reference/data-model.md)
- [Hosting](./docs/hosting.md) and [runbook](./docs/runbook.md)
- [Contributing](./CONTRIBUTING.md) and [security policy](./SECURITY.md)

## License

[MIT](./LICENSE)
