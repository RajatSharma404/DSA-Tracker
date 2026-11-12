# Operational Runbook

This runbook provides actionable, step-by-step procedures for deploying, maintaining, securing, and recovering **DSA Tracker Pro** in staging and production environments.

---

## 1. Production Deployment Workflow

### Deployment Order
To prevent downtime or schema mismatch errors during rolling updates, follow this strict deployment order:

1. **Pre-Deployment Migration Check:**
   Verify that all migrations have been tested against a staging database:
   ```bash
   cd backend
   npx prisma migrate status
   ```

2. **Execute Schema Migrations:**
   Run migrations on the production database before launching updated application containers:
   ```bash
   npx prisma migrate deploy
   ```

3. **Build & Restart Backend Service:**
   ```bash
   npm run build:render
   # Or restart via systemd/PM2
   pm2 restart backend || systemctl restart dsa-backend
   ```

4. **Build & Restart Frontend Service:**
   ```bash
   cd ../frontend
   npm run build
   pm2 restart frontend || systemctl restart dsa-frontend
   ```

5. **Post-Deployment Smoke Verification:**
   ```bash
   # Check backend health
   curl -f http://localhost:3001/api/health
   # Check feature flags endpoint
   curl -f http://localhost:3001/api/features
   ```

---

## 2. Key Rotation: `BACKEND_JWT_SECRET`

`BACKEND_JWT_SECRET` signs short-lived (10-minute) HS256 tokens exchanged between the Next.js frontend proxy and the Express API.

### Rotation Procedure (Minimal Interruption)
Because tokens expire after 10 minutes, key rotation requires a coordinated 2-step update:

1. **Generate High-Entropy Secret (Min 32 bytes):**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update Environment Files:**
   Set the new secret in both tiers:
   - `backend/.env`: `BACKEND_JWT_SECRET="<new_secret>"`
   - `frontend/.env.local`: `BACKEND_JWT_SECRET="<new_secret>"`

3. **Restart Both Services Simultaneously:**
   ```bash
   # In production environment
   pm2 restart all
   ```

4. **User Impact:**
   Active browser clients with previously issued tokens will receive a 401 on their next API request; the frontend Axios interceptor automatically requests a fresh token at `/api/backend-token` using the current NextAuth session, completing re-authentication with zero user disruption.

---

## 3. Revoking an Extension Device Token

If a user suspects an extension pairing token was compromised or a device was lost:

### Method A: Web UI (Recommended)
1. Navigate to `/settings` or `/extension`.
2. Locate the device under **Paired Devices**.
3. Click **Revoke Access**.

### Method B: Database CLI Emergency Revocation
To immediately revoke a specific device or all devices for a user via `psql`:

```bash
# Revoke a single device by device ID
psql $DATABASE_URL -c "UPDATE extension_devices SET \"revokedAt\" = NOW() WHERE id = '<device_id>';"

# Revoke ALL devices for a specific user email
psql $DATABASE_URL -c "
UPDATE extension_devices 
SET \"revokedAt\" = NOW() 
WHERE \"userId\" = (SELECT id FROM users WHERE email = 'user@example.com');
"
```

Any subsequent synchronization requests using the revoked pairing token will immediately be rejected with HTTP 401/403.

---

## 4. Database Backup & Disaster Recovery (`pg_dump`)

### Creating a Full Database Backup
```bash
# Export compressed binary custom-format dump
pg_dump -Fc -v --no-owner --no-privileges -d "$DATABASE_URL" -f "dsa_tracker_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### Restoring Database from Backup
```bash
# 1. Terminate active backend connections to target database
psql "$DATABASE_URL" -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = current_database() AND pid <> pg_backend_pid();
"

# 2. Restore schema and data using pg_restore
pg_restore -v --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" "dsa_tracker_backup_YYYYMMDD_HHMMSS.dump"

# 3. Verify migration status after restore
cd backend
npx prisma migrate status
```

---

## 5. Toggling Runtime Feature Flags

Parked features (`PvP`, `The Arena`, `AI Mock Interviews`) and showpiece visualizers (`AlgoTracer`) can be toggled without changing application code.

### Configuration via Environment Variables
Set the desired boolean flag in `backend/.env`:

```bash
# Enable PvP Multiplayer Mode
FEATURE_PVP=true

# Enable Timed Arena Challenges
FEATURE_ARENA=true

# Enable AI Mock Technical Interviews
FEATURE_INTERVIEWS=true

# Disable AlgoTracer Visualizer
FEATURE_ALGOTRACER=false
```

### Applying Changes
Restart the backend service:
```bash
pm2 restart backend
```
The frontend dynamically queries `/api/features` in its dashboard server layout and updates client navigation, hotkeys, and route accessibility immediately without requiring a frontend rebuild.
