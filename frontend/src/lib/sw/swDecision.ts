/**
 * Service Worker Cache Decision Engine
 * Pure function determining caching strategies for URLs, HTTP methods, and auth context.
 */

export type CacheDecision =
  | "NAVIGATE"
  | "STATIC_ASSET"
  | "API_STALE_WHILE_REVALIDATE"
  | "NETWORK_ONLY";

export const API_CACHE_WHITELIST = [
  "/api/review-queue",
  "/api/topics",
  "/api/dashboard/bootstrap",
  "/api/problems",
  "/api/stats",
  "/api/study-plan",
] as const;

export const API_CACHE_BLACKLIST = [
  "/api/auth",
  "/api/ai",
  "/api/extension",
  "/api/backend-token",
  "/api/session",
  "/api/leetcode",
  "/api/challenges",
  "/api/interviews",
] as const;

export interface DecisionInput {
  url: string;
  method: string;
  mode?: string;
  destination?: string;
  hasAuth?: boolean;
}

/**
 * Pure evaluation function for service worker request handling.
 */
export function getCacheDecision(input: DecisionInput): CacheDecision {
  const method = (input.method || "GET").toUpperCase();

  // Rule 1: Only GET requests are ever cached; mutations are strictly NETWORK_ONLY
  if (method !== "GET") {
    return "NETWORK_ONLY";
  }

  // Parse path from relative or absolute URL
  let pathname = "";
  try {
    pathname = new URL(input.url, "http://localhost").pathname;
  } catch {
    pathname = input.url.split("?")[0];
  }

  // Rule 2: HTML Navigation requests use NetworkFirst with timeout
  if (input.mode === "navigate") {
    return "NAVIGATE";
  }

  // Rule 3: API Requests
  if (pathname.startsWith("/api/")) {
    // 3a: Explicit Blacklist check (auth, ai, extension, tokens, etc.)
    const isBlacklisted = API_CACHE_BLACKLIST.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    if (isBlacklisted) {
      return "NETWORK_ONLY";
    }

    // 3b: Explicit Whitelist check
    const isWhitelisted = API_CACHE_WHITELIST.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    if (isWhitelisted) {
      return "API_STALE_WHILE_REVALIDATE";
    }

    // Non-whitelisted API calls default to NETWORK_ONLY
    return "NETWORK_ONLY";
  }

  // Rule 4: Static assets (scripts, styles, icons, fonts, public static files)
  if (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/" ||
    pathname === "/offline" ||
    pathname === "/logo.svg" ||
    pathname === "/icon-192.png" ||
    pathname === "/icon-512.png" ||
    pathname === "/icon-maskable.png" ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js")
  ) {
    return "STATIC_ASSET";
  }

  return "NETWORK_ONLY";
}

