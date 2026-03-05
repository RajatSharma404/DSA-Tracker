# DSA Roadmap Tracker

A full-stack web application to track your Data Structures & Algorithms journey with AI-powered code evaluation, visual roadmaps, spaced repetition, and more — built with Next.js 15, Express.js, PostgreSQL, and Google Gemini AI.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![Express](https://img.shields.io/badge/Express-5-lightgrey?logo=express) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma) ![Gemini](https://img.shields.io/badge/Gemini_AI-powered-4285F4?logo=google)

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

| Feature                   | Description                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Visual Roadmap**        | Interactive graph of topics and problems using ReactFlow                                                                                       |
| **AI Code Evaluation**    | Submit code and get instant correctness verdict, complexity analysis, optimal approaches, edge case checks, and a score (powered by Gemini AI) |
| **Solution Persistence**  | Your submitted code is saved — come back later and it's still there                                                                            |
| **AI Mentor Hints**       | Get contextual hints without spoilers                                                                                                          |
| **AI Code Review**        | Paste any code and receive a detailed review                                                                                                   |
| **Algorithm Visualizer**  | Step-by-step dry run of your code with variable tracking                                                                                       |
| **Topic Study Guides**    | In-depth guides for each DSA topic                                                                                                             |
| **Spaced Repetition**     | Review queue that resurfaces problems at optimal intervals                                                                                     |
| **Explore & Search**      | Filter problems by difficulty, status, topic, bookmarks, and custom tags                                                                       |
| **AI Recommendations**    | Personalized problem suggestions based on your weaknesses                                                                                      |
| **Analytics Dashboard**   | Activity heatmap, skill radar, streak tracking, productivity insights                                                                          |
| **Achievements & Badges** | Unlock badges as you hit milestones                                                                                                            |
| **Weekly Reports**        | Auto-generated summary of your weekly progress                                                                                                 |
| **The Vault**             | DSA pattern templates and personal notes per problem                                                                                           |
| **The Arena**             | Timed challenge sessions to simulate interview pressure                                                                                        |
| **Mock Interviews**       | Track your mock interview scores and feedback                                                                                                  |
| **Google OAuth Login**    | Secure authentication via NextAuth                                                                                                             |
| **Admin Panel**           | Manage users, topics, and problems                                                                                                             |

---

## 🛠 Tech Stack

**Frontend:** Next.js 15 · React 19 · Tailwind CSS 4 · ReactFlow · Recharts · Monaco Editor · Lucide Icons

**Backend:** Express.js 5 · Prisma ORM · PostgreSQL · Google Gemini AI · JWT

**Auth:** NextAuth (Google OAuth)

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

- A **Google Cloud Console** project with OAuth 2.0 credentials (for login)
- A **Google Gemini API key** (for AI features) — get one at [aistudio.google.com](https://aistudio.google.com/apikey)

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
GEMINI_API_KEY="your-google-gemini-api-key"
```

> **Note:** The Docker default password is `password`. If you changed it in `docker-compose.yml`, update `DATABASE_URL` accordingly.

Now push the database schema and seed initial data (topics + problems):

```bash
npx prisma db push
npx prisma db seed
```

The seed loads ~150 DSA problems across 15+ topics (Arrays, Trees, Graphs, DP, etc.).

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
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

> **Getting Google OAuth credentials:**
>
> 1. Go to [Google Cloud Console](https://console.cloud.google.com/)
> 2. Create a new project (or select existing)
> 3. Go to **APIs & Services → Credentials**
> 4. Click **Create Credentials → OAuth 2.0 Client ID**
> 5. Set Application type to **Web application**
> 6. Add `http://localhost:3000` to **Authorized JavaScript origins**
> 7. Add `http://localhost:3000/api/auth/callback/google` to **Authorized redirect URIs**
> 8. Copy the Client ID and Client Secret into your `.env.local`

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

Open [http://localhost:3000](http://localhost:3000) and click **Sign in with Google**. Your account is created automatically on first login.

### 2. Dashboard

After login, you land on the **Dashboard** showing:

- Total progress (solved / total problems)
- Current & longest streak
- Weak topics that need attention
- Problems due for revision

### 3. Topics & Problems

- Click **Topics** in the sidebar to see all DSA topics (Arrays, Linked List, Trees, etc.)
- Click any topic to see its problems
- Click a problem to open the **code editor**

### 4. Writing & Submitting Code

- The **code editor** loads the LeetCode starter template for the selected language (C++, C, Java, Python3)
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

### 5. Visual Roadmap

Click **Visual Roadmap** to see an interactive graph of all topics and problems, showing dependencies and your progress visually.

### 6. The Vault

Access **The Vault** for:

- DSA pattern templates (Sliding Window, Binary Search, BFS/DFS, etc.)
- Personal notes per problem (Markdown supported)

### 7. Analytics

The **Analytics** page shows:

- Activity heatmap (GitHub-style contribution graph)
- Skill radar across all topics
- Productivity insights and score trends

### 8. Explore & Search

Use **Explore** to filter problems across all topics by:

- Difficulty (Easy / Medium / Hard)
- Status (Todo / Doing / Done)
- Topic
- Bookmarks and custom tags

### 9. Review Queue

**Review Queue** uses spaced repetition to resurface problems you've solved. Problems appear when they're due for review to strengthen long-term retention.

### 10. AI Recommendations

**AI Recommend** analyzes your solved problems and weak areas to suggest what to practice next.

### 11. The Arena

**The Arena** offers timed challenge sessions — pick a difficulty and time limit, then solve as many problems as you can under pressure.

### 12. Settings

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
│   ├── aiService.ts            # Gemini AI — hints, reviews, evaluation, recommendations
│   ├── leetcodeService.ts      # LeetCode API integration
│   ├── services.ts             # Business logic (streaks, analytics, achievements)
│   ├── templates.ts            # DSA pattern templates for The Vault
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (15 models)
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

| Variable          | Required | Description                               |
| ----------------- | -------- | ----------------------------------------- |
| `PORT`            | Yes      | Backend server port (default: `3001`)     |
| `DATABASE_URL`    | Yes      | PostgreSQL connection string              |
| `NEXTAUTH_SECRET` | Yes      | JWT signing secret (must match frontend)  |
| `GEMINI_API_KEY`  | Yes      | Google Gemini API key for all AI features |

### Frontend (`frontend/.env.local`)

| Variable               | Required | Description                                                |
| ---------------------- | -------- | ---------------------------------------------------------- |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string (for NextAuth Prisma adapter) |
| `NEXTAUTH_URL`         | Yes      | Your app URL (`http://localhost:3000` for local)           |
| `NEXTAUTH_SECRET`      | Yes      | JWT signing secret (must match backend)                    |
| `GOOGLE_CLIENT_ID`     | Yes      | Google OAuth Client ID                                     |
| `GOOGLE_CLIENT_SECRET` | Yes      | Google OAuth Client Secret                                 |

---

## 🧩 Browser Extension

The project includes a Chrome/Edge extension (`extension/` folder) that automatically syncs your LeetCode accepted submissions to the tracker.

### Installation

1. Open `chrome://extensions` (or `edge://extensions` for Edge)
2. Enable **Developer mode** (toggle in the top-right)
3. Click **Load unpacked**
4. Select the `extension/` folder from this repository

The extension activates on LeetCode problem pages and pings your backend when you get an **Accepted** submission.

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

| Problem                              | Solution                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **Port 3000/3001 already in use**    | Kill the process: `npx kill-port 3000 3001` or change ports in `.env`                          |
| **Docker DB not starting**           | Check Docker is running: `docker ps`. Run `docker-compose up -d` again                         |
| **Prisma schema out of sync**        | Run `npx prisma db push` in both `backend/` and `frontend/`                                    |
| **Google login not working**         | Verify redirect URI in Google Console matches `http://localhost:3000/api/auth/callback/google` |
| **AI features returning errors**     | Check your `GEMINI_API_KEY` is valid and has quota remaining                                   |
| **"NEXTAUTH_SECRET" mismatch**       | Ensure the secret is identical in both `backend/.env` and `frontend/.env.local`                |
| **Blank page after login**           | Make sure the backend is running on port 3001                                                  |
| **Lock file error on `npm run dev`** | Delete `frontend/.next/dev/lock` and try again                                                 |

---

## 🤝 Contributing

Contributions are welcome! Please read the **[Contributing Guide](CONTRIBUTING.md)** for details on the development workflow, commit conventions, and pull request process.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software for personal or commercial purposes.
