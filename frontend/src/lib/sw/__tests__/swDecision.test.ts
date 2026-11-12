import { describe, it, expect } from "vitest";
import { getCacheDecision } from "../swDecision";

describe("Phase 4b: Service Worker Caching Decision Engine", () => {
  it("should categorize navigation requests as NAVIGATE", () => {
    expect(
      getCacheDecision({
        url: "/dashboard",
        method: "GET",
        mode: "navigate",
      }),
    ).toBe("NAVIGATE");

    expect(
      getCacheDecision({
        url: "http://localhost:3000/review",
        method: "GET",
        mode: "navigate",
      }),
    ).toBe("NAVIGATE");
  });

  it("should categorize whitelisted GET API requests as API_STALE_WHILE_REVALIDATE", () => {
    const whitelistedUrls = [
      "/api/review-queue",
      "/api/review-queue?sort=due",
      "/api/topics",
      "/api/dashboard/bootstrap",
      "/api/problems",
      "/api/problems/two-sum",
      "/api/stats",
      "/api/study-plan",
    ];

    for (const url of whitelistedUrls) {
      expect(
        getCacheDecision({
          url,
          method: "GET",
        }),
      ).toBe("API_STALE_WHILE_REVALIDATE");
    }
  });

  it("should strictly reject non-GET mutation methods as NETWORK_ONLY", () => {
    const mutations = ["POST", "PUT", "DELETE", "PATCH"];
    for (const method of mutations) {
      expect(
        getCacheDecision({
          url: "/api/review-queue/complete",
          method,
        }),
      ).toBe("NETWORK_ONLY");

      expect(
        getCacheDecision({
          url: "/api/progress",
          method,
        }),
      ).toBe("NETWORK_ONLY");
    }
  });

  it("should reject blacklisted API endpoints as NETWORK_ONLY even with GET", () => {
    const blacklisted = [
      "/api/auth/session",
      "/api/auth/csrf",
      "/api/ai/hint",
      "/api/ai/code-review",
      "/api/extension/sync",
      "/api/extension/devices",
      "/api/backend-token",
      "/api/session/quick",
      "/api/leetcode/profile",
    ];

    for (const url of blacklisted) {
      expect(
        getCacheDecision({
          url,
          method: "GET",
        }),
      ).toBe("NETWORK_ONLY");
    }
  });

  it("should categorize static assets as STATIC_ASSET", () => {
    const staticAssets = [
      "/_next/static/chunks/main.js",
      "/_next/static/css/app.css",
      "/logo.svg",
      "/icon-192.png",
      "/icon-512.png",
      "/icon-maskable.png",
      "/favicon.ico",
      "/offline",
    ];

    for (const url of staticAssets) {
      expect(
        getCacheDecision({
          url,
          method: "GET",
        }),
      ).toBe("STATIC_ASSET");
    }
  });
});

