import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Rate limiter for the public Chrome Extension sync endpoint.
 * Protects against brute-force, scraping, and DoS attacks.
 */
export const extensionSyncLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "test" ? 100 : 30, // 30 requests per minute per IP (relaxed in test)
  standardHeaders: true, // Return standard RateLimit headers
  legacyHeaders: false, // Disable X-RateLimit-* legacy headers
  message: {
    error: "Too many extension sync requests from this IP. Please wait a moment and try again.",
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many extension sync requests from this IP. Please wait a moment and try again.",
    });
  },
});

/**
 * General API rate limiter for non-authenticated endpoints.
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 1000 : 200,
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

