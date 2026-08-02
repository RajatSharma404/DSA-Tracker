<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <img src="frontend/public/logo.svg" alt="Logo" width="80" height="80">
  <h1 align="center">🚀 DSA Tracker Mastery System - "Project Ascend"</h1>

  <p align="center">
    A comprehensive, full-stack precision learning platform engineered for serious Data Structures and Algorithms mastery.
    <br />
    <strong>3D City Visualization • Interactive Curriculum Roadmap • Spaced Repetition • AI Guidance • Code Vault</strong>
    <br />
    <br />
    <a href="#quick-start-5-minutes">Quick Start</a>
    ·
    <a href="#architecture-overview">View Architecture</a>
    ·
    <a href="#features-at-a-glance">Explore Features</a>
    ·
    <a href="#deployment">Render Deployment</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#detailed-documentation">Detailed Documentation</a></li>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#whats-new-in-project-ascend">What's New in Project Ascend</a></li>
    <li><a href="#features-at-a-glance">Features at a Glance</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#quick-start-5-minutes">Quick Start (5 Minutes)</a></li>
    <li><a href="#architecture-overview">Architecture Overview</a></li>
    <li><a href="#local-development-setup-detailed">Local Development Setup (Detailed)</a></li>
    <li><a href="#environment-variable-reference">Environment Variable Reference</a></li>
    <li><a href="#core-scripts">Core Scripts</a></li>
    <li><a href="#browser-extension-integration">Browser Extension Integration</a></li>
    <li><a href="#comprehensive-dsa-bootcamp-seeding">Bootcamp Seeding</a></li>
    <li><a href="#deployment">Deployment (Render & Linux VM)</a></li>
    <li><a href="#troubleshooting">Troubleshooting</a></li>
    <li><a href="#contributing">Contributing</a></li>
  </ol>
</details>

---

## Detailed Documentation

Comprehensive multi-page documentation lives in the `docs/` folder:

- **Docs Index:** [docs/README.md](docs/README.md)
- **First-time Setup:** [docs/getting-started.md](docs/getting-started.md)
- **Product & User Guides:** [docs/product-overview.md](docs/product-overview.md), [docs/user-guide.md](docs/user-guide.md)
- **System & Operations:** [docs/architecture.md](docs/architecture.md), [docs/developer-operations.md](docs/developer-operations.md)
- **References:** [docs/reference/environment-variables.md](docs/reference/environment-variables.md), [docs/reference/api-reference.md](docs/reference/api-reference.md), [docs/reference/data-model.md](docs/reference/data-model.md)
- **Troubleshooting:** [docs/troubleshooting.md](docs/troubleshooting.md)

---

## About The Project

**DSA Tracker** is not just a list of problems. It is a full-fledged, precision learning system designed to shift the focus from merely "solving problems" to achieving true technical mastery.

By combining algorithmic pattern tracking, global error journaling, automated spaced repetition (SM-2 algorithm), an interactive 3D City learning environment, and a ReactFlow graph visualizer, it provides a unified hub for comprehensive technical interview preparation. Whether you are learning complexity analysis for the first time or grinding advanced graph algorithms, this platform manages what to study, when to review, and how to improve.

---

## What's New in "Project Ascend" 🚀

The platform recently underwent a massive structural and UX overhaul known as **Project Ascend**, which elevated the application to an enterprise-grade standard:

- 🏙️ **3D City Visualization & Campus Workspace:** An immersive Three.js & React Three Fiber environment (`CityScene`, `Building`, `CentralSpire`) that renders interactive 3D floors representing DSA topics. Features dynamic lighting, level progression locks, ambient sound engine (`cityAudio.ts`), interactive Leaderboard modal, and User Inspector modal.
- 🗺️ **Interactive Curriculum Graph ("Roadmap Visualizer"):** Built with `ReactFlow` and `Dagre` graph layouting algorithms (`RoadmapGraph.tsx`), allowing users to visually explore DAG connections between topics and problems. Features status filters (`ALL`, `TODO`, `DOING`, `DONE`, `DUE`), difficulty filters (`EASY`, `MEDIUM`, `HARD`), expandable topic nodes, and graceful error resilience.
- 🍱 **Bento Grid UI & Fluid Motion:** The entire frontend is structured into a glassmorphic Bento Grid layout with `framer-motion` staggered entry animations and Google `Inter` typography.
- ⌨️ **Global Command Palette (`Cmd+K` / `Ctrl+K`):** Fast MacOS-style command palette (`cmdk`) to instantly navigate between Dashboard, Topics, Interactive Curriculum, Code Vault, and Settings.
- 🔒 **The "Code Vault":** Centralized tracking for `SolutionHistory`. View past code submissions alongside performance badges (Time/Space Complexity, "Optimal" indicators) and syntax-highlighted Monaco editor blocks with optional Vim keybindings.
- 📚 **Bootcamp-Grade Educational Content:** Pre-loaded with 20 comprehensive DSA theory modules (Arrays to Advanced Graphs). Each module features rich ASCII diagrams, step-by-step dry runs, complexity matrices, and classic problem blueprints.

---

## Features at a Glance

### 🎯 Core Learning & Mastery
- **Interactive Curriculum Roadmap:** Visual DAG graph (`RoadmapGraph`) powered by ReactFlow and Dagre auto-layouting for visual tracking of topics and dependencies.
- **Theory-First Learning Tracks:** Structured modules, lessons, and interactive blocks that teach the *why* before the *how* (includes C++ DSA Bootcamp).
- **Spaced Repetition Review Engine:** SM-2 based review algorithm calculating easiness factors and next review dates, ensuring timely concept review.
- **The Vault (Global Error Journaling):** Centralized knowledge base for logging "Gotchas," critical learning moments, complexity badges, and historical code submissions.

### 🏙️ 3D City & Gamified Progression
- **Interactive 3D Campus:** Real-time Three.js rendering of DSA topic buildings, floor completions, and progress spires (`CentralSpire`).
- **City Leaderboard & User Inspection:** Compare floor completion metrics with peers and inspect detailed user statistics via modal drawers.
- **Spatial Audio Feedback:** Built-in ambient audio system (`cityAudio.ts`) providing auditory feedback during floor progression.

### ⚔️ Arena & Interview Prep
- **Challenge Arena:** A dedicated, distraction-free environment for timed, competitive problem-solving with automated tracking.
- **Mock Interview Simulations:** Track performance in simulated technical interviews, log interview scores, and manage detailed interviewer feedback.

### 📊 Analytics & Tooling
- **Advanced Analytics & Reports:** Visualize topic mastery, current/longest streaks, and actionable daily recommendations.
- **LeetCode Browser Extension:** Seamless Chrome/Edge extension sync for automatic problem-solving logs, runtime/memory stats, and session cookie validation.
- **AI Tutor Guidance:** Integrated AI hints, code reviews, and step-by-step execution walkthroughs without revealing direct answers.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16.1 (App Router, Turbopack)
- **Library:** React 19
- **Styling:** Tailwind CSS 4 (with `@tailwindcss/typography`), Framer Motion
- **3D Graphics:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Graph & Diagrams:** ReactFlow, Dagre, Recharts
- **Editor & UI:** Monaco Editor (with Vim mode support), `cmdk` Command Palette, Lucide React Icons
- **Auth:** NextAuth.js (Prisma adapter)
- **HTTP Client:** Axios with authentication interceptors and automatic retry logic

### Backend
- **Server Framework:** Express 5
- **Language:** TypeScript 5
- **Database ORM:** Prisma 5
- **Database Engine:** PostgreSQL (Docker optimized locally, managed cloud in production)
- **Security:** JWT token verification, CORS origin whitelist, Argon2/bcrypt password hashing

### Infrastructure & Deployment
- **Containerization:** Docker & Docker Compose
- **Monorepo Management:** npm workspaces
- **Cloud Deployment:** Render (Web Services + PostgreSQL database), PM2 / systemd / Nginx for Linux VMs

---

## Quick Start (5 Minutes)

To run the full stack locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RajatSharma404/DSA-Tracker.git
   cd DSA-Tracker
   ```

2. **Start PostgreSQL Container:**
   ```bash
   docker compose up -d
   ```

3. **Configure & Initialize Backend:**
   ```bash
   cd backend
   npm install
   ```
   *Create `backend/.env`:*
   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
   NEXTAUTH_SECRET="replace-with-a-long-random-secret"
   CORS_ORIGINS="http://localhost:3000"
   ```
   Push schema and seed initial topics:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Configure & Initialize Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   *Create `frontend/.env.local`:*
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="replace-with-the-same-secret-as-backend"
   ```
   Push frontend schema:
   ```bash
   npx prisma db push
   ```

5. **Run Full Stack:**
   ```bash
   cd ..
   npm run dev
   ```

6. **Access App:**
   - Frontend Web App: `http://localhost:3000`
   - Backend API Health: `http://localhost:3001/health`

---

## Architecture Overview

The repository is structured as a monorepo containing three primary layers:

```
DSA-Tracker/
├── frontend/             # Next.js 16 (App Router, Three.js, ReactFlow, Monaco Editor)
├── backend/              # Express 5 + TypeScript + Prisma ORM
│   ├── index.ts          # REST Endpoints & Authentication Middleware
│   ├── content/          # Seeding Data & Comprehensive DSA Bootcamp Content
│   └── prisma/           # Database Schemas & Migrations
├── extension/            # Chrome/Edge Extension for LeetCode Synchronization
├── docs/                 # Multi-page Documentation Suite
└── docker-compose.yml    # Local PostgreSQL Container Configuration
```

### Request Flow
1. User interacts with Next.js page components.
2. Next.js API rewrites forward client requests (`/api/*`) securely to the Express backend.
3. NextAuth handle authentication (`/api/auth/*`) on the frontend server.
4. Express backend executes business logic, spaced repetition math, and queries PostgreSQL via Prisma ORM.

---

## Environment Variable Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Purpose |
| :--- | :---: | :---: | :--- |
| `NODE_ENV` | **Yes** | `development` | Runtime environment mode |
| `PORT` | **Yes** | `3001` | Backend HTTP listening port |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | **Yes** | — | Shared JWT verification secret |
| `ADMIN_EMAIL` | No | — | Email automatically assigned admin privileges |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated CORS allowed origins |

### Frontend (`frontend/.env.local` or Render Environment)

| Variable | Required | Default | Purpose |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` | **Yes** | — | NextAuth database connection string |
| `NEXTAUTH_URL` | **Yes** | `http://localhost:3000` | Canonical public URL of frontend deployment |
| `NEXTAUTH_SECRET` | **Yes** | — | Must match `NEXTAUTH_SECRET` in backend |
| `BACKEND_URL` | **Production** | — | Target URL of deployed backend (e.g. `https://dsa-backend.onrender.com`) |

---

## Core Scripts

**Root Level**
- `npm run dev`: Concurrently launches frontend and backend development servers.
- `npm run build`: Compiles both backend (TypeScript) and frontend (Next.js production bundle).
- `npm run start`: Runs production servers for both apps concurrently.

**Backend Level** (`cd backend`)
- `npm run dev`: Starts server using `ts-node`.
- `npm run build`: Compiles TypeScript to `dist/` and runs `prisma generate`.
- `npm run start`: Starts production Node server (`node dist/index.js`).

**Frontend Level** (`cd frontend`)
- `npm run dev`: Starts Next.js development server on port 3000.
- `npm run build`: Builds production Next.js application bundle.

---

## Browser Extension Integration

The project includes a custom Chrome/Edge browser extension (`/extension`) to synchronize LeetCode progress directly into your DSA Tracker instance.

### Setup Instructions
1. Open `chrome://extensions` (or `edge://extensions`) in your browser.
2. Enable **Developer Mode**.
3. Click **Load unpacked** and select the `/extension` directory.

### Sync Workflow
1. Sign in to LeetCode in your browser.
2. Copy your `LEETCODE_SESSION` cookie value from dev tools (`F12 -> Application -> Cookies`).
3. Paste the token into **DSA Tracker Settings**.
4. Solve a problem in the Tracker workspace; execution runtime, memory footprint, and success status sync automatically.

---

## Comprehensive DSA Bootcamp Seeding

The application includes a pre-configured algorithmic bootcamp containing theory, modules, and lessons.

**Bootcamp Specs:**
- 1 Theory Track: "Complete DSA Bootcamp (C++)"
- 20 Detailed Modules (Arrays, Strings, Two Pointers, Linked Lists, Trees, Graphs, DP, etc.)
- 20 Lessons & 40 Interactive Content Blocks with ASCII diagrams and step-by-step dry runs.

**To Run Seeding:**
```bash
cd backend
npx ts-node seedComprehensiveDSA.ts
```

Or trigger as an authenticated Admin:
```bash
curl -X POST http://localhost:3001/api/admin/learn/seed-comprehensive \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

---

## Deployment

### Render Deployment (Recommended)

DSA Tracker is designed for seamless deployment on [Render](https://render.com).

#### 1. PostgreSQL Database
- Create a **PostgreSQL Database** instance on Render.
- Copy the **Internal Database URL** (or External URL for external access).

#### 2. Backend Web Service
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `NODE_ENV`: `production`
  - `PORT`: `10000` (Render default port)
  - `DATABASE_URL`: `<Render PostgreSQL Connection String>`
  - `NEXTAUTH_SECRET`: `<Long Random Secret String>`
  - `CORS_ORIGINS`: `https://<your-frontend-app>.onrender.com`

#### 3. Frontend Web Service
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `NODE_ENV`: `production`
  - `DATABASE_URL`: `<Render PostgreSQL Connection String>`
  - `NEXTAUTH_URL`: `https://<your-frontend-app>.onrender.com`
  - `NEXTAUTH_SECRET`: `<Same Secret as Backend>`
  - `BACKEND_URL`: `https://<your-backend-app>.onrender.com`

---

### Linux VM Deployment (PM2 + Nginx)

1. Clone repo to server and install Node.js 20+.
2. Install PM2: `npm install -g pm2`
3. Build both applications: `npm run build`
4. Start via PM2 ecosystem configuration:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```
5. Configure Nginx reverse proxy to forward traffic on port `80/443` to port `3000` (Frontend) and `3001` (Backend).

---

## Troubleshooting

- **Roadmap visualizer missing data:** Ensure backend route returns topic problems cleanly. Check browser dev console for Axios authorization errors.
- **Prisma Engine Lock (EPERM on Windows):** If `npm run build` fails on Windows due to file locks, kill background node processes (`taskkill /F /IM node.exe`) and retry.
- **Stale Production API Calls:** Verify frontend `BACKEND_URL` environment variable points to your live backend endpoint.
- **LeetCode Extension Sync Issue:** Refresh `LEETCODE_SESSION` in user settings and reload unpacked extension.

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Clone repository and create a feature branch (`git checkout -b feat/YourFeature`).
2. Follow strict TypeScript and React standards.
3. Commit using descriptive standard prefixes (`feat:`, `fix:`, `docs:`, `refactor:`).
4. Verify local frontend and backend builds pass cleanly (`npm run build`).
5. Open a Pull Request with detailed testing notes.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
