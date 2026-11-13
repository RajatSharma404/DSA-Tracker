# 2-Minute Portfolio Video & Live Demo Walkthrough Script

This script provides an exact, shot-by-shot outline for recording a high-impact 2-minute video demo or delivering an engineering portfolio presentation of **DSA Tracker Pro**.

---

## Preparation & Setup

1. **Reset Test Database to Deterministic State:**
   ```bash
   node scripts/run-seed-e2e.mjs --reset
   ```
2. **Start Dev Servers:**
   ```bash
   npm run dev
   ```
3. **Open Browser:**
   Navigate to `http://localhost:3005/login` in fullscreen 1080p.
4. **Test Account Credentials:**
   - **Email:** `testuser@dsatracker.local`
   - **Password:** `Password123!`

---

## Shot-by-Shot Timeline (120 Seconds)

### Shot 1: The Hook & Unified Dashboard (0:00 - 0:25)
- **Visual:**
  - Login as `testuser@dsatracker.local`.
  - Land on `/` (Dashboard).
  - Hover over the 365-day SVG activity heatmap, due review badge (`3 Cards Due`), and weak topic alerts.
- **Spoken Audio:**
  > "Most developers grinding LeetCode suffer from the forgetting curve: they solve 200 problems, but forget the core insights three weeks later.
  >
  > Welcome to **DSA Tracker Pro**, an engineering platform combining the **Free Spaced Repetition Scheduler (FSRS v6)** with automated LeetCode synchronization and local-first offline review."
- **Actions:**
  - Highlight the FSRS review counter.
  - Click **Start Daily Review** button.

---

### Shot 2: Active Recall & FSRS Flashcard Engine (0:25 - 0:50)
- **Visual:**
  - Land on `/flashcards`.
  - Display card: *Two Sum* / *Add Two Numbers*.
  - Press `Space` to flip card, revealing solution approach, time/space complexity, and invariant gotchas.
  - Rate with `3` (`Good`). Notice the smooth card transition and remaining card stepper (`Card 2 of 3`).
- **Spoken Audio:**
  > "Instead of simple timers, DSA Tracker Pro implements FSRS v6. Each review records multidimensional memory metrics—stability, difficulty, and lapses—in an atomic database transaction.
  >
  > Everything is accessible via standard WCAG 2.1 AA keyboard navigation: space to flip, one to four to rate."

---

### Shot 3: Local-First Offline Resilience (0:50 - 1:15)
- **Visual:**
  - Open Chrome DevTools (`F12`), switch to **Network** tab, toggle **Offline**.
  - Rate the next card `Easy` (`4`).
  - An amber banner appears: *"Offline Mode: 1 review queued in local outbox"*. The queue decrements optimistically.
  - In DevTools, toggle back to **Online**.
  - The banner turns green: *"Synced 1 offline review to server"*.
- **Spoken Audio:**
  > "Studying on a subway or spotty Wi-Fi? Our local-first IndexedDB outbox queues reviews locally and updates UI state optimistically.
  >
  > Once connectivity returns, it flushes the queue using idempotent client event IDs, ensuring zero data loss and zero duplicate calculations."

---

### Shot 4: Chrome Extension & Sub-10ms Bulk Sync (1:15 - 1:40)
- **Visual:**
  - Navigate to `/settings` or `/extension`.
  - Show the paired extension device card.
  - Open the Chrome Extension popup, click **Sync Submissions**.
  - Show instant sync confirmation.
- **Spoken Audio:**
  > "No manual logging required. Our Manifest V3 Chrome Extension detects accepted LeetCode submissions directly from the DOM.
  >
  > Security is paramount: the extension never reads cookies or session tokens. It authenticates using cryptographically scoped `dsat_` pairing tokens, syncing 100 submissions in under 10 milliseconds via preloaded bulk queries."

---

### Shot 5: AlgoTracer & Engineering Wrap-up (1:40 - 2:00)
- **Visual:**
  - Navigate to `/tracer` (AlgoTracer Showpiece).
  - Click **Step Forward** on an active pointer traversal (Two Pointers / Fast & Slow Pointer).
  - Show variables and AST highlight updating in sync.
- **Spoken Audio:**
  > "We also built AlgoTracer 2.0, an interactive AST-driven code visualizer that steps through algorithmic memory pointers in real time.
  >
  > With 402 passing Vitest unit tests, 45 automated Playwright E2E runs, sub-millisecond database queries, and zero flakiness, DSA Tracker Pro is built to production standards.
  >
  > Explore the full source code and documentation on GitHub."

