# Troubleshooting

This runbook lists common local and deployment issues with probable causes and fixes.

## Backend fails on startup with secret error

Symptom:

- backend exits with message that `NEXTAUTH_SECRET` or `AUTH_SECRET` is required

Fix:

- set one or both values in backend env
- ensure frontend uses same effective secret for token issuance

## Login succeeds but API returns 401

Symptom:

- frontend loads but protected API calls fail unauthorized

Probable causes:

- frontend and backend secrets do not match
- stale session token after env change

Fix:

1. align `NEXTAUTH_SECRET`/`AUTH_SECRET` across frontend and backend
2. sign out and sign in again
3. clear browser session cookies if needed

## Frontend can open login but dashboard data fails

Symptom:

- dashboard shows data load failure

Probable causes:

- backend not running
- rewrite target misconfigured
- CORS origin mismatch (when bypassing proxy)

Fix:

1. check backend health at `/health`
2. verify `BACKEND_URL` in frontend env
3. verify backend `CORS_ORIGINS`

## Prisma build/generate lock errors on Windows

Symptom:

- build fails with engine lock or EPERM style file lock

Fix:

1. stop running Node processes using Prisma binaries
2. remove generated Prisma engine folder under node_modules
3. rerun install/build

## Frontend dev server lock or stale cache behavior

Symptom:

- Next.js dev server fails due to lock file or stale output

Fix:

1. stop dev server
2. remove `.next` cache/lock artifacts
3. restart `npm run dev`

## Extension sync does not trigger

Symptom:

- accepted LeetCode submissions are not reflected in app

Checks:

1. extension is enabled in browser
2. LeetCode session cookie exists and is current
3. extension host permission includes your API base
4. extension has valid API base config (`dsaApiBaseUrl` or `dsaApiBaseUrls`)

Fix:

- refresh LeetCode login session
- reload extension and page
- verify backend endpoint `/api/extension/sync` is reachable

## Google login not visible

Symptom:

- only credentials/no provider option appears

Cause:

- Google provider is disabled when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are missing

Fix:

- set both values in frontend env and restart frontend

## Insecure credentials login unexpectedly disabled

Symptom:

- credentials form does not authorize

Cause:

- `ALLOW_INSECURE_CREDENTIALS_LOGIN` is false by default

Fix:

- set this variable to true only for controlled development contexts

## Admin actions return forbidden

Symptom:

- topic/problem/user management endpoints fail authorization

Cause:

- current user role is not `ADMIN`

Fix:

- set `ADMIN_EMAIL` in backend env
- sign in with matching email and reissue token

## Deployment-specific route issues

Symptom:

- `/api/auth/*` works but business API routes fail

Cause:

- frontend rewrite destination for backend is wrong

Fix:

- verify frontend `BACKEND_URL` and backend public URL
- ensure backend route base remains `/api`

## Diagnostic checklist

Run these quick checks in order:

1. DB running (`docker compose ps`)
2. backend health reachable
3. frontend running and serving login
4. shared secret parity across services
5. one protected endpoint call succeeds
6. one write endpoint call succeeds
