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
