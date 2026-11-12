# Security Policy

## 1. Reporting a Vulnerability

The DSA Tracker Pro team takes the security of our platform, user credentials, and spaced repetition data seriously. If you discover a security vulnerability, we appreciate your help in disclosing it to us responsibly.

> [!IMPORTANT]
> **Please do NOT report security vulnerabilities via public GitHub issues.**

Instead, please send an encrypted or direct email detailing the vulnerability to:
- **Security Contact:** `rajat@dsatracker.local` *(or the primary repository maintainer)*
- **Response SLA:** We will acknowledge receipt within **48 hours** and provide a status update on triage and remediation within **5 business days**.

Please include:
- A clear description of the vulnerability and attack vector.
- Step-by-step reproduction instructions or a minimal proof of concept.
- Affected components (Frontend, Express API, Chrome Extension, or Database).
- Any potential impact on user data isolation or credential secrecy.

---

## 2. Supported Versions

Security fixes and patches are applied to the active modernization branch and main repository:

| Branch / Release | Supported |
| :--- | :--- |
| `upgrade/phase-*` (Current Modernization) | :white_check_mark: Supported |
| `main` / `master` | :white_check_mark: Supported |
| `< 1.0.0` (Legacy prototype) | :x: Unsupported |

---

## 3. Security Architecture & Threat Mitigations

### A. Token Model & Tier Decoupling
- **Decoupled Web Sessions:** NextAuth manages interactive session cookies using AES-encrypted HTTP-only cookies. The Express API does not read, parse, or require access to frontend session cookies.
- **Short-Lived Backend JWTs:** Communication between the Next.js client proxy and Express backend is authorized via short-lived (10-minute expiry) HS256 JWTs minted at `/api/backend-token` using `BACKEND_JWT_SECRET` (enforced minimum 32 bytes).
- **Role Validation Caching:** User roles (`ADMIN`, `USER`) are cached in memory with a 5-minute TTL (`USER_CACHE_TTL_MS`), preventing denial-of-service pressure on the database during traffic spikes.

### B. Chrome Extension Least Privilege
- **No Cookie Access:** The Chrome Extension Manifest V3 (`extension/manifest.json`) strictly omits the `cookies` permission. It never reads, stores, or transmits `LEETCODE_SESSION` cookies or any browser session data.
- **Pairing Token Isolation:** Authentication uses dedicated device pairing tokens formatted as `dsat_` + 32 random bytes (`crypto.randomBytes(32)`).
- **One-Way Hash Storage:** The database stores only the SHA-256 hash (`ExtensionDevice.tokenHash`). The raw token is displayed to the user once during pairing and never persisted server-side.
- **Immediate Device Revocation:** Users can audit paired devices in Settings and revoke tokens immediately, setting `revokedAt` and terminating extension sync.

### C. Cryptographic Storage & Key Rotation
- **AES-256-GCM Encryption:** Sensitive integration credentials stored in PostgreSQL are encrypted using AES-256-GCM authenticated encryption with unique 12-byte initialization vectors (IVs) per record.
- **Key Rotation Support:** Encryption utilities support zero-downtime key rotation via `COOKIE_ENCRYPTION_KEY_PREVIOUS`. When present, data is decrypted with the prior key and automatically re-encrypted with the primary key.

### D. Zero Code Execution & AST Sandbox
- **No Eval / Dynamic Execution:** The application does not use `eval()`, `new Function()`, `vm`, or `child_process` execution primitives.
- **Static AST Complexity Heuristics:** Algorithmic code complexity (Big-O analysis) is derived through static Abstract Syntax Tree (AST) inspection via `acorn` and `acorn-walk`, preventing arbitrary server-side code execution.

### E. Rate Limiting & Denial of Service Protection
- **Global Rate Limiter:** Express applies sliding-window IP rate limiting across all incoming requests.
- **AI Quota Tracking:** The `AiUsage` table enforces fine-grained per-user daily limits for hint generation (`AI_DAILY_LIMIT_HINTS`), code reviews (`AI_DAILY_LIMIT_REVIEW`), and study planning (`AI_DAILY_LIMIT_PLAN`).
- **Payload Clamping:** The Express JSON body parser enforces a strict **100kb payload size limit** to prevent memory exhaustion attacks.
- **Log Sanitization:** Sensitive authorization headers (`Authorization`, `cookie`, `set-cookie`, `x-pairing-token`) are automatically redacted by the Pino request logger.
