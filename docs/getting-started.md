# Getting Started

This guide brings up DSA Tracker locally with PostgreSQL, backend API, and frontend app.

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop or Docker Engine
- Git

## 1. Clone and enter repository

```bash
git clone https://github.com/RajatSharma404/DSA-Tracker.git
cd DSA-Tracker
```

## 2. Start database

The repository contains `docker-compose.yml` for local PostgreSQL.

```bash
docker compose up -d
```

Default local DB values from compose:

- host: `localhost`
- port: `5432`
- database: `dsatracker`
- username: `postgres`
- password: `password`

## 3. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
NEXTAUTH_SECRET="replace-with-long-random-secret"
AUTH_SECRET="replace-with-same-value-as-NEXTAUTH_SECRET"
ADMIN_EMAIL="you@example.com"
CORS_ORIGINS="http://localhost:3000"
ALLOW_INSECURE_CREDENTIALS_LOGIN="false"
```

Optional email notification settings:

```env
LOGIN_NOTIFY_EMAIL="you@example.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
NOTIFY_FROM="DSA Tracker <your-smtp-user>"
```

Initialize schema and seed data:

```bash
npx prisma db push
npx prisma db seed
```

## 4. Frontend setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-same-secret-as-backend"
AUTH_SECRET="replace-with-same-secret-as-backend"
BACKEND_URL="http://localhost:3001"
```

Apply frontend Prisma schema (needed by NextAuth adapter paths when DB is used):

```bash
npx prisma db push
```

## 5. Start full stack from repository root

```bash
cd ..
npm install
npm run dev
```

This launches:

- frontend: `http://localhost:3000`
- backend: `http://localhost:3001`

## 6. Verify health

Open:

- backend health: `http://localhost:3001/health`
- frontend login/dashboard: `http://localhost:3000`

## 7. Optional: seed comprehensive bootcamp track

Run backend and authenticate as an admin user, then call:

```bash
curl -X POST http://localhost:3001/api/admin/learn/seed-comprehensive \
  -H "Authorization: Bearer YOUR_ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected result includes track/module/lesson/block creation counts.

## Common local startup commands

From repository root:

```bash
npm run dev
npm run build
npm run start
```

Windows helper:

```bat
start.bat
```

## Next documentation

- [Product Overview](./product-overview.md)
- [User Guide](./user-guide.md)
- [Troubleshooting](./troubleshooting.md)
