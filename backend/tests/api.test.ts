import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../app";
import { formatDatabaseUrlWithPoolConfig } from "../db/prisma";
import { userCache, invalidateUserCache, clearUserCache } from "../middlewares/auth";
import { maskSecret, encryptSecret, decryptSecret } from "../utils/encryption";

describe("Express App Routing & Middleware Integration", () => {
  it("GET / should return 200 and running status", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      message: "DSA Tracker API is running",
    });
  });

  it("GET /health should return 200 and healthy", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "healthy" });
  });

  it("GET /api/dashboard should require authentication", async () => {
    const res = await request(app).get("/api/dashboard");
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Unauthorized/i);
  });

  it("GET /api/dashboard/bootstrap should require authentication", async () => {
    const res = await request(app).get("/api/dashboard/bootstrap");
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Unauthorized/i);
  });

  it("GET /api/stats/streak should require authentication", async () => {
    const res = await request(app).get("/api/stats/streak");
    expect(res.status).toBe(401);
  });

  it("POST /api/progress should reject unauthenticated requests", async () => {
    const res = await request(app)
      .post("/api/progress")
      .send({ problemId: "test-id", status: "DONE" });
    expect(res.status).toBe(401);
  });

  it("GET /api/admin/users should reject unauthenticated requests", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
  });

  it("POST /api/extension/sync should reject request with missing parameters", async () => {
    const res = await request(app)
      .post("/api/extension/sync")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing problemSlug or session");
  });

  it("should enforce Helmet security headers on responses", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["cross-origin-resource-policy"]).toBe("cross-origin");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("Database Connection Pooling & Health", () => {
  it("formatDatabaseUrlWithPoolConfig should inject connection pooling defaults", () => {
    const rawUrl = "postgresql://user:pass@localhost:5432/testdb";
    const configured = formatDatabaseUrlWithPoolConfig(rawUrl);

    expect(configured).toBeDefined();
    expect(configured).toContain("connection_limit=20");
    expect(configured).toContain("pool_timeout=10");
    expect(configured).toContain("connect_timeout=5");
  });

  it("formatDatabaseUrlWithPoolConfig should preserve custom connection pooling params", () => {
    const customUrl =
      "postgresql://user:pass@localhost:5432/testdb?connection_limit=50&pool_timeout=30";
    const configured = formatDatabaseUrlWithPoolConfig(customUrl);

    expect(configured).toContain("connection_limit=50");
    expect(configured).toContain("pool_timeout=30");
    expect(configured).toContain("connect_timeout=5");
  });

  it("formatDatabaseUrlWithPoolConfig should safely handle undefined or non-postgres URLs", () => {
    expect(formatDatabaseUrlWithPoolConfig(undefined)).toBeUndefined();
    expect(formatDatabaseUrlWithPoolConfig("file:./dev.db")).toBe("file:./dev.db");
  });
});

describe("User Authentication Cache Invalidation", () => {
  it("userCache should store user and allow invalidation by email", () => {
    clearUserCache();
    userCache.set("alice@example.com", {
      id: "user-123",
      email: "alice@example.com",
      role: "USER",
    });

    expect(userCache.get("alice@example.com")).toBeDefined();
    expect(userCache.get("alice@example.com")?.role).toBe("USER");

    // Invalidate by email
    invalidateUserCache("alice@example.com");
    expect(userCache.get("alice@example.com")).toBeUndefined();
  });

  it("clearUserCache should purge all cached users", () => {
    userCache.set("bob@example.com", {
      id: "user-456",
      email: "bob@example.com",
      role: "ADMIN",
    });
    expect(userCache.size()).toBeGreaterThan(0);

    clearUserCache();
    expect(userCache.size()).toBe(0);
  });
});

describe("Security & Secret Masking", () => {
  it("maskSecret should mask sensitive session cookies", () => {
    const secret = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.session-token-9876";
    const masked = maskSecret(secret);
    expect(masked).toBe("••••••••••••••••9876");
    expect(masked).not.toContain("eyJhbGci");
  });

  it("encryptSecret and decryptSecret should protect secrets with AES-256-GCM", () => {
    const raw = "secret_leetcode_session_cookie_12345";
    const encrypted = encryptSecret(raw);

    expect(encrypted.startsWith("enc:v1:")).toBe(true);
    expect(encrypted).not.toContain(raw);
    expect(decryptSecret(encrypted)).toBe(raw);
  });
});

describe("Rate Limiting Middleware", () => {
  it("POST /api/extension/sync should return standard RateLimit headers", async () => {
    const res = await request(app)
      .post("/api/extension/sync")
      .send({});
    expect(res.headers).toHaveProperty("ratelimit-limit");
    expect(res.headers).toHaveProperty("ratelimit-remaining");
  });
});



