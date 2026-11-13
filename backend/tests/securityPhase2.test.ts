import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { SignJWT } from "jose";
import jwt from "jsonwebtoken";
import { app } from "../app";
import { prisma } from "../db/prisma";
import {
  generateDeviceToken,
  hashDeviceToken,
} from "../middlewares/extensionAuth";
import { BACKEND_JWT_SECRET } from "../middlewares/auth";

const TEST_SECRET =
  BACKEND_JWT_SECRET ||
  "development-backend-jwt-secret-at-least-32-bytes-long";

const createValidJwt = async (payload: { sub: string; email: string; role?: string }) => {
  const key = new TextEncoder().encode(TEST_SECRET);
  return new SignJWT({
    sub: payload.sub,
    email: payload.email,
    role: payload.role || "USER",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("dsa-web")
    .setAudience("dsa-api")
    .setExpirationTime("10m")
    .sign(key);
};

describe("Phase 2: Security & Extension Hardening Suite", () => {
  const userA = { id: "user-sec-a", email: "user_a@sec.test", role: "USER" };
  const userB = { id: "user-sec-b", email: "user_b@sec.test", role: "USER" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. Extension Pairing Token Tests
  // =========================================================================
  describe("Pairing Tokens (replace cookie-hash identity)", () => {
    it("tokens are stored as SHA-256 hashes at rest and plaintext starts with dsat_", () => {
      const { plaintext, tokenHash, tokenPrefix } = generateDeviceToken();
      expect(plaintext.startsWith("dsat_")).toBe(true);
      expect(plaintext.length).toBeGreaterThan(40);
      expect(tokenPrefix).toBe(plaintext.slice(0, 10));

      const recomputed = hashDeviceToken(plaintext);
      expect(tokenHash).toBe(recomputed);
      expect(tokenHash).not.toBe(plaintext);
      expect(tokenHash).toHaveLength(64); // SHA-256 hex string
    });

    it("unknown pairing token returns generic 401 without detail leaks", async () => {
      const fakeToken = "dsat_nonexistent_token_0123456789abcdef0123456789";
      vi.spyOn(prisma.extensionDevice, "findUnique").mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/api/extension/sync")
        .set("Authorization", `Bearer ${fakeToken}`)
        .send({
          submissionId: "sub-1",
          slug: "two-sum",
          verdict: "ACCEPTED",
          submittedAt: new Date().toISOString(),
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Unauthorized" });
    });

    it("revoked device pairing token is rejected with 401", async () => {
      const { plaintext, tokenHash } = generateDeviceToken();
      vi.spyOn(prisma.extensionDevice, "findUnique").mockResolvedValueOnce({
        id: "dev-1",
        userId: userA.id,
        name: "Test Chrome",
        tokenHash,
        tokenPrefix: plaintext.slice(0, 10),
        scopes: ["sync:write"],
        createdAt: new Date(),
        lastUsedAt: null,
        expiresAt: null,
        revokedAt: new Date(Date.now() - 1000), // Already revoked
        user: { id: userA.id, role: userA.role },
      } as any);

      const res = await request(app)
        .post("/api/extension/sync")
        .set("Authorization", `Bearer ${plaintext}`)
        .send({
          submissionId: "sub-1",
          slug: "two-sum",
          verdict: "ACCEPTED",
          submittedAt: new Date().toISOString(),
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Unauthorized" });
    });

    it("expired device pairing token is rejected with 401", async () => {
      const { plaintext, tokenHash } = generateDeviceToken();
      vi.spyOn(prisma.extensionDevice, "findUnique").mockResolvedValueOnce({
        id: "dev-2",
        userId: userA.id,
        name: "Test Chrome Expired",
        tokenHash,
        tokenPrefix: plaintext.slice(0, 10),
        scopes: ["sync:write"],
        createdAt: new Date(Date.now() - 100_000),
        lastUsedAt: null,
        expiresAt: new Date(Date.now() - 1000), // Expired
        revokedAt: null,
        user: { id: userA.id, role: userA.role },
      } as any);

      const res = await request(app)
        .post("/api/extension/sync")
        .set("Authorization", `Bearer ${plaintext}`)
        .send({
          submissionId: "sub-2",
          slug: "two-sum",
          verdict: "ACCEPTED",
          submittedAt: new Date().toISOString(),
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Unauthorized" });
    });

    it("user A cannot revoke user B's device (scope boundary)", async () => {
      const tokenA = await createValidJwt({ sub: userA.id, email: userA.email, role: userA.role });

      vi.spyOn(prisma.user, "upsert").mockResolvedValueOnce(userA as any);
      // User B owns the device, User A attempts to delete it
      vi.spyOn(prisma.extensionDevice, "findFirst").mockResolvedValueOnce(null);

      const res = await request(app)
        .delete("/api/extension/devices/device-of-user-b")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found or not owned by user/i);
    });
  });

  // =========================================================================
  // 2. Backend JWT Validation Tests
  // =========================================================================
  describe("Backend JWT (replace shared NextAuth secret)", () => {
    it("rejects token with wrong audience", async () => {
      const key = new TextEncoder().encode(TEST_SECRET);
      const wrongAudToken = await new SignJWT({ sub: userA.id, email: userA.email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer("dsa-web")
        .setAudience("wrong-audience")
        .setExpirationTime("10m")
        .sign(key);

      const res = await request(app)
        .get("/api/dashboard")
        .set("Authorization", `Bearer ${wrongAudToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Unauthorized/i);
    });

    it("rejects token with wrong issuer", async () => {
      const key = new TextEncoder().encode(TEST_SECRET);
      const wrongIssToken = await new SignJWT({ sub: userA.id, email: userA.email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer("untrusted-issuer")
        .setAudience("dsa-api")
        .setExpirationTime("10m")
        .sign(key);

      const res = await request(app)
        .get("/api/dashboard")
        .set("Authorization", `Bearer ${wrongIssToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Unauthorized/i);
    });

    it("rejects expired token", async () => {
      const key = new TextEncoder().encode(TEST_SECRET);
      const expiredToken = await new SignJWT({ sub: userA.id, email: userA.email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer("dsa-web")
        .setAudience("dsa-api")
        .setExpirationTime("-1s")
        .sign(key);

      const res = await request(app)
        .get("/api/dashboard")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Unauthorized/i);
    });

    it("rejects token signed with alg 'none'", async () => {
      const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
      const payload = Buffer.from(
        JSON.stringify({ sub: userA.id, email: userA.email, iss: "dsa-web", aud: "dsa-api" })
      ).toString("base64url");
      const noneToken = `${header}.${payload}.`;

      const res = await request(app)
        .get("/api/dashboard")
        .set("Authorization", `Bearer ${noneToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Unauthorized/i);
    });

    it("rejects token signed with old NextAuth secret when legacy is disabled", async () => {
      const oldSecretToken = jwt.sign(
        { sub: userA.id, email: userA.email, role: "USER" },
        "old-nextauth-secret-key-12345"
      );

      const originalEnv = process.env.AUTH_ACCEPT_LEGACY;
      process.env.AUTH_ACCEPT_LEGACY = "false";

      try {
        const res = await request(app)
          .get("/api/dashboard")
          .set("Authorization", `Bearer ${oldSecretToken}`);

        expect(res.status).toBe(401);
      } finally {
        process.env.AUTH_ACCEPT_LEGACY = originalEnv;
      }
    });
  });

  // =========================================================================
  // 3. Sync Contract & Idempotency Tests
  // =========================================================================
  describe("Sync Contract (Strict Zod & Idempotency)", () => {
    it("replayed submissionId is idempotent and returns 200 without duplicate writes", async () => {
      const { plaintext, tokenHash } = generateDeviceToken();
      vi.spyOn(prisma.extensionDevice, "findUnique").mockResolvedValue({
        id: "dev-sync",
        userId: userA.id,
        name: "Test Chrome",
        tokenHash,
        tokenPrefix: plaintext.slice(0, 10),
        scopes: ["sync:write"],
        createdAt: new Date(),
        lastUsedAt: null,
        expiresAt: null,
        revokedAt: null,
        user: { id: userA.id, role: userA.role },
      } as any);

      // Return existing receipt
      vi.spyOn(prisma.syncReceipt, "findUnique").mockResolvedValueOnce({
        id: "receipt-1",
        userId: userA.id,
        submissionId: "sub-12345",
        slug: "two-sum",
        verdict: "ACCEPTED",
        syncedAt: new Date(),
      } as any);

      const res = await request(app)
        .post("/api/extension/sync")
        .set("Authorization", `Bearer ${plaintext}`)
        .send({
          submissionId: "sub-12345",
          slug: "two-sum",
          verdict: "ACCEPTED",
          submittedAt: new Date().toISOString(),
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "already_synced",
        submissionId: "sub-12345",
        idempotent: true,
      });
    });

    it("rejects sync request containing extra unexpected fields (strict schema)", async () => {
      const { plaintext, tokenHash } = generateDeviceToken();
      vi.spyOn(prisma.extensionDevice, "findUnique").mockResolvedValue({
        id: "dev-sync-2",
        userId: userA.id,
        name: "Test Chrome",
        tokenHash,
        tokenPrefix: plaintext.slice(0, 10),
        scopes: ["sync:write"],
        createdAt: new Date(),
        lastUsedAt: null,
        expiresAt: null,
        revokedAt: null,
        user: { id: userA.id, role: userA.role },
      } as any);

      const res = await request(app)
        .post("/api/extension/sync")
        .set("Authorization", `Bearer ${plaintext}`)
        .send({
          submissionId: "sub-999",
          slug: "two-sum",
          verdict: "ACCEPTED",
          submittedAt: new Date().toISOString(),
          injectedField: "malicious_payload", // Not allowed by .strict()
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid sync submission payload/i);
    });

    it("non-ACCEPTED verdict does not mark Progress DONE and creates ATTEMPTED event", async () => {
      const { plaintext, tokenHash } = generateDeviceToken();
      vi.spyOn(prisma.extensionDevice, "findUnique").mockResolvedValue({
        id: "dev-sync-3",
        userId: userA.id,
        name: "Test Chrome",
        tokenHash,
        tokenPrefix: plaintext.slice(0, 10),
        scopes: ["sync:write"],
        createdAt: new Date(),
        lastUsedAt: null,
        expiresAt: null,
        revokedAt: null,
        user: { id: userA.id, role: userA.role },
      } as any);

      vi.spyOn(prisma.syncReceipt, "findUnique").mockResolvedValueOnce(null);
      vi.spyOn(prisma.problem, "findFirst").mockResolvedValueOnce({
        id: "prob-1",
        titleSlug: "two-sum",
        title: "Two Sum",
        difficulty: "EASY",
      } as any);

      let createdReceipt: any = null;
      let createdActivity: any = null;
      let progressUpdated = false;

      vi.spyOn(prisma, "$transaction").mockImplementationOnce(async (fn: any) => {
        const tx = {
          syncReceipt: {
            create: vi.fn().mockImplementation((args) => {
              createdReceipt = args.data;
              return args.data;
            }),
          },
          progress: {
            upsert: vi.fn().mockImplementation(() => {
              progressUpdated = true;
            }),
          },
          activityEvent: {
            create: vi.fn().mockImplementation((args) => {
              createdActivity = args.data;
              return args.data;
            }),
          },
        };
        return fn(tx);
      });

      const res = await request(app)
        .post("/api/extension/sync")
        .set("Authorization", `Bearer ${plaintext}`)
        .send({
          submissionId: "sub-wa-1",
          slug: "two-sum",
          verdict: "WRONG_ANSWER",
          submittedAt: new Date().toISOString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("attempted");
      expect(progressUpdated).toBe(false); // Must NOT mark Progress DONE!
      expect(createdActivity.type).toBe("ATTEMPTED");
      expect(createdReceipt.verdict).toBe("WRONG_ANSWER");
    });
  });

  // =========================================================================
  // 4. IDOR Protection Tests
  // =========================================================================
  describe("IDOR Protection", () => {
    it("User A cannot read or modify User B's notes", async () => {
      const tokenA = await createValidJwt({ sub: userA.id, email: userA.email, role: userA.role });
      vi.spyOn(prisma.user, "upsert").mockResolvedValue(userA as any);

      // Notes are queried with { id: noteId, userId: req.user!.id }
      const findManySpy = vi.spyOn(prisma.problemNote, "findMany").mockResolvedValueOnce([]);

      const res = await request(app)
        .get("/api/notes/problem-123")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: userA.id, // Scoped to User A, never leaks User B
          }),
        }),
      );
    });

    it("User A cannot modify User B's device", async () => {
      const tokenA = await createValidJwt({ sub: userA.id, email: userA.email, role: userA.role });
      vi.spyOn(prisma.user, "upsert").mockResolvedValue(userA as any);
      vi.spyOn(prisma.extensionDevice, "findFirst").mockResolvedValueOnce(null);

      const res = await request(app)
        .delete("/api/extension/devices/b-device-id")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(404);
    });
  });

  // =========================================================================
  // 5. Logging Redaction Tests
  // =========================================================================
  describe("Logging Redaction (No Tokens or Authorization Headers in Logs)", () => {
    it("asserts that no log line outputs raw token or Authorization secret", async () => {
      const sensitiveToken = "dsat_sensitive_pairing_secret_1234567890abcdef";
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await request(app)
        .post("/api/extension/sync")
        .set("Authorization", `Bearer ${sensitiveToken}`)
        .send({
          submissionId: "sub-redact-1",
          slug: "two-sum",
          verdict: "ACCEPTED",
          submittedAt: new Date().toISOString(),
        });

      const allCalls = [
        ...consoleLogSpy.mock.calls,
        ...consoleWarnSpy.mock.calls,
        ...consoleErrorSpy.mock.calls,
      ].flat().map(String).join(" ");

      expect(allCalls).not.toContain(sensitiveToken);
      expect(allCalls).not.toContain("Bearer dsat_");
    });
  });
});
