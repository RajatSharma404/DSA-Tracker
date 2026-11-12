# ADR 0002: Backend JWT and Same-Origin Proxy Decoupling

- **Status:** Accepted
- **Date:** 2026-11-11
- **Deciders:** Engineering Team

---

## Context
The Next.js web application previously forwarded raw NextAuth session cookies directly to the Express backend. This created deep architectural coupling: the Express API had to import NextAuth secret keys to decrypt JWE cookies, breaking trust boundaries between frontend session management and backend API services. Additionally, third-party and split deployments could not authenticate without replicating NextAuth internal cookie schemas.

## Decision
We decoupled frontend session management from the backend API using a dedicated token exchange pattern:
1. **Token Minting Endpoint:** Next.js exposes `/api/backend-token`, which verifies the user's active NextAuth session and signs a short-lived (10-minute expiry) HS256 JWT using `BACKEND_JWT_SECRET`.
2. **Client-Side Token Management:** The frontend API client (`lib/api.ts`) retrieves, caches, and automatically refreshes this token, attaching `Authorization: Bearer <jwt>` to outgoing requests.
3. **Same-Origin Proxy:** Next.js proxies `/api/*` (excluding `/api/auth/*` and `/api/backend-token`) to the Express backend, preserving single-origin browser isolation.
4. **Backend Role Cache:** Express validates the HS256 signature and caches the user role in-memory (`USER_CACHE_TTL_MS`, 5 minutes) to avoid redundant database lookups on every HTTP request.

## Alternatives Considered
- **Direct NextAuth JWE Decryption in Express:** Rejected due to tight coupling and security risks of sharing cookie encryption keys across decoupled tiers.
- **Long-Lived Backend API Keys:** Rejected for web browser clients due to excessive blast radius if intercepted.

## Consequences
- **Positive:** Clean security boundary; Express backend has zero knowledge of NextAuth cookie internals; short 10-minute token lifetime minimizes credential exposure.
- **Negative / Trade-offs:** Introduces an initial asynchronous exchange call before the first API request after page load.

## Implementation Files
- [frontend/src/app/api/backend-token/route.ts](../../frontend/src/app/api/backend-token/route.ts)
- [frontend/src/lib/api.ts](../../frontend/src/lib/api.ts)
- [backend/middlewares/auth.ts](../../backend/middlewares/auth.ts)
- [frontend/next.config.ts](../../frontend/next.config.ts)
