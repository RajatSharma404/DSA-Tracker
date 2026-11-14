import { describe, it, expect, beforeAll } from "vitest";
import { SignJWT } from "jose";
import type { Request } from "express";
import { clientKey } from "../middlewares/rateLimiter";

const SECRET = "test-secret-that-is-at-least-32-bytes-long!!";
const req = (authorization?: string, ip = "203.0.113.7") =>
  ({ headers: authorization ? { authorization } : {}, ip }) as unknown as Request;
const sign = (sub: string, secret = SECRET) =>
  new SignJWT({ sub, email: `${sub}@example.com`, role: "USER" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("dsa-web")
    .setAudience("dsa-api")
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(secret));

describe("clientKey (rate-limit bucket)", () => {
  beforeAll(() => {
    process.env.BACKEND_JWT_SECRET = SECRET;
  });

  it("gives two signed-in users behind the same proxy IP separate buckets", async () => {
    const a = await clientKey(req(`Bearer ${await sign("alice")}`));
    const b = await clientKey(req(`Bearer ${await sign("bob")}`));
    expect(a).toBe("user:alice");
    expect(b).toBe("user:bob");
  });

  it("keys extension requests by device token, without exposing it", async () => {
    const key = await clientKey(req("Bearer dsat_" + "x".repeat(40)));
    expect(key).toMatch(/^device:[0-9a-f]{24}$/);
    expect(key).not.toContain("xxxx");
  });

  it("falls back to IP for anonymous or forged tokens", async () => {
    expect(await clientKey(req())).toBe("ip:203.0.113.7");
    const forged = await sign("mallory", "a-different-secret-that-is-32-bytes-long");
    expect(await clientKey(req(`Bearer ${forged}`))).toBe("ip:203.0.113.7");
  });
});
