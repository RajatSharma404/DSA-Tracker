# Deployment Guide

This guide covers deploying DSA Roadmap Tracker to a production environment. It includes instructions for Docker-based database setup, building the application, and running it with either **systemd** or **PM2** on a Linux server, as well as an optional **full Docker Compose** approach.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [1. Server Preparation](#1-server-preparation)
- [2. Clone and Configure](#2-clone-and-configure)
- [3. Database Setup](#3-database-setup)
- [4. Build the Application](#4-build-the-application)
- [5. Running in Production](#5-running-in-production)
  - [Option A: systemd Service](#option-a-systemd-service)
  - [Option B: PM2 Process Manager](#option-b-pm2-process-manager)
- [6. Reverse Proxy with Nginx](#6-reverse-proxy-with-nginx)
- [7. SSL with Let's Encrypt](#7-ssl-with-lets-encrypt)
- [8. Environment Variables Reference](#8-environment-variables-reference)
- [9. Monitoring and Logs](#9-monitoring-and-logs)
- [10. Backup and Restore](#10-backup-and-restore)
- [11. Updating the Application](#11-updating-the-application)
- [12. Troubleshooting](#12-troubleshooting)
- [13. Deploying on Render](#13-deploying-on-render)

---

## Prerequisites

| Requirement      | Details                                                 |
| ---------------- | ------------------------------------------------------- |
| **Linux server** | Ubuntu 22.04+ / Debian 12+ recommended                  |
| **Node.js**      | v20+ (install via [nvm](https://github.com/nvm-sh/nvm)) |
| **Docker**       | For running PostgreSQL                                  |
| **Domain name**  | Optional, but needed for SSL                            |
| **Git**          | To clone the repository                                 |

---

## 1. Server Preparation

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Verify installations
node -v
npm -v
docker -v
```

---

## 2. Clone and Configure

```bash
git clone https://github.com/your-username/DSA-Tracker.git
cd DSA-Tracker
```

### Backend environment (`backend/.env`)

```env
PORT=3001
NODE_ENV=production
DATABASE_URL="postgresql://postgres:YOUR_STRONG_PASSWORD@localhost:5432/dsatracker?schema=public"
NEXTAUTH_SECRET="generate-a-long-random-secret"
GEMINI_API_KEY="your-gemini-api-key"
```

### Frontend environment (`frontend/.env.local`)

```env
DATABASE_URL="postgresql://postgres:YOUR_STRONG_PASSWORD@localhost:5432/dsatracker?schema=public"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="same-secret-as-backend"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

> **Important:** Set `NEXTAUTH_URL` to your actual production URL (e.g., `https://dsa.yourdomain.com`). Update the Google OAuth redirect URI in the Google Cloud Console to match: `https://yourdomain.com/api/auth/callback/google`.

Generate a strong secret:

```bash
openssl rand -base64 48
```

---

## 3. Database Setup

Edit `docker-compose.yml` to use a strong password:

```yaml
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: YOUR_STRONG_PASSWORD # Change this!
      POSTGRES_DB: dsatracker
    ports:
      - "127.0.0.1:5432:5432" # Bind to localhost only
    volumes:
      - pgdata:/var/lib/postgresql/data
```

> **Security:** Bind the port to `127.0.0.1` so PostgreSQL is only accessible from the server itself, not the public internet.

```bash
# Start database
docker-compose up -d

# Verify it's running
docker ps
```

### Apply schema and seed data

```bash
# Backend schema + seed
cd backend
npm install
npx prisma db push
npx prisma db seed

# Frontend schema (for NextAuth)
cd ../frontend
npm install
npx prisma db push

cd ..
```

---

## 4. Build the Application

```bash
# Install root dependencies
npm install

# Build both backend and frontend
npm run build
```

This compiles TypeScript in the backend and produces a Next.js production build in the frontend.

---

## 5. Running in Production

### Option A: systemd Service

The repo includes a `dsa-tracker.service` file. Edit it to match your server:

```bash
nano dsa-tracker.service
```

Update these fields:

```ini
[Service]
User=YOUR_USERNAME
WorkingDirectory=/path/to/DSA-Tracker
ExecStart=/home/YOUR_USERNAME/.nvm/versions/node/v20.x.x/bin/npm start
Environment=PATH=/home/YOUR_USERNAME/.nvm/versions/node/v20.x.x/bin:/usr/local/bin:/usr/bin:/bin
Environment=NODE_ENV=production
```

Install and start:

```bash
# Copy service file
sudo cp dsa-tracker.service /etc/systemd/system/dsa-tracker.service

# Reload systemd
sudo systemctl daemon-reload

# Enable on boot
sudo systemctl enable dsa-tracker

# Start the service
sudo systemctl start dsa-tracker

# Check status
sudo systemctl status dsa-tracker
```

**Service management commands:**

| Action    | Command                              |
| --------- | ------------------------------------ |
| Start     | `sudo systemctl start dsa-tracker`   |
| Stop      | `sudo systemctl stop dsa-tracker`    |
| Restart   | `sudo systemctl restart dsa-tracker` |
| Status    | `sudo systemctl status dsa-tracker`  |
| View logs | `journalctl -u dsa-tracker -f`       |
| Disable   | `sudo systemctl disable dsa-tracker` |

### Option B: PM2 Process Manager

PM2 offers process monitoring, automatic restarts, and log management:

```bash
# Install PM2 globally
npm install -g pm2

# Start using the included config
pm2 start ecosystem.config.js

# Save the process list (survives reboot)
pm2 save

# Set PM2 to start on boot
pm2 startup
# Run the command it outputs (starts with sudo)
```

**PM2 management commands:**

| Action         | Command           |
| -------------- | ----------------- |
| List processes | `pm2 list`        |
| View logs      | `pm2 logs`        |
| Restart all    | `pm2 restart all` |
| Stop all       | `pm2 stop all`    |
| Monitor        | `pm2 monit`       |
| Delete all     | `pm2 delete all`  |

> **Note:** For production, update `ecosystem.config.js` to use build outputs instead of `npm run dev`. Change `args` from `"run dev"` to `"start"` and `script` to the appropriate command for your OS (`npm` on Linux, `npm.cmd` on Windows).

---

## 6. Reverse Proxy with Nginx

Nginx acts as a reverse proxy, forwarding requests to the Next.js frontend and Express backend.

```bash
sudo apt install -y nginx
```

Create the site config:

```bash
sudo nano /etc/nginx/sites-available/dsa-tracker
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/backend/ {
        rewrite ^/api/backend/(.*) /$1 break;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and start:

```bash
sudo ln -s /etc/nginx/sites-available/dsa-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Certbot will automatically configure Nginx for HTTPS and set up auto-renewal.

Verify auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## 8. Environment Variables Reference

### Backend (`backend/.env`)

| Variable          | Production Value                                                            |
| ----------------- | --------------------------------------------------------------------------- |
| `PORT`            | `3001`                                                                      |
| `NODE_ENV`        | `production`                                                                |
| `DATABASE_URL`    | `postgresql://postgres:STRONG_PASS@localhost:5432/dsatracker?schema=public` |
| `NEXTAUTH_SECRET` | Long random string (64+ chars)                                              |
| `GEMINI_API_KEY`  | Your Google Gemini API key                                                  |

### Frontend (`frontend/.env.local`)

| Variable               | Production Value          |
| ---------------------- | ------------------------- |
| `DATABASE_URL`         | Same as backend           |
| `NEXTAUTH_URL`         | `https://yourdomain.com`  |
| `NEXTAUTH_SECRET`      | Same as backend           |
| `GOOGLE_CLIENT_ID`     | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |

---

## 9. Monitoring and Logs

### With systemd

```bash
# Follow logs in real time
journalctl -u dsa-tracker -f

# View last 100 lines
journalctl -u dsa-tracker -n 100

# View logs since today
journalctl -u dsa-tracker --since today
```

### With PM2

```bash
# Real-time logs (all processes)
pm2 logs

# Logs for a specific process
pm2 logs dsa-backend
pm2 logs dsa-frontend

# Flush logs
pm2 flush
```

### Database

```bash
# Check PostgreSQL container logs
docker logs $(docker ps -q --filter name=postgres) -f
```

---

## 10. Backup and Restore

### Database backup

```bash
# Create a backup
docker exec $(docker ps -q --filter name=postgres) \
  pg_dump -U postgres dsatracker > backup_$(date +%Y%m%d_%H%M%S).sql

# Automate daily backups with cron
crontab -e
# Add this line (backs up daily at 2 AM):
# 0 2 * * * docker exec $(docker ps -q --filter name=postgres) pg_dump -U postgres dsatracker > /home/YOUR_USER/backups/dsa_$(date +\%Y\%m\%d).sql
```

### Database restore

```bash
# Restore from a backup file
cat backup_file.sql | docker exec -i $(docker ps -q --filter name=postgres) \
  psql -U postgres dsatracker
```

---

## 11. Updating the Application

```bash
cd /path/to/DSA-Tracker

# Pull latest changes
git pull origin main

# Install any new dependencies
cd backend && npm install
cd ../frontend && npm install
cd .. && npm install

# Apply any database migrations
cd backend && npx prisma db push
cd ../frontend && npx prisma db push
cd ..

# Rebuild
npm run build

# Restart the service
sudo systemctl restart dsa-tracker
# or with PM2:
pm2 restart all
```

---

## 12. Troubleshooting

| Problem                            | Solution                                                            |
| ---------------------------------- | ------------------------------------------------------------------- |
| **Service won't start**            | Check logs: `journalctl -u dsa-tracker -n 50`                       |
| **Database connection refused**    | Verify Docker is running: `docker ps`. Check `DATABASE_URL` matches |
| **Port already in use**            | Find the process: `sudo lsof -i :3000` and kill it                  |
| **Nginx 502 Bad Gateway**          | App isn't running; start it first, then reload Nginx                |
| **SSL certificate expired**        | Run `sudo certbot renew` and reload Nginx                           |
| **Google OAuth redirect mismatch** | Update redirect URI in Google Cloud Console to match production URL |
| **Prisma schema drift**            | Run `npx prisma db push` in both `backend/` and `frontend/`         |
| **Out of memory**                  | Check with `free -h`; consider adding swap or increasing server RAM |
| **PM2 not starting on reboot**     | Re-run `pm2 startup` and `pm2 save`                                 |

---

## 13. Deploying on Render

Render hosts the frontend (Next.js) and backend (Express) as two separate Web Services, and the database as a managed PostgreSQL instance.

### Step 1 — Create a PostgreSQL database

1. In the Render dashboard, click **New → PostgreSQL**
2. Give it a name (e.g. `dsa-tracker-db`) and choose a region
3. Once created, copy the **Internal Database URL** — you'll use this for both services

### Step 2 — Deploy the Backend

1. Click **New → Web Service**, connect your GitHub repo
2. Set the following:

   | Setting         | Value                                                                |
   | --------------- | -------------------------------------------------------------------- |
   | **Root Dir**    | `backend`                                                            |
   | **Environment** | `Node`                                                               |
   | **Build Cmd**   | `npm install && npx prisma db push && npx prisma db seed && npx tsc` |
   | **Start Cmd**   | `node index.js`                                                      |

3. Add environment variables:

   | Variable          | Value                             |
   | ----------------- | --------------------------------- |
   | `PORT`            | `3001`                            |
   | `NODE_ENV`        | `production`                      |
   | `DATABASE_URL`    | Internal Database URL from Step 1 |
   | `NEXTAUTH_SECRET` | A long random string (64+ chars)  |
   | `GEMINI_API_KEY`  | Your Google Gemini API key        |

4. Deploy. Once live, copy the backend's public URL (e.g. `https://dsa-tracker-backend.onrender.com`)

### Step 3 — Deploy the Frontend

1. Click **New → Web Service**, connect the same repo
2. Set the following:

   | Setting         | Value                                                |
   | --------------- | ---------------------------------------------------- |
   | **Root Dir**    | `frontend`                                           |
   | **Environment** | `Node`                                               |
   | **Build Cmd**   | `npm install && npx prisma db push && npm run build` |
   | **Start Cmd**   | `npm start`                                          |

3. Add environment variables:

   | Variable               | Value                                                                     |
   | ---------------------- | ------------------------------------------------------------------------- |
   | `DATABASE_URL`         | Internal Database URL from Step 1 (for NextAuth)                          |
   | `NEXTAUTH_URL`         | Your frontend Render URL (e.g. `https://dsa-tracker.onrender.com`)        |
   | `NEXTAUTH_SECRET`      | Same secret as the backend                                                |
   | `GOOGLE_CLIENT_ID`     | From Google Cloud Console                                                 |
   | `GOOGLE_CLIENT_SECRET` | From Google Cloud Console                                                 |
   | `BACKEND_URL`          | Your backend Render URL (e.g. `https://dsa-tracker-backend.onrender.com`) |

4. In **Google Cloud Console**, add the frontend Render URL to:
   - Authorised JavaScript origins: `https://dsa-tracker.onrender.com`
   - Authorised redirect URIs: `https://dsa-tracker.onrender.com/api/auth/callback/google`

### How `BACKEND_URL` works

The `next.config.ts` rewrite proxies all `/api/*` requests to the backend.
On Render (`BACKEND_URL` set), it proxies to your backend service URL.
Locally (no env var), it falls back to `http://localhost:3001`.

### Re-deploy not showing changes?

Render caches the build directory between deploys. To force a clean build:

1. Go to your Web Service → **Settings → Build & Deploy**
2. Click **Clear build cache & deploy**

Or via the Render CLI:

```bash
render deploys create --service-id <your-service-id> --clear-cache
```

> The `generateBuildId` in `next.config.ts` also ensures each deploy gets a unique build ID so browser and CDN caches are busted automatically.
