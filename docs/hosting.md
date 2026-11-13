# Hosting & Deployment Architecture Guide

This document compares hosting options for **DSA Tracker Pro** across **Render**, **Fly.io**, and **Railway** to eliminate cold start latencies and optimize full-stack Node 22 / Next.js 15 / PostgreSQL deployments.

> [!NOTE]
> All pricing figures and tier quotas below are indicative baselines; verify current pricing and quotas directly on each provider's official pricing page.

---

## Stack Profile
- **Frontend**: Next.js 15 (App Router, React 19, TypeScript, Standalone/Node)
- **Backend**: Express 5 (Node 22, Prisma ORM 5.22, WebSockets/SSE)
- **Database**: PostgreSQL 16 (relational schema, FSRS review logs, activity events)
- **Keep-Alive Endpoint**: `/api/ping` (used for health monitoring, uptime checks, and background keep-alive)

---

## 1. Provider Comparison Matrix

| Feature | Render (Individual / Starter) | Railway | Fly.io |
| :--- | :--- | :--- | :--- |
| **Cold Start Behavior** | Free: 30–60s spin-down.<br>**Starter ($7/mo): 0s (always-on)** | **0s (Always-on)** by default; usage-based micro-billing | **0s** with `min_machines_running = 1`; auto-stop on 0 |
| **Node.js 22 Runtime** | Native Node.js environment or Docker | Multi-stage Docker or Railpack | Multi-stage Docker container |
| **PostgreSQL Integration** | Managed Postgres ($7/mo Starter) | Managed Postgres ($5/mo baseline usage) | Fly Postgres (Stolon/LiteFS or Supabase integration) |
| **Connection Pooling** | Managed pgBouncer on paid tiers | Available via Prisma Accelerate or PgBouncer container | Built-in LiteFS/Fly-Proxy connection management |
| **Zero-Downtime Deploys** | Health check gate with rolling deploys | Immediate rolling container replacement | Rolling update across machine instances |
| **WebSockets Support** | Yes (built-in) | Yes (built-in) | Yes (low-latency TCP/WebSocket proxy) |
| **Global Edge Latency** | Single-region (Oregon, Frankfurt, Ohio, Singapore) | Multi-region edge proxy, single app region | Anycast global edge routing across 35+ regions |

---

## 2. In-Depth Provider Breakdown

### A. Render (Current Primary Host)
- **Free Tier Issues**: Free web services spin down after 15 minutes of inactivity, producing 30–60s cold starts that degrade first-request UX.
- **Paid Starter Recommendation**:
  - Upgrading the backend web service to **Starter ($7/mo)** keeps the Node instance permanently warm with 512MB RAM and 0.5 CPU.
  - Adding **Render PostgreSQL Starter ($7/mo)** gives 1GB RAM, 10GB storage, and automated point-in-time recovery.
- **Pros**:
  - Zero-configuration repository linking and automatic preview environments.
  - Built-in static site / Next.js hosting alongside Node services.
  - Native health checks hitting `/api/ping`.
- **Cons**:
  - Fixed monthly price per container; no scale-to-zero without cold starts.
  - Free tier Postgres expires after 30 days unless upgraded.

### B. Railway
- **Pricing Model**: Usage-based resource execution ($5 free tier credit / month, then pay-as-you-go per vCPU-second and RAM-gigabyte).
- **Pros**:
  - Extremely fast builds via Nixpacks/Docker.
  - Database provisioning takes under 10 seconds with internal private network DNS (`postgres.railway.internal`).
  - No cold start lag when configured with persistent execution.
- **Cons**:
  - Variable monthly billing if traffic spikes.
  - Requires setting usage limits to prevent surprise bills.

### C. Fly.io
- **Pricing Model**: Pay-per-VM hour; 3 shared-cpu-1x 256MB VMs within the free resource tier.
- **Pros**:
  - Deploys close to the user via Anycast IP routing.
  - Granular control with `fly.toml` (e.g. `min_machines_running = 1`).
  - Native WireGuard private networking.
- **Cons**:
  - Higher DevOps overhead (managing Dockerfiles, volumes, and Postgres replication clusters).
  - Postgres is self-hosted on Fly machines rather than a traditional managed DB service unless using Supabase integration.

---

## 3. Recommended Strategy

1. **Short-Term (Zero Architecture Change)**:
   - Upgrade the existing Render backend to **Render Starter Web Service ($7/mo)**.
   - This eliminates the 50s cold start completely while preserving all existing environment variables, secrets, and git push deploy hooks.
   - Retain `/api/ping` for external uptime monitors (e.g. Better Uptime or UptimeRobot) pinging every 5 minutes as a redundancy guard.
2. **Medium-Term (Unified Full-Stack)**:
   - Deploy backend and frontend Docker containers on **Railway** with private networking between the Express API and managed PostgreSQL.

