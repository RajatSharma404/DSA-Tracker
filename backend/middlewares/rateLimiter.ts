import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request, Response } from "express";
import { createHash } from "node:crypto";
import { jwtVerify } from "jose";

/**
 * Who a request counts against. In production every request arrives through
 * the Next.js proxy, so many users share a few proxy IPs; keying by IP alone
 * would make them share one limit. Signed-in requests are keyed by user,
 * extension requests by device token, and only anonymous ones by IP.
 */
export async function clientKey(req: Request): Promise<string> {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    if (token.startsWith("dsat_")) {
      return `device:${createHash("sha256").update(token).digest("hex").slice(0, 24)}`;
    }
    const secret = process.env.BACKEND_JWT_SECRET;
    if (secret && secret.length >= 32) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
          algorithms: ["HS256"],
          issuer: "dsa-web",
          audience: "dsa-api",
        });
        const id = typeof payload.sub === "string" ? payload.sub : payload.email;
        if (typeof id === "string" && id) return `user:${id}`;
      } catch {
        // fall through to IP
      }
    }
  }
  return `ip:${ipKeyGenerator(req.ip || "unknown")}`;
}

/**
 * Rate limiter for the public Chrome Extension sync endpoint.
 * Protects against brute-force, scraping, and DoS attacks.
 */
export const extensionSyncLimiter = rateLimit({
  keyGenerator: clientKey,
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "test" ? 100 : 30, // 30 requests per minute per client (relaxed in test)
  standardHeaders: true, // Return standard RateLimit headers
  legacyHeaders: false, // Disable X-RateLimit-* legacy headers
  message: {
    error: "Too many extension sync requests. Please wait a moment and try again.",
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many extension sync requests. Please wait a moment and try again.",
    });
  },
});

/**
 * General API rate limiter for non-authenticated endpoints.
 */
export const generalApiLimiter = rateLimit({
  keyGenerator: clientKey,
  windowMs: 15 * 60 * 1000, // 15 minutes
  // A single dashboard visit makes ~10 requests; 200 was exhausted by normal use.
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later.",
  },
});

/**
 * Rate limiter for AI endpoints (hints, code reviews, algorithm tracing).
 * Protects against API quota exhaustion and runaway billing.
 */
export const aiRateLimiter = rateLimit({
  keyGenerator: clientKey,
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "test" ? 1000 : 20, // 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many AI requests. Please wait a moment before requesting more hints or reviews.",
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many AI requests. Please wait a moment before requesting more hints or reviews.",
    });
  },
});

/**
 * Per-device rate limiter for authenticated Extension Sync requests.
 */
export const deviceSyncLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "test" ? 1000 : 60, // 60 requests per minute per device
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req: Request) => req.extensionDevice?.id || req.ip || "unknown",
  message: {
    error: "Too many extension sync requests from this device. Please wait a moment and try again.",
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many extension sync requests from this device. Please wait a moment and try again.",
    });
  },
});

