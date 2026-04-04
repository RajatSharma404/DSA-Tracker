# DSA Roadmap Tracker

A full-stack web application to track your Data Structures & Algorithms journey with AI-powered code evaluation, theory-first learning, visual roadmaps, spaced repetition, and more — built with Next.js 15, Express.js, and PostgreSQL.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![Express](https://img.shields.io/badge/Express-5-lightgrey?logo=express) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)

---

## Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Prerequisites](#-prerequisites)
4. [Step-by-Step Setup](#-step-by-step-setup)
5. [Running the App](#-running-the-app)
6. [How to Use](#-how-to-use)
7. [Project Structure](#-project-structure)
8. [Environment Variables Reference](#-environment-variables-reference)
9. [Browser Extension](#-browser-extension)
10. [Deployment](#-deployment)
11. [Troubleshooting](#-troubleshooting)
12. [Contributing](#-contributing)
13. [License](#-license)

---

## ✨ Features

| Feature                   | Description                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **500-Problem Roadmap**   | 500 hand-picked LeetCode problems across 25 topics — from C++ Basics to Advanced DP and Graphs                           |
| **Visual Roadmap**        | Interactive ReactFlow graph with dark-themed navigation controls, minimap, and live progress colours                     |
| **3D UI Effects**         | Mouse-tracking 3D tilt on stat cards, 3D pop on roadmap nodes, perspective hover on panels, and 3D badge flip animations |
| **AI Code Evaluation**    | Submit code and get instant correctness verdict, complexity analysis, optimal approaches, edge case checks, and a score  |
| **Solution Persistence**  | Your submitted code is saved — come back later and it's still there                                                      |
| **AI Mentor Hints**       | Get contextual hints without spoilers                                                                                    |
| **AI Code Review**        | Paste any code and receive a detailed review                                                                             |
| **Algorithm Visualizer**  | Step-by-step dry run of your code with variable tracking                                                                 |
| **Topic Study Guides**    | In-depth guides for each DSA topic                                                                                       |
| **Spaced Repetition**     | Review queue that resurfaces problems at optimal intervals                                                               |
| **Explore & Search**      | Filter problems by difficulty, status, topic, bookmarks, and custom tags                                                 |
| **AI Recommendations**    | Personalized problem suggestions based on your weaknesses                                                                |
| **Analytics Dashboard**   | Full-year activity heatmap (Jan – Dec), skill radar, streak tracking, productivity insights                              |
| **Achievements & Badges** | Unlock badges as you hit milestones                                                                                      |
| **Weekly Reports**        | Auto-generated summary of your weekly progress                                                                           |
| **The Vault**             | DSA pattern templates and personal notes per problem                                                                     |
| **Learn (Theory First)**  | C++ mastery track with topic-wise theory modules, structured lesson blocks, and per-module linked practice               |
| **The Arena**             | Full-screen timed arena: multi-language editor with Vim mode, collapsible problem panel, per-problem tabs                |
| **Mock Interviews**       | Track your mock interview scores and feedback                                                                            |
| **Email Login**           | Secure credentials-based authentication via NextAuth                                                                     |
| **Admin Panel**           | Manage users, topics, and problems                                                                                       |

## 🧪 Stability & Sync Fixes (Apr 2026)

The following reliability upgrades were implemented:

- **Correct per-user achievements/stats:** fixed auth user-id wiring so badges and solved counts are no longer mixed across users.
- **Faster dashboard load:** dashboard now renders first and runs LeetCode auto-sync in the background instead of blocking page load.
- **LeetCode submit flow fixed:** in-app editor now submits to LeetCode, polls verdict, and then syncs accepted solves back to tracker.
- **Extension sync reliability improved:** extension now supports configurable backend base URL and broader accepted-result detection.
- **Real-time recommendation signals:** recommendations now include strong topics, weak topic breakdown, and 7d/30d trend metrics.
- **Login notification email support:** optional SMTP-backed login alert emails can be sent to admin email whenever users authenticate.

## 🆕 Latest UI & Roadmap Improvements

### 3D Effects & Visual Polish

- **3D Tilt & Pop:** Stat cards, roadmap nodes, and dashboard panels now feature subtle 3D tilt and pop effects that respond to mouse movement, adding depth and interactivity without overwhelming the UI.
- **Animated Overlays:** Key UI elements (cards, nodes, badges) have animated overlays and glows for a modern, dynamic look.
- **Perspective Hover:** Panels and study guides use perspective transforms and smooth transitions for a tactile feel.
- **Badge Flip Animations:** Achievement badges flip in 3D when unlocked or hovered.

### Roadmap Usability Upgrades

- **Improved Layout:** The roadmap graph uses a more compact, readable layout with better spacing and edge routing.
- **Camera Controls:** Enhanced zoom, pan, and re-center controls with dark-themed icons for clarity.
- **Expand/Collapse:** Collapse or expand topic groups and problem clusters for a cleaner view.
- **Filters:** Filter roadmap by topic, status, or difficulty to focus on what matters most.
- **Minimap Polish:** The minimap is styled for dark mode and always visible for easy navigation.
- **Error-Free Rendering:** All roadmap and dashboard components are validated for error-free rendering after each update.

### General Visual Enhancements

- **Consistent Dark Theme:** All navigation, overlays, and controls are styled for a cohesive dark mode experience.
- **Animated Transitions:** Smooth transitions and subtle animations throughout the dashboard and roadmap.
- **Accessibility:** Improved contrast, focus states, and keyboard navigation for better accessibility.
- **Smoother Scrolling:** The main dashboard scroll container now uses momentum scrolling and smoother reveal animations.
- **Anime.js Scroll Reveal:** Sections and cards fade, lift, and sharpen in with an anime.js-powered scroll reveal effect.
- **Faster Dashboard Load:** Core stats render first, while activity and topic snapshots continue loading in the background.

These improvements make the DSA Tracker more engaging, visually appealing, and user-friendly. For details on customizing or extending these effects, see the relevant components in `frontend/src/components/roadmap/`, `dashboard/`, and `ui/`.

## 🤖 AI Recommendations (Personalized)

The AI Recommendations engine now provides personalized suggestions based on your experience, including:

- **Weak Topics:** Topics where your completion rate is low
- **Suggested Problems:** Problems are recommended based on your solved count, average score, and optimal solution rate
- **Weekly Plan:** A day-by-day plan tailored to your current strengths and weaknesses
- **Tips:** Actionable advice based on your progress and performance

**How it works:**

- The backend analyzes your recent solved problems, scores, and optimal solutions
- Recommendations adapt as you solve more problems and improve your skills
- Difficulty and focus areas are chosen to match your experience level

> For best results, keep solving and submitting problems — the more you use the tracker, the smarter the recommendations become!

---

## 🛠 Tech Stack

**Frontend:** Next.js 15 · React 19 · Tailwind CSS 4 · ReactFlow · Recharts · Monaco Editor · monaco-vim · Lucide Icons

**Backend:** Express.js 5 · Prisma ORM · PostgreSQL · Local AI heuristics engine · JWT

**Auth:** NextAuth (Credentials Provider)

**Infra:** Docker (PostgreSQL) · PM2 / systemd for production

---

## 📋 Prerequisites

Before you begin, make sure you have these installed:

| Tool        | Version                | How to check |
| ----------- | ---------------------- | ------------ |
| **Node.js** | v20+ (v25 recommended) | `node -v`    |
| **npm**     | v10+                   | `npm -v`     |
| **Docker**  | Any recent version     | `docker -v`  |
| **Git**     | Any recent version     | `git -v`     |

You'll also need:

- A configured local backend and database for AI-assisted heuristics and analytics

---

## 🚀 Step-by-Step Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/RajatSharma404/DSA-Tracker.git
cd DSA-Tracker
```

### Step 2 — Start the Database

The project uses PostgreSQL via Docker. Start it with one command:

```bash
docker compose up -d
```

This starts a PostgreSQL 15 container on port `5432` with database `dsatracker`.

> **Verify it's running:** `docker ps` — you should see the `postgres:15` container.

### Step 3 — Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
NEXTAUTH_SECRET="any-long-random-string-here"
ADMIN_EMAIL="your-admin@gmail.com"
LOGIN_NOTIFY_EMAIL="your-admin@gmail.com"

# Optional: enable login notification emails
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-app-password"
NOTIFY_FROM="DSA Tracker <your-smtp-user>"
```

> **Note:** The Docker default password is `password`. If you changed it in `docker-compose.yml`, update `DATABASE_URL` accordingly.

Now push the database schema and seed initial data (topics + problems):

```bash
npx prisma db push
npx prisma db seed
```

The seed loads **500 DSA problems across 25 topics** — C++ Basics, Arrays, Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Linked List, Trees, Graphs, Dynamic Programming, Queue & Deque, Heap/Priority Queue, Strings, Recursion & Backtracking, Greedy, Bit Manipulation, Math & Number Theory, Sorting & Searching, Tries, Union-Find, Monotonic Stack, Advanced Graphs, Advanced DP, and Matrix/2D Arrays.

### Step 4 — Set Up the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env.local` file inside the `frontend/` folder:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="same-secret-as-backend"
```

Push the frontend Prisma schema (needed for NextAuth):

```bash
npx prisma db push
```

### Step 5 — Install Root Dependencies

```bash
cd ..
npm install
```

This installs `concurrently`, which lets you run both servers with one command.

---

## ▶️ Running the App

From the **root directory** (`DSA-Tracker/`):

```bash
npm run dev
```

This starts both servers simultaneously:

| Service         | URL                                            |
| --------------- | ---------------------------------------------- |
| **Frontend**    | [http://localhost:3000](http://localhost:3000) |
| **Backend API** | [http://localhost:3001](http://localhost:3001) |

Important:

- Use only one startup path at a time. If root `npm run dev` is running, do not run `frontend/npm run dev` again in another terminal.
- Running a second frontend dev server causes Next.js lock conflicts at `frontend/.next/dev/lock`.

> You can also start them individually:
>
> ```bash
> # Terminal 1 — Backend
> cd backend && npm run dev
>
> # Terminal 2 — Frontend
> cd frontend && npm run dev
> ```

---

## 📖 How to Use

### 1. Sign In

Open [http://localhost:3000](http://localhost:3000) and sign in with your email. Your account is created automatically on first login.

### 2. Dashboard

After login, you land on the **Dashboard** showing:

- Total progress (solved / total problems)
- Current & longest streak
- Weak topics that need attention
- Problems due for revision

### 3. Learn (Theory First)

Open **Learn** from the sidebar to follow a theory-first workflow before solving problems.

- Topic-wise C++ modules (beginner to advanced)
- Structured lesson blocks (concepts, templates, notes)
- Linked practice problems that unlock after lesson completion
- Progress tracking per lesson and module

### 4. Topics & Problems

- Click **Topics** in the sidebar to see all DSA topics (Arrays, Linked List, Trees, etc.)
- Click any topic to see its problems
- Click a problem to open the **code editor**

### 5. Writing & Submitting Code

- The **code editor** supports **JavaScript, Python, Java, and C++** — select your language from the toolbar
- Toggle **Vim mode** with the `VIM` button in the toolbar; a status bar appears at the bottom of the editor showing the current Vim command state
- Write your solution and click the purple **Submit** button
- The AI evaluates your code and shows:
  - **Verdict** — Accepted, Wrong Answer, TLE, etc.
  - **Score** — 0–100 based on correctness, optimality, and code quality
  - **Your complexity** — Time and Space with explanations
  - **Optimal complexity** — What the best solution achieves
  - **Better approaches** — Alternative algorithms with pseudocode (if your solution isn't optimal)
  - **Edge cases** — Which ones your code handles and which it misses
  - **Feedback** — A mentor-style comment
- **Your code is saved automatically** — next time you open the same problem, your last submission loads in the editor

### 6. Visual Roadmap

Click **Visual Roadmap** to see an interactive graph of all topics and problems, showing dependencies and your progress visually.

- Use the **navigation controls** (bottom-left) to zoom in/out and re-center — icons are now clearly styled against the dark background
- The **minimap** (bottom-right) gives a bird's-eye view of the full graph

### 7. The Vault

Access **The Vault** for:

- DSA pattern templates (Sliding Window, Binary Search, BFS/DFS, etc.)
- Personal notes per problem (Markdown supported)

### 8. Analytics

The **Analytics** page shows:

- **Activity heatmap** — displays a full calendar year (January to December) for whichever year you select; use the year buttons to switch between years
- Skill radar across all topics
- Productivity insights and score trends

### 9. Explore & Search

Use **Explore** to filter problems across all topics by:

- Difficulty (Easy / Medium / Hard)
- Status (Todo / Doing / Done)
- Topic
- Bookmarks and custom tags

### 10. Review Queue

**Review Queue** uses spaced repetition to resurface problems you've solved. Problems appear when they're due for review to strengthen long-term retention.

### 11. AI Recommendations

**AI Recommend** analyzes your solved problems and weak areas to suggest what to practice next.

### 12. The Arena

**The Arena** offers timed challenge sessions — pick a topic and time limit, then solve under pressure.

- The editor takes **full screen real estate** for distraction-free coding
- Use the **problem tabs** (P1, P2…) in the top bar to switch between assigned problems
- Click the **panel icon** (top-right) to toggle the collapsible problem details panel, which shows the problem title, difficulty, topic, and a LeetCode link
- Drag the **vertical splitter** to resize editor area vs problem panel like LeetCode
- Drag the **horizontal splitter** in the editor to resize code area vs console output
- The timer turns orange at 3 minutes and red at 1 minute remaining

### 13. Settings

In **Settings**, you can configure your LeetCode session cookie (for direct LeetCode integration if desired) and other preferences.

---

## 📁 Project Structure

```
DSA-Tracker/
├── docker-compose.yml          # PostgreSQL container
├── package.json                # Root scripts (runs both servers)
├── ecosystem.config.js         # PM2 config for production
├── dsa-tracker.service         # systemd service file (Linux)
│
├── backend/
│   ├── index.ts                # Express server — all API routes
│   ├── aiService.ts            # Local AI heuristics — hints, reviews, evaluation, recommendations
│   ├── leetcodeService.ts      # LeetCode API integration
│   ├── services.ts             # Business logic (streaks, analytics, achievements)
│   ├── templates.ts            # DSA pattern templates for The Vault
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (topics, progress, auth, theory learning)
│   │   ├── seed.ts             # Seeds topics and problems
│   │   └── migrations/         # Database migrations
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/        # Login page
│   │   │   ├── (dashboard)/         # All authenticated pages
│   │   │   │   ├── page.tsx              # Dashboard
│   │   │   │   ├── learn/                # Theory-first learning (tracks/modules/lessons)
│   │   │   │   ├── topics/               # Topic list + problem pages
│   │   │   │   ├── problems/             # Individual problem + code editor
│   │   │   │   ├── roadmap/              # Visual roadmap
│   │   │   │   ├── vault/                # Pattern templates + notes
│   │   │   │   ├── analytics/            # Charts + heatmap
│   │   │   │   ├── achievements/         # Badges
│   │   │   │   ├── weekly-report/        # Weekly summary
│   │   │   │   ├── search/              # Explore + filter problems
│   │   │   │   ├── review/              # Spaced repetition queue
│   │   │   │   ├── recommendations/     # AI suggestions
│   │   │   │   ├── challenge/           # Timed arena
│   │   │   │   ├── interviews/          # Mock interview tracker
│   │   │   │   └── settings/            # User settings
│   │   │   ├── admin/                   # Admin panel
│   │   │   └── api/auth/               # NextAuth API routes
│   │   ├── components/
│   │   │   ├── dashboard/         # Editor, heatmap, radar, hints, etc.
│   │   │   ├── layout/            # Sidebar
│   │   │   ├── roadmap/           # ReactFlow graph components
│   │   │   ├── providers/         # NextAuth session provider
│   │   │   └── ui/                # Reusable UI components
│   │   ├── lib/api.ts             # All frontend API calls
│   │   └── data/studyGuides/      # Static study guide content
│   └── package.json
│
└── extension/                     # Browser extension (LeetCode sync)
    ├── manifest.json
    ├── background.js
    └── content.js
```

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env`)

| Variable             | Required | Description                                                        |
| -------------------- | -------- | ------------------------------------------------------------------ |
| `PORT`               | Yes      | Backend server port (default: `3001`)                              |
| `DATABASE_URL`       | Yes      | PostgreSQL connection string                                       |
| `NEXTAUTH_SECRET`    | Yes      | JWT signing secret (must match frontend)                           |
| `ADMIN_EMAIL`        | No       | Auto-admin email match (also default login notification recipient) |
| `LOGIN_NOTIFY_EMAIL` | No       | Override recipient for login notification emails                   |
| `SMTP_HOST`          | No       | SMTP host for login notification emails (e.g. `smtp.gmail.com`)    |
| `SMTP_PORT`          | No       | SMTP port (`587` TLS or `465` SSL)                                 |
| `SMTP_USER`          | No       | SMTP username                                                      |
| `SMTP_PASS`          | No       | SMTP password / app password                                       |
| `NOTIFY_FROM`        | No       | Sender address for login notifications                             |

### Frontend (`frontend/.env.local`)

| Variable          | Required | Description                                                |
| ----------------- | -------- | ---------------------------------------------------------- |
| `DATABASE_URL`    | Yes      | PostgreSQL connection string (for NextAuth Prisma adapter) |
| `NEXTAUTH_URL`    | Yes      | Your app URL (`http://localhost:3000` for local)           |
| `NEXTAUTH_SECRET` | Yes      | JWT signing secret (must match backend)                    |

---

## 🧩 Browser Extension

The project includes a Chrome/Edge extension (`extension/` folder) that automatically syncs your LeetCode accepted submissions to the tracker.

### Installation

1. Open `chrome://extensions` (or `edge://extensions` for Edge)
2. Enable **Developer mode** (toggle in the top-right)
3. Click **Load unpacked**
4. Select the `extension/` folder from this repository

The extension activates on LeetCode problem pages and pings your backend when you get an **Accepted** submission.

### Configure Backend URL (Important for deployed environments)

By default, extension sync targets `http://localhost:3001`. For deployed backend usage, set a custom base URL:

1. Open extension service worker console from `chrome://extensions` (Inspect views -> Service Worker)
2. Run:

```js
chrome.storage.sync.set({ dsaApiBaseUrl: "https://your-backend-domain.com" });
```

You can also set multiple fallback endpoints:

```js
chrome.storage.sync.set({
  dsaApiBaseUrls: ["https://api1.example.com", "https://api2.example.com"],
});
```

> **Sharing:** To share the extension with others, zip the `extension/` folder. They can extract it and load it the same way.

---

## 🖥 Deployment

For full production deployment instructions — including server setup, Nginx reverse proxy, SSL, database backups, and running with systemd or PM2 — see the **[Deployment Guide](DEPLOYMENT.md)**.

**Quick start (systemd):**

```bash
# Edit dsa-tracker.service with your paths, then:
sudo cp dsa-tracker.service /etc/systemd/system/dsa-tracker.service
sudo systemctl daemon-reload
sudo systemctl enable --now dsa-tracker
```

**Quick start (PM2):**

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save && pm2 startup
```

---

## ❓ Troubleshooting

| Problem                                      | Solution                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Port 3000/3001 already in use**            | Kill the process: `npx kill-port 3000 3001` or change ports in `.env`                                              |
| **Docker DB not starting**                   | Check Docker is running: `docker ps`. Run `docker-compose up -d` again                                             |
| **Prisma schema out of sync**                | Run `npx prisma db push` in both `backend/` and `frontend/`                                                        |
| **AI features returning errors**             | Review backend logs for local AI heuristic fallback behavior                                                       |
| **"NEXTAUTH_SECRET" mismatch**               | Ensure the secret is identical in both `backend/.env` and `frontend/.env.local`                                    |
| **Blank page after login**                   | Make sure the backend is running on port 3001                                                                      |
| **Lock file error on `npm run dev`**         | Stop duplicate frontend `next dev` processes, delete `frontend/.next/dev/lock`, then run only one startup command  |
| **Looks like API error but app is up**       | Verify health first: backend `GET http://localhost:3001/health` and frontend `GET http://localhost:3000`           |
| **Extension works locally but not deployed** | Set extension backend URL via `chrome.storage.sync.set({ dsaApiBaseUrl: "https://your-backend" })`                 |
| **No login notification emails**             | Verify SMTP vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) and recipient vars are set in `backend/.env` |

---

## 🤝 Contributing

Contributions are welcome! Please read the **[Contributing Guide](CONTRIBUTING.md)** for details on the development workflow, commit conventions, and pull request process.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software for personal or commercial purposes.
