<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h1 align="center">🚀 DSA Tracker Mastery System</h1>

  <p align="center">
    A comprehensive, full-stack learning platform engineered for serious Data Structures and Algorithms mastery.
    <br />
    <strong>Structured Roadmap • Theory-First Learning • Spaced Repetition • AI Guidance</strong>
    <br />
    <br />
    <a href="#quick-start-5-minutes">Quick Start</a>
    ·
    <a href="#architecture-overview">View Architecture</a>
    ·
    <a href="#features-at-a-glance">Explore Features</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
      <li><a href="#detailed-documentation">Detailed Documentation</a></li>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#features-at-a-glance">Features at a Glance</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#quick-start-5-minutes">Quick Start (5 Minutes)</a></li>
    <li><a href="#architecture-overview">Architecture Overview</a></li>
    <li><a href="#local-development-setup-detailed">Local Development Setup (Detailed)</a></li>
    <li><a href="#environment-variable-reference">Environment Variable Reference</a></li>
    <li><a href="#core-scripts">Core Scripts</a></li>
    <li><a href="#browser-extension-integration">Browser Extension Integration</a></li>
    <li><a href="#comprehensive-dsa-bootcamp-seeding">Bootcamp Seeding</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#troubleshooting">Troubleshooting</a></li>
    <li><a href="#contributing">Contributing</a></li>
  </ol>
</details>

## Detailed Documentation

Comprehensive multi-page documentation now lives in the `docs/` folder.

- Docs index: [docs/README.md](docs/README.md)
- First-time setup: [docs/getting-started.md](docs/getting-started.md)
- Product and user guides: [docs/product-overview.md](docs/product-overview.md), [docs/user-guide.md](docs/user-guide.md)
- System and operations: [docs/architecture.md](docs/architecture.md), [docs/developer-operations.md](docs/developer-operations.md)
- References: [docs/reference/environment-variables.md](docs/reference/environment-variables.md), [docs/reference/api-reference.md](docs/reference/api-reference.md), [docs/reference/data-model.md](docs/reference/data-model.md)
- Troubleshooting: [docs/troubleshooting.md](docs/troubleshooting.md)

## About The Project

DSA Tracker is not just a list of problems. It is a full-fledged, precision learning system designed to shift the focus from merely "solving problems" to achieving true technical mastery.

By combining algorithmic pattern tracking, global error journaling, automated spaced repetition, and an immersive challenge arena, it provides a unified hub for comprehensive interview preparation. Whether you are learning complexity analysis for the first time or grinding advanced graph algorithms, this platform manages the cognitive load of what to study, when to review, and how to improve.

---

## Features at a Glance

### 🎯 Core Learning & Mastery

- **Theory-First Learning Tracks:** Structured modules, lessons, and interactive blocks that teach the _why_ before the _how_. Includes a built-in comprehensive C++ DSA Bootcamp.
- **Spaced Repetition Review Flow:** An intelligent review engine that calculates easiness factors and next review dates, ensuring you revisit concepts precisely when you're about to forget them.
- **The Vault (Global Error Journaling):** A centralized knowledge base for logging "Gotchas," critical learning moments, and useful tips directly linked to specific problems.

### ⚔️ The Arena & Interview Prep

- **Challenge Arena:** A dedicated, distraction-free environment for timed, competitive problem-solving. Features dynamic problem layouts and automated tracking of challenge sessions.
- **Mock Interview Simulations:** Track your performance in simulated interviews, log scores, and manage detailed feedback to pinpoint areas for growth.
- **Solution History & Code Analysis:** Maintain a complete history of your submissions. Track time/space complexity, AI-assisted generation state, and optimal solutions.

### 📊 Insights & Organization

- **Advanced Analytics & Weekly Reports:** Track your current and longest streaks, visualize weak topics, and receive actionable insights to guide your daily plan.
- **Recommendations Engine:** Get tailored suggestions for the next best problem to solve based on your performance, weak spots, and spaced repetition queue.
- **Deep Problem Organization:** Utilize bookmarks, custom colored tags, and a powerful search engine to organize thousands of problems effortlessly.

### 🤖 AI Integration & Tooling

- **AI-Assisted Guidance:** Integrated AI tools that act as a tutor—providing hints, conducting code reviews, and executing trace-style walkthroughs without giving away the answer.
- **LeetCode Browser Extension:** A companion extension that seamlessly syncs your LeetCode problem solving, runtime/memory stats, and session cookies directly to your DSA Tracker instance.

---

## Tech Stack

### Frontend

- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS 4
- **Auth:** NextAuth.js
- **State & Fetching:** Axios, React hooks
- **UI Components:** Monaco Editor (with Vim bindings), ReactFlow, Recharts, Framer Motion (animations)

### Backend

- **Server:** Express 5
- **Language:** TypeScript
- **ORM:** Prisma 5
- **Database:** PostgreSQL (Docker optimized)
- **Security:** JWT-based utilities, CORS policies

### Tooling & Infrastructure

- **Containerization:** Docker Compose
- **Package Management:** npm workspaces
- **Deployment:** PM2 / systemd / Render-ready

---

## Quick Start (5 Minutes)

If you want to run the app locally as fast as possible, follow this checklist:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/RajatSharma404/DSA-Tracker.git
   cd DSA-Tracker
   ```

2. **Start PostgreSQL:**

   ```bash
   docker compose up -d
   ```

3. **Initialize the Backend:**

   ```bash
   cd backend
   npm install
   npx prisma db push
   npx prisma db seed
   ```

   _Create `backend/.env`:_

   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
   NEXTAUTH_SECRET="replace-with-a-long-random-secret"
   ```

4. **Initialize the Frontend:**

   ```bash
   cd ../frontend
   npm install
   npx prisma db push
   ```

   _Create `frontend/.env.local`:_

   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="replace-with-the-same-secret-as-backend"
   ```

5. **Run the Full Stack:**

   ```bash
   cd ..
   npm install
   npm run dev
   ```

6. **Access the App:**
   - Frontend Dashboard: `http://localhost:3000`
   - Backend Health Check: `http://localhost:3001/health`

---

## Architecture Overview

The repository is structured as a monorepo containing three core layers:

1. **Frontend (`/frontend`)**
   Next.js App Router application handling UI presentation, client state management, authentication flows, and API proxy rewriting.
2. **Backend (`/backend`)**
   Express API server handling heavy business logic, Prisma data access, progress calculation, spaced repetition algorithms, AI interaction, and extension sync.
3. **Database**
   PostgreSQL instance, run locally via Docker and managed via cloud providers in production.

### Request Flow

1. The user's browser interacts with Next.js routes.
2. The frontend calls `/api/*`.
3. A Next.js rewrite securely forwards non-auth `/api/*` requests to the backend server.
4. NextAuth routes (`/api/auth/*`) are handled securely by the frontend.
5. The backend executes business logic and updates PostgreSQL via Prisma.

---

## Local Development Setup (Detailed)

### 1) Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (or Engine)
- Git

### 2) Database Setup

Start the local PostgreSQL container using the default settings (`postgres:password`, port 5432):

```bash
docker compose up -d
```

### 3) Backend Setup

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

Create an extensive `backend/.env` file:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
NEXTAUTH_SECRET="your-secure-random-secret"
AUTH_SECRET="your-secure-random-secret"
ADMIN_EMAIL="you@example.com"
CORS_ORIGINS="http://localhost:3000"
ALLOW_INSECURE_CREDENTIALS_LOGIN="false"

# Optional Email Notification Setup
LOGIN_NOTIFY_EMAIL="you@example.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-app-password"
NOTIFY_FROM="DSA Tracker <your-smtp-user>"
```

Push the schema and seed initial topic data:

```bash
npx prisma db push
npx prisma db seed
```

### 4) Frontend Setup

Navigate to the frontend folder and install dependencies:

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-secret" # MUST match backend
```

Apply the frontend schema:

```bash
npx prisma db push
```

### 5) Run Both Servers

From the repository root:

```bash
npm run dev
```

This concurrently starts the Next.js dev server on `3000` and the Express API on `3001`.

---

## Environment Variable Reference

### Backend Variables

| Variable          | Required | Purpose                                      |
| ----------------- | -------- | -------------------------------------------- |
| `NODE_ENV`        | Yes      | Runtime mode (`development`/`production`)    |
| `PORT`            | Yes      | Backend listening port (default: 3001)       |
| `DATABASE_URL`    | Yes      | Prisma connection string                     |
| `NEXTAUTH_SECRET` | Yes      | Shared JWT verification secret               |
| `ADMIN_EMAIL`     | No       | Email address granted automatic admin rights |
| `CORS_ORIGINS`    | No       | Comma-separated allowed origins              |
| `SMTP_*`          | No       | Mailer configuration for notifications       |

### Frontend Variables

| Variable          | Required | Purpose                                                   |
| ----------------- | -------- | --------------------------------------------------------- |
| `DATABASE_URL`    | Yes      | NextAuth Prisma adapter connection                        |
| `NEXTAUTH_URL`    | Yes      | Public frontend base URL                                  |
| `NEXTAUTH_SECRET` | Yes      | Shared JWT verification secret                            |
| `BACKEND_URL`     | Prod     | Target for frontend API proxy (e.g., your Render API URL) |

---

## Core Scripts

**Root Level**

- `npm run dev`: Concurrently runs frontend and backend in development mode.
- `npm run build`: Compiles both projects.
- `npm run start`: Starts both projects in production mode.

**Backend Level**

- `npm run dev`: Runs the `ts-node-dev` server.
- `npm run build`: Compiles TypeScript and generates Prisma client.

**Frontend Level**

- `npm run dev`: Runs Next.js development server.
- `npm run build`: Builds the production Next.js bundle.

---

## Browser Extension Integration

The project includes a custom Chrome/Edge browser extension (`/extension`) that synchronizes your LeetCode progress directly with your DSA Tracker instance.

### Installation

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer Mode**.
3. Click **Load unpacked** and select the `/extension` directory.

### LeetCode Sync Workflow

1. Log into LeetCode.
2. Copy your `LEETCODE_SESSION` cookie from browser dev tools.
3. Paste it into the DSA Tracker **Settings** page.
4. Solve a problem in the Tracker Editor.
5. The backend routes the submission to LeetCode, polls for the verdict, and logs the execution time, memory usage, and success status directly to your progress tracker.

---

## Comprehensive DSA Bootcamp Seeding

The application ships with a massive, pre-configured algorithmic bootcamp containing theory, modules, and lessons.

**Bootcamp Contents:**

- 1 Theory Track: "Complete DSA Bootcamp (C++)"
- 20 Modules (from Arrays to Advanced Graphs)
- 20 Lessons & 40 Interactive Content Blocks

**To generate the Bootcamp:**
Make an authenticated POST request as an Admin:

```bash
curl -X POST http://localhost:3001/api/admin/learn/seed-comprehensive \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

---

## Deployment

### Render Deployment

1.  **Backend Web Service:**
    - Root: `backend`
    - Command: `npm install && npm run build && npm start`
    - Env Vars: `DATABASE_URL`, `NODE_ENV=production`, `NEXTAUTH_SECRET`
2.  **Frontend Web Service:**
    - Root: `frontend`
    - Command: `npm install && npm run build && npm start`
    - Env Vars: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `BACKEND_URL`

### Linux VM Deployment (PM2 + Nginx)

1.  Clone repo to server and install dependencies.
2.  Build projects: `npm run build`
3.  Start with PM2:
    ```bash
    npm install -g pm2
    pm2 start ecosystem.config.js
    pm2 save
    ```
4.  Configure Nginx to reverse proxy port `80/443` to `3000` (Frontend) and `3001` (Backend API).
5.  Secure with Certbot SSL.

---

## Troubleshooting

- **Prisma Engine Lock (Windows EPERM):** If `npm run build` fails on Windows, a background node process is locking Prisma. Kill all node instances, delete `backend/node_modules/.prisma`, and retry.
- **Next.js Dev Lock:** Delete `frontend/.next/dev/lock` if the frontend refuses to boot.
- **Stale Production API Calls:** Ensure your frontend `BACKEND_URL` environment variable is pointing to the correct deployed backend URL. If not set, Next.js rewrite rules will fail.
- **LeetCode Extension Fails:** Refresh your `LEETCODE_SESSION` cookie in settings, ensure you are logged into LeetCode on the same profile, and reload the extension.

---

## Contributing

Contributions make the open-source community an amazing place to learn and create.

1. Clone the project and pull the latest changes from `main`.
2. Create a Feature Branch (`git checkout -b feat/AmazingFeature`).
3. Commit your Changes using standard prefixes (`feat:`, `fix:`, `refactor:`, `docs:`).
4. Verify the frontend and backend boot cleanly locally.
5. Push to the Branch (`git push origin feat/AmazingFeature`).
6. Open a Pull Request with detailed testing instructions.

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
