# Environment Variables Reference

This matrix is derived from current code usage in backend and frontend.

## Backend Variables

Defined/used primarily in `backend/index.ts`.

| Variable             | Required | Example                        | Purpose                                                      |
| -------------------- | -------- | ------------------------------ | ------------------------------------------------------------ |
| `PORT`               | No       | `3001`                         | Backend listening port. Defaults to `3001`.                  |
| `NODE_ENV`           | No       | `development`                  | Runtime mode, influences logs and behavior.                  |
| `DATABASE_URL`       | Yes      | `postgresql://...`             | Prisma database connection string.                           |
| `NEXTAUTH_SECRET`    | Yes\*    | long random string             | JWT verification/signing secret shared with frontend auth.   |
| `AUTH_SECRET`        | Yes\*    | same as `NEXTAUTH_SECRET`      | Fallback secret; one of the two must be present.             |
| `CORS_ORIGINS`       | No       | `http://localhost:3000`        | Comma-separated allowed origins when CORS is configured.     |
| `ADMIN_EMAIL`        | No       | `admin@example.com`            | Auto-promote this email to admin on backend user resolution. |
| `LOGIN_NOTIFY_EMAIL` | No       | `ops@example.com`              | Destination email for login alerts.                          |
| `SMTP_HOST`          | No       | `smtp.gmail.com`               | SMTP host for login notifications.                           |
| `SMTP_PORT`          | No       | `587`                          | SMTP port, defaults to `587`.                                |
| `SMTP_USER`          | No       | account                        | SMTP username.                                               |
| `SMTP_PASS`          | No       | app-password                   | SMTP password or app token.                                  |
| `NOTIFY_FROM`        | No       | `DSA Tracker <no-reply@x.com>` | Sender value for notification email.                         |

`NEXTAUTH_SECRET` or `AUTH_SECRET` is mandatory. Backend throws on startup if neither is defined.

## Frontend Variables

Used in `frontend/next.config.ts`, auth route, and client API layer.

| Variable                                       | Required           | Example                   | Purpose                                                                |
| ---------------------------------------------- | ------------------ | ------------------------- | ---------------------------------------------------------------------- |
| `NODE_ENV`                                     | No                 | `development`             | Build/runtime mode toggles debug behavior.                             |
| `DATABASE_URL`                                 | Conditional        | `postgresql://...`        | Required only when frontend NextAuth path needs Prisma DB access.      |
| `NEXTAUTH_URL`                                 | Yes                | `http://localhost:3000`   | Public base URL for NextAuth callback/session handling.                |
| `NEXTAUTH_SECRET`                              | Yes\*              | long random string        | Primary auth secret for token signing in NextAuth route.               |
| `AUTH_SECRET`                                  | Yes\*              | same as above             | Fallback auth secret if `NEXTAUTH_SECRET` not set.                     |
| `GOOGLE_CLIENT_ID`                             | Optional           | OAuth client id           | Enables Google provider when paired with client secret.                |
| `GOOGLE_CLIENT_SECRET`                         | Optional           | OAuth secret              | Enables Google provider when paired with client id.                    |
| `ALLOW_INSECURE_CREDENTIALS_LOGIN`             | No (default false) | `false`                   | Enables legacy credentials login flow when explicitly true.            |
| `BACKEND_URL`                                  | Recommended        | `http://localhost:3001`   | Rewrite destination base for backend API routing.                      |
| `NEXT_PUBLIC_API_URL`                          | Optional fallback  | `https://api.example.com` | Public API base used in fallback/forced-remote client behavior.        |
| `NEXT_PUBLIC_FORCE_REMOTE_API`                 | No                 | `false`                   | If true, bypass relative `/api` and target configured public API base. |
| `NEXT_PUBLIC_ALLOW_INSECURE_CREDENTIALS_LOGIN` | No                 | `false`                   | Used by login UI to expose credential mode.                            |
| `NEXT_PUBLIC_EXTENSION_STORE_URL`              | No                 | store URL                 | Optional extension install link target in UI components.               |

`NEXTAUTH_SECRET` or `AUTH_SECRET` is mandatory for auth route; otherwise route returns 500.

## Local Example Pairing

Backend (`backend/.env`):

```env
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
NEXTAUTH_SECRET="same-secret-across-services"
AUTH_SECRET="same-secret-across-services"
CORS_ORIGINS="http://localhost:3000"
```

Frontend (`frontend/.env.local`):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dsatracker?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="same-secret-across-services"
AUTH_SECRET="same-secret-across-services"
BACKEND_URL="http://localhost:3001"
```

## Common Misconfiguration Patterns

- Secret mismatch between frontend and backend causes auth failures on protected API calls.
- Missing `BACKEND_URL` in production can break non-auth API rewrites.
- Enabling insecure credentials login in non-development environments increases auth risk.
- Invalid `CORS_ORIGINS` list blocks browser API calls even with valid tokens.
