/**
 * DSA Tracker Pro Service Worker (Hand-rolled, Turbopack & React 19 compatible)
 * Caching Strategies:
 * - App Shell / Static: Cache-First with Network Fallback
 * - Navigation: Network-First with 3s Timeout -> Offline Fallback (/offline)
 * - Whitelisted API Reads: Stale-While-Revalidate with per-user cache isolation
 * - Sign-out: Cache purge via message channel
 */

const VERSION = "v2";
const STATIC_CACHE = `dsa-static-${VERSION}`;
const API_CACHE = `dsa-api-${VERSION}`;
const NAV_CACHE = `dsa-nav-${VERSION}`;

const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/logo.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable.png",
];

const API_WHITELIST = [
  "/api/review-queue",
  "/api/topics",
  "/api/dashboard/bootstrap",
  "/api/problems",
  "/api/stats",
  "/api/study-plan",
];

const API_BLACKLIST = [
  "/api/auth",
  "/api/ai",
  "/api/extension",
  "/api/backend-token",
  "/api/session",
  "/api/leetcode",
  "/api/challenges",
  "/api/interviews",
];

// Helper: simple hash for Authorization header to isolate user caches
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

// 1. Install Event: Precache Core App Shell (no silent skipWaiting)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }),
  );
});

// 2. Activate Event: Cleanup Stale Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (
              name !== STATIC_CACHE &&
              name !== API_CACHE &&
              name !== NAV_CACHE
            ) {
              return caches.delete(name);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// 3. Message Channel: Listen for user actions (SKIP_WAITING, LOGOUT)
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "LOGOUT" || event.data.type === "CLEAR_API_CACHE") {
    // Purge cached API responses when user signs out or switches account
    event.waitUntil(caches.delete(API_CACHE));
  }
});

// 4. Fetch Event Handler
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-HTTP/HTTPS and cross-origin foreign requests
  if (!request.url.startsWith("http") || url.origin !== self.location.origin) {
    return;
  }

  // 4a. HTML Navigation Requests -> NetworkFirst with 3s timeout
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 4b. API Requests -> Whitelisted StaleWhileRevalidate or NetworkOnly
  if (url.pathname.startsWith("/api/")) {
    if (request.method !== "GET") {
      // Mutations (POST, PUT, DELETE) are strictly NetworkOnly
      return;
    }

    const isBlacklisted = API_BLACKLIST.some(
      (prefix) =>
        url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
    );
    if (isBlacklisted) {
      return;
    }

    const isWhitelisted = API_WHITELIST.some(
      (prefix) =>
        url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
    );
    if (isWhitelisted) {
      event.respondWith(handleWhitelistedApi(request, url));
    }
    return;
  }

  // 4c. Static Assets -> Cache-First with Network fallback
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(handleStaticAsset(request));
  }
});

/**
 * Handle navigation requests: NetworkFirst with 3s timeout -> Cache -> /offline
 */
async function handleNavigation(request) {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Navigation timeout")), 3000),
    );

    const networkResponse = await Promise.race([
      fetch(request),
      timeoutPromise,
    ]);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(NAV_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Network failed or timed out: try cached page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Fall back to offline page
    const offlinePage = await caches.match("/offline");
    return (
      offlinePage ||
      new Response("Offline - Please connect to the internet.", {
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
}

/**
 * Handle Whitelisted API reads: StaleWhileRevalidate keyed per user
 */
async function handleWhitelistedApi(request, url) {
  const authHeader = request.headers.get("authorization") || "anonymous";
  const authKey = hashString(authHeader);
  const userKeyedUrl = `${url.pathname}${url.search}#user=${authKey}`;
  const customKeyRequest = new Request(userKeyedUrl, { method: "GET" });

  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(customKeyRequest);

  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        await cache.put(customKeyRequest, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

/**
 * Handle static assets: Cache-First
 */
async function handleStaticAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.status === 200) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}
