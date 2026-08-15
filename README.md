<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <img src="frontend/public/logo.svg" alt="Logo" width="85" height="85">
  <h1 align="center">🚀 DSA Tracker Mastery Ecosystem - "Project Ascend"</h1>

  <p align="center">
    <strong>The Ultimate Competitive Algorithmic Training & FAANG Interview Preparation Platform</strong>
    <br />
    <em>1v1 PvP Battles • 1,500+ Node Visual Roadmap • AlgoTracer 2.0 Execution Stepper • FlashRecall SM-2 Deck • Company Hiring Tracks & Monte Carlo Simulator • AI Neural Coach</em>
    <br />
    <br />
    <a href="#-quick-start-guide-5-minutes">Quick Start</a>
    ·
    <a href="#-flagship-features--deep-dive">Explore Features</a>
    ·
    <a href="#-architecture--tech-stack">Tech Stack</a>
    ·
    <a href="#-step-by-step-local-setup-guide">Setup Guide</a>
    ·
    <a href="#-production-deployment">Deployment</a>
  </p>
</div>

---

<details>
  <summary><strong>📑 Table of Contents (Click to Expand)</strong></summary>
  <ol>
    <li><a href="#-about-the-project">About The Project</a></li>
    <li><a href="#-flagship-features--deep-dive">Flagship Features Deep Dive</a>
      <ul>
        <li><a href="#1-1v1-gladiator-pvp-arena-pvp--pvpmatchid">1v1 Gladiator PvP Arena</a></li>
        <li><a href="#2-interactive-curriculum-roadmap-roadmap">Interactive Curriculum Roadmap (1,500+ Questions)</a></li>
        <li><a href="#3-algotracer-20-visual-execution-stepper-tracer">AlgoTracer 2.0 Execution Stepper & Custom Code Engine</a></li>
        <li><a href="#4-flashrecall-sm-2-pattern-flashcard-deck-flashcards">FlashRecall SM-2 Invariant Flashcard Deck</a></li>
        <li><a href="#5-company-hiring-tracks--monte-carlo-offer-predictor-company-tracks">Company Tracks & Monte Carlo Offer Predictor</a></li>
        <li><a href="#6-sm-2-spaced-repetition-review-queue-review">SM-2 Spaced Repetition Review Queue</a></li>
        <li><a href="#7-neural-ai-recommendations--study-blueprint-recommendations">Neural AI Coach & 7-Day Blueprint</a></li>
        <li><a href="#8-faang-speed-benchmarks--time-analytics-analytics">FAANG Speed Benchmarks & Time Analytics</a></li>
        <li><a href="#9-gladiator-achievements--exp-leveling-engine-achievements">Gladiator Achievements & EXP Leveling Engine</a></li>
        <li><a href="#10-weekly-ai-executive-report-card-weekly-report">Weekly AI Executive Report Card</a></li>
        <li><a href="#11-monocraft-web-ide--solution-vault-problems-amp-vault">Monocraft Web IDE & Solution Vault</a></li>
        <li><a href="#12-browser-extension--background-auto-sync-hub-extension">Browser Extension & Auto-Sync Hub</a></li>
        <li><a href="#13-dynamic-multi-theme-presets-oled-cyberpunk-matrix-etc">Dynamic Multi-Theme Presets</a></li>
        <li><a href="#14-theory-first-bootcamp-learn-tracks-learn">Theory-First Bootcamp Learn Tracks</a></li>
        <li><a href="#15-admin-control-center-admin">Admin Control Center</a></li>
      </ul>
    </li>
    <li><a href="#-architecture--tech-stack">Architecture & Tech Stack</a></li>
    <li><a href="#-quick-start-guide-5-minutes">Quick Start Guide (5 Minutes)</a></li>
    <li><a href="#-step-by-step-local-setup-guide">Step-by-Step Local Setup Guide</a></li>
    <li><a href="#-environment-variables-reference">Environment Variables Reference</a></li>
    <li><a href="#-npm-scripts-reference">NPM Scripts Reference</a></li>
    <li><a href="#-browser-extension-setup">Browser Extension Setup</a></li>
    <li><a href="#-comprehensive-dsa-bootcamp-seeding">Bootcamp Seeding</a></li>
    <li><a href="#-production-deployment">Production Deployment (Render & Linux VM)</a></li>
    <li><a href="#-troubleshooting--faq">Troubleshooting & FAQ</a></li>
    <li><a href="#-contributing">Contributing</a></li>
    <li><a href="#-license">License</a></li>
  </ol>
</details>

---

## 🌟 About The Project

**DSA Tracker Mastery System ("Project Ascend")** is a premier, enterprise-grade competitive programming and algorithmic mastery platform. It is engineered to transform how engineers prepare for technical interviews at top-tier companies (Google, Meta, Amazon, Apple, Uber, and Quantitative Trading firms).

Unlike generic problem trackers, **DSA Tracker** is an intelligent ecosystem that:
- Combines **SuperMemo-2 (SM-2)** cognitive spaced repetition with real-time memory decay tracking.
- Features real-time **1v1 PvP Ranked Code Battles** with live opponent progress telemetry.
- Provides a **2D Multi-Tier Metro-Map Curriculum DAG** capable of rendering over 1,500 interconnected problem nodes at 60 FPS.
- Delivers an **Interactive Algorithmic State Stepper (AlgoTracer 2.0)** that executes and animates custom user code line-by-line.
- Simulates **1,000 Monte Carlo stochastic interview loops** to calculate statistical offer clearance probabilities.

---

## 🚀 Flagship Features — Deep Dive

### 1. ⚔️ 1v1 Gladiator PvP Arena (`/pvp` & `/pvp/[matchId]`)
- **Ranked Matchmaker & ELO Progression**: Compete on a global ladder scaling from *Bronze Tier (1200 ELO)* to *Grandmaster Challenger (2500+ ELO)*.
- **3 Match Formats**:
  - ⚡ *15-Minute Speed Blitz* (1.2x ELO): High-tempo reflex sprint on classic patterns.
  - 🏆 *30-Minute Ranked Competitive* (1.5x ELO): Medium/Hard challenges with strict runtime bounds.
  - 💀 *25-Minute Sudden Death* (2.0x ELO): Single submission permitted; any wrong answer or runtime exception immediately forfeits the match.
- **Live Opponent Progress Radar**: Real-time telemetry tracking opponent typing activity, line count velocity, and test cases passed count (`[3/4 Passed]`).
- **Post-Match Victory Celebration**: Real-time ELO score delta calculations (+24 ELO on victory), execution runtime statistics, and instant rematch triggers.

---

### 2. 🗺️ Interactive Curriculum Roadmap (`/roadmap`)
- **2D Multi-Tier Metro-Map DAG**: Structured into 4 curriculum phases:
  - 🔵 **Phase 1: Foundations** (*Arrays, Strings, Two Pointers, Sliding Window, Math*)
  - 🟢 **Phase 2: Core Data Structures** (*Linked Lists, Stacks, Queues, Binary Trees, Heaps*)
  - 🟡 **Phase 3: Search & Graphs** (*Binary Search, Recursion, Backtracking, BFS/DFS, Disjoint Set Union*)
  - 🟣 **Phase 4: Advanced DP & Optimization** (*Greedy, Dynamic Programming, Tries, Bit Manipulation*)
- **1,500+ Question Expansion on Canvas**: Expand individual topics or click **`Expand All (1500+)`** to lay out every question on the graph canvas.
- **Graceful Curved Bezier Edges**: Smooth cubic bezier curves with dynamic glow colors:
  - 🟢 *Emerald Green*: Completed problems.
  - 🔵 *Cyan / Sky Blue*: Uncompleted questions.
  - 🟡 *Amber*: Problems due for spaced repetition review.
  - 🟣 *Purple*: Inter-phase milestone bridges.
- **60 FPS Viewport Culling**: Powered by ReactFlow `onlyRenderVisibleElements={true}` and GPU-accelerated CSS transforms.
- **Search Auto-Focus**: Jump-to-topic search bar with camera auto-focus (`reactFlow.setCenter`).
- **Cyberpunk Slide-Over Problem Matrix Drawer**: Filter and search through questions within any topic node without leaving the graph.

---

### 3. 🔍 AlgoTracer 2.0: Visual Execution Stepper (`/tracer`)
- **Interactive State Stepper Engine**: Step forward, step backward, reset, and auto-play code execution at 0.5x, 1x, or 2x speed.
- **Dynamic Memory Visualizer**: Real-time animated memory boxes with glowing active indices, pointer badges ($L, R, \text{Low}, \text{Mid}, \text{High}, i, j$), and sliding window bounding highlights.
- **Custom Code Playground**:
  - Write or paste **any custom JavaScript/TypeScript algorithm**.
  - Enter custom test arrays (e.g. `[1, 8, 6, 2, 5, 4, 8, 3, 7]`).
  - Click **`Trace & Explain Code`** to automatically generate a step-by-step memory trace and line-by-line invariant explanation.
- **Synchronized Code Trace & Memory Watch Inspector**: Active line highlights paired with live variable mutation tables.
- **Preloaded Algorithmic Suites**: Two Pointers Two Sum, Sliding Window Max Subarray, Binary Search, and more.

---

### 4. 🗂️ FlashRecall SM-2 Pattern Flashcard Deck (`/flashcards`)
- **3D Interactive Flip Cards**: Flip between high-yield algorithmic questions and rigorous mathematical invariant proofs.
- **Curated Invariant Library**:
  - *Kadane's Algorithm Invariant*
  - *Floyd's Cycle Finding (Tortoise & Hare) Proof*
  - *Monotonic Stack Decreasing Invariant*
  - *Dijkstra Greedy Choice Condition & Negative Edge Proof*
  - *Binary Search on Monotonic Answer Space*
- **SuperMemo-2 Recall Grading**: 4-point rating system (`Forgot`, `Hard`, `Good`, `Easy`) that dynamically reschedules review intervals.
- **Category Filter Tabs**: DP, Graphs, Two Pointers, Arrays, Math, and Trees.

---

### 5. 🏛️ Company Hiring Tracks & Monte Carlo Offer Predictor (`/company-tracks`)
- **Curated Tier-1 Hiring Tracks**:
  - 🔴 **Google Flagship Track (50 Problems)**: Heavy emphasis on DP, graph invariants, Disjoint Set, and Tries.
  - 🔵 **Meta Speed 50 (50 Problems)**: 20-minute solve speed targets on Two Pointers, Binary Trees, and HashMaps.
  - 🟡 **Amazon Gauntlet (45 Problems)**: Tree traversals, BFS/DFS, priority queues, and Leadership Principles.
  - 🟣 **Uber Routing & Graphs (35 Problems)**: Spatial pathfinding, Dijkstra, and network graph algorithms.
- **Monte Carlo 1,000-Run Offer Simulator**: Simulates 1,000 stochastic 45-minute technical screen loops based on your actual historical accuracy, solve velocity, and topic retention to output a statistically modeled clearance probability.

---

### 6. 🧠 SM-2 Spaced Repetition Review Queue (`/review`)
- **5-Stage Leitner Memory Matrix**: Visual retention health scoring (Stage 1: Learning ➔ Stage 5: Permanent Retention).
- **Rapid Keyboard Scoring**: Rate memory recall speed using number keys `1` (*Again*), `2` (*Hard*), `3` (*Good*), `4` (*Easy*).
- **Next Review Scheduler**: Automatically calculates optimal recall intervals in days based on SM-2 easiness factors.

---

### 7. 🤖 Neural AI Recommendations & Study Blueprint (`/recommendations`)
- **4 Curation Pillars**:
  - 🎯 *Weakness Remediation*: Targets lowest accuracy topics.
  - 🚀 *Next Frontier*: Suggests high-yield adjacent topics based on curriculum DAG.
  - ⚡ *Speed Optimization*: Prompts for faster solve times on fundamentals.
  - 🏢 *FAANG High-Frequency*: Top questions asked in technical loops.
- **7-Day Study Blueprint**: Daily tailored problem schedule with estimated completion times.
- **Target Goal Calculator**: Interactive problem goal estimator with target completion deadlines.

---

### 8. 📊 FAANG Speed Benchmarks & Time Analytics (`/analytics`)
- **FAANG Speed Benchmarks**: Compares your average solve speeds against top candidate standards (*Easy < 10m, Medium < 22m, Hard < 38m*).
- **Time Horizon Selector**: Filter trends over 14 Days, 30 Days, or 8 Weeks.
- **Topic Hour Allocation Matrix**: Visual breakdown of hours invested across every algorithm domain.
- **Fastest Record vs Longest Deep Dive**: Spotlights standout execution records.

---

### 9. 🏆 Gladiator Achievements & EXP Leveling Engine (`/achievements`)
- **Gamified EXP Engine**: Earn 150 EXP per unlocked badge and 25 EXP per solved problem.
- **Rank Tiers**: Scale from *Apprentice Gladiator (Level 1)* to *Grandmaster Challenger (Level 25+)*.
- **Category Filters**: Milestones, Consistency, Difficulty, Exploration, and Mastery.
- **3D Glowing Badge Cards**: Visual trophy cards with rarity indicators and completion progress bars.

---

### 10. 📑 Weekly AI Executive Report Card (`/weekly-report`)
- **AI Executive Briefing**: Natural language briefing on weekly consistency and difficulty mix.
- **Week-over-Week Performance Delta**: Tracks solve counts and time invested vs previous week.
- **Difficulty Ratio Bar**: Visual proportions of Easy, Medium, and Hard problems solved.
- **One-Click Shareable Summary**: Copies a formatted ASCII performance card to clipboard for Discord, LinkedIn, or study groups.

---

### 11. 💻 Monocraft Web IDE & Solution Vault (`/problems/[problemId]` & `/vault`)
- **Monaco Code Editor**: Professional-grade IDE with syntax highlighting, IntelliSense, and Vim mode.
- **AI Algorithmic Assistant**: Generates contextual hints, invariant reviews, complexity analyzers, and execution traces without spoiling direct solutions.
- **The Vault**: Comprehensive archive of all historical code submissions with Big-O tags, verdict badges, and personal problem notes.

---

### 12. 🔌 Browser Extension & Auto-Sync Hub (`/extension`)
- **Private API Key Generator**: Secure one-click token generation to connect your browser extension.
- **Zero-Click Background Sync**: Automatically captures solve times, code submissions, and difficulty stats from LeetCode and Codeforces directly into your DSA Tracker database.
- **4-Step Quick Setup Guide**: Instructions for loading the unpacked extension into Chrome or Edge.

---

### 13. 🎨 Dynamic Multi-Theme Presets
- Switch between 6 curated, ultra-premium themes with instant cascading CSS custom variables:
  - 🌑 **OLED Midnight** (Pure pitch black with neon cyan and violet accents)
  - 🟡 **Cyberpunk 2077** (Neon yellow and electric magenta on deep navy)
  - 🟢 **Matrix Emerald** (Dark terminal green and mint code aesthetic)
  - 🟣 **Tokyo Night** (Twilight purple and electric rose highlights)
  - 🔵 **Nordic Slate** (Slate blue with icy teal and arctic cyan elements)
  - ⚪ **Enterprise Light** (Clean crisp enterprise slate and indigo)

---

### 14. 🎓 Theory-First Bootcamp Learn Tracks (`/learn`)
- **20 Structured Modules**: Comprehensive C++ DSA Bootcamp covering Arrays, Strings, Two Pointers, Linked Lists, Trees, Graphs, Dynamic Programming, and more.
- **40 Interactive Lessons**: Rich ASCII diagrams, step-by-step dry runs, and complexity matrices.

---

### 15. 🛡️ Admin Control Center (`/admin`)
- **User Management**: Inspect registered users and update user roles (`USER` ➔ `ADMIN`).
- **Topic & Problem CRUD**: Add, edit, reorder, or delete topics and problems.
- **One-Click Database Seeding**: Initialize and populate comprehensive curriculum data.

---

## 🏗️ Architecture & Tech Stack

```
DSA-Tracker/
├── frontend/                    # Next.js 16 (App Router, Turbopack, React 19)
│   ├── src/app/                 # 28 Static & Dynamic Application Routes
│   │   ├── (dashboard)/         # Protected Dashboard Hub
│   │   │   ├── pvp/             # 1v1 PvP Matchmaker & Live Battlefield
│   │   │   ├── tracer/          # AlgoTracer 2.0 Execution Stepper
│   │   │   ├── flashcards/      # FlashRecall SM-2 Flashcard Deck
│   │   │   ├── company-tracks/  # Company Roadmaps & Monte Carlo Simulator
│   │   │   ├── extension/       # Browser Extension Hub & API Keys
│   │   │   ├── roadmap/         # 2D Multi-Tier Curriculum DAG
│   │   │   ├── review/          # SM-2 Spaced Repetition Queue
│   │   │   ├── recommendations/ # AI Neural Coach & 7-Day Blueprint
│   │   │   ├── analytics/       # FAANG Speed Benchmarks & Time Matrix
│   │   │   ├── achievements/    # Gladiator EXP Leveling System
│   │   │   ├── weekly-report/   # AI Executive Briefing
│   │   │   ├── challenge/       # Timed Arena
│   │   │   ├── interviews/      # Mock Interview Simulator
│   │   │   ├── vault/           # Solution Code Vault
│   │   │   ├── learn/           # Bootcamp Theory Tracks
│   │   │   ├── search/          # Advanced Problem Search
│   │   │   ├── settings/        # Preferences & LeetCode Sync
│   │   │   └── admin/           # Admin Management Suite
│   ├── src/components/          # Modular UI, Roadmap Graph & Visualizers
│   └── src/lib/                 # API Client, Design Tokens & Analytics
├── backend/                     # Express 5 + TypeScript + Prisma ORM
│   ├── index.ts                 # REST API Endpoints & Auth Middleware
│   ├── aiService.ts             # AI Guidance & Algorithmic Tracing Engine
│   ├── services.ts              # SM-2 Math, Analytics & Recommendation Engine
│   └── prisma/                  # Database Schema & Migrations
├── extension/                   # Manifest V3 Chrome/Edge Auto-Sync Extension
└── docker-compose.yml           # Local PostgreSQL Database Container
```

---

## ⚡ Quick Start Guide (5 Minutes)

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Docker Desktop** (for local PostgreSQL database)

```bash
# 1. Clone the repository
git clone https://github.com/RajatSharma404/DSA-Tracker.git
cd DSA-Tracker

# 2. Start PostgreSQL container
docker compose up -d

# 3. Setup Backend
cd backend
npm install
npx prisma db push
npx prisma db seed
cd ..

# 4. Setup Frontend
cd frontend
npm install
npx prisma db push
cd ..

# 5. Launch Full-Stack Application
npm run dev
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API Server**: `http://localhost:3001`
- **API Health Check**: `http://localhost:3001/health`

---

## 🛠️ Step-by-Step Local Setup Guide

### 1. Database Configuration
Ensure Docker is running and execute:
```bash
docker compose up -d
```
*This launches a PostgreSQL 15 instance on port `5432` with database `dsatracker`.*

---

### 2. Backend Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```
2. Create `backend/.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
   NEXTAUTH_SECRET="your-super-secret-jwt-key-change-this-in-production"
   CORS_ORIGINS="http://localhost:3000"
   ```
3. Initialize Database Schema & Seed Data:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

---

### 3. Frontend Setup
1. Navigate to `frontend/`:
   ```bash
   cd ../frontend
   npm install
   ```
2. Create `frontend/.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-jwt-key-change-this-in-production"
   ```
3. Initialize Frontend Prisma Client:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

### 4. Running the Full Stack
From the workspace root directory:
```bash
# Concurrently starts Backend on 3001 and Frontend on 3000
npm run dev
```

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `NODE_ENV` | **Yes** | `development` | Runtime environment (`development` or `production`) |
| `PORT` | **Yes** | `3001` | Backend HTTP listening port |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection URI |
| `NEXTAUTH_SECRET` | **Yes** | — | Shared cryptographic secret for JWT authentication |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Whitelisted frontend origins (comma-separated) |
| `ADMIN_EMAIL` | No | — | Email automatically granted administrative privileges |

### Frontend (`frontend/.env.local` or Cloud Environment)
| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` | **Yes** | — | NextAuth PostgreSQL connection string |
| `NEXTAUTH_URL` | **Yes** | `http://localhost:3000` | Canonical public URL of frontend deployment |
| `NEXTAUTH_SECRET` | **Yes** | — | Must match `NEXTAUTH_SECRET` in backend |
| `BACKEND_URL` | **Production** | — | URL of backend API in production (e.g. `https://dsa-backend.onrender.com`) |

---

## 📜 NPM Scripts Reference

### Root Directory
- `npm run dev`: Runs frontend and backend concurrently in development mode.
- `npm run build`: Compiles backend (TypeScript) and builds frontend (Next.js production bundle).
- `npm run start`: Concurrently runs production builds.

### Backend (`cd backend`)
- `npm run dev`: Starts backend using `ts-node`.
- `npm run build`: Compiles TypeScript to `dist/` and runs `prisma generate`.
- `npm run start`: Starts production Node server (`node dist/index.js`).

### Frontend (`cd frontend`)
- `npm run dev`: Starts Next.js development server with Turbopack.
- `npm run build`: Compiles production Next.js build.
- `npm run start`: Starts Next.js production server.

---

## 🔌 Browser Extension Setup

1. Open **Google Chrome** or **Microsoft Edge**.
2. Navigate to `chrome://extensions` (or `edge://extensions`).
3. Toggle on **Developer Mode** in the top right.
4. Click **Load unpacked** and select the `/extension` directory in this repo.
5. Navigate to **DSA Tracker Extension Hub (`/extension`)**, copy your API Key, and paste it into the extension popup.

---

## 📚 Comprehensive DSA Bootcamp Seeding

To populate the 20-module C++ DSA Theory Bootcamp:
```bash
cd backend
npx ts-node seedComprehensiveDSA.ts
```

Or trigger via authenticated API call:
```bash
curl -X POST http://localhost:3001/api/admin/learn/seed-comprehensive \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

---

## ☁️ Production Deployment

### Deploying to Render.com

#### 1. PostgreSQL Database
- Create a **PostgreSQL Database** on Render.
- Copy the **Internal Database URL**.

#### 2. Backend Web Service
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `10000`
  - `DATABASE_URL`: `<Render PostgreSQL Internal URL>`
  - `NEXTAUTH_SECRET`: `<Long Random Secret>`
  - `CORS_ORIGINS`: `https://<your-frontend>.onrender.com`

#### 3. Frontend Web Service
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `DATABASE_URL`: `<Render PostgreSQL Internal URL>`
  - `NEXTAUTH_URL`: `https://<your-frontend>.onrender.com`
  - `NEXTAUTH_SECRET`: `<Same Secret as Backend>`
  - `BACKEND_URL`: `https://<your-backend>.onrender.com`

---

## ❓ Troubleshooting & FAQ

- **Database Connection Refused**: Verify Docker PostgreSQL container is running (`docker ps`) and listening on port `5432`.
- **Prisma EPERM Locks on Windows**: Terminate any lingering background Node processes (`taskkill /F /IM node.exe`) and rerun `npx prisma db push`.
- **Theme Not Changing**: Clear browser cache or ensure cookies/localStorage permissions are enabled for `dsa_tracker_theme`.
- **API Call 401 Unauthorized**: Ensure your session token has not expired; re-login via `/login`.

---

## 🤝 Contributing

1. Fork the Project.
2. Create a Feature Branch (`git checkout -b feat/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`).
4. Ensure all builds pass (`npm run build`).
5. Push to the Branch (`git push origin feat/AmazingFeature`).
6. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
