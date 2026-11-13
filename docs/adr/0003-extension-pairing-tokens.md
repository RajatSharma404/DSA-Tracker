# ADR 0003: Chrome Extension Pairing Tokens

- **Status:** Accepted
- **Date:** 2026-11-11
- **Deciders:** Engineering Team

---

## Context
The Manifest V3 Chrome extension previously extracted the developer's raw `LEETCODE_SESSION` cookie from browser storage and transmitted either the plaintext session or its SHA-256 hash to `/api/extension/sync`. This architecture posed severe security risks: it required wide `cookies` permissions across `https://*.leetcode.com/*`, exposed sensitive session tokens over network requests, and provided no mechanism for users to audit, restrict, or revoke extension access.

## Decision
We eliminated cookie-based authentication in favor of cryptographically secure pairing tokens:
1. **Pairing Token Generation:** Users generate device tokens within the Web UI (`/settings` or `/extension`). The backend mints `dsat_` + 32 cryptographically random bytes via `crypto.randomBytes(32)` (base64url).
2. **One-Way Storage:** Only the SHA-256 hash of the token is saved in the `ExtensionDevice` table alongside user ID, friendly device name, allowed scopes (`sync:write`), and timestamps.
3. **Client-Side Storage:** The extension prompts the user to enter the token once during initial setup and persists it securely in `chrome.storage.local`.
4. **Least-Privilege Extension:** Removed the `cookies` permission entirely from `extension/manifest.json`. The extension only reads public DOM submission statuses on LeetCode problem pages.
5. **Revocation & Scopes:** Users can audit active devices and revoke access immediately from the dashboard.

## Alternatives Considered
- **OAuth 2.0 PKCE Flow:** Overly complex for a local browser extension utility without substantial usability benefit over single-click pairing tokens.
- **Permanent User API Keys:** Lacks per-device labeling and granular revocation capabilities.

## Consequences
- **Positive:** Chrome extension never reads or transmits sensitive LeetCode cookies; zero permission warnings on install; instant token revocation from web UI.
- **Negative / Trade-offs:** Requires an initial manual copy-paste step by the user during extension setup.

## Implementation Files
- [backend/routes/extension.routes.ts](../../backend/routes/extension.routes.ts)
- [backend/middlewares/extensionAuth.ts](../../backend/middlewares/extensionAuth.ts)
- [extension/manifest.json](../../extension/manifest.json)
- [extension/background.js](../../extension/background.js)
- [extension/popup.js](../../extension/popup.js)
- [frontend/src/app/(dashboard)/extension/page.tsx](<../../frontend/src/app/(dashboard)/extension/page.tsx>)
