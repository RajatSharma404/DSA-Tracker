import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { randomUUID } from "crypto";
import { generalApiLimiter } from "./middlewares/rateLimiter";
import { logger } from "./utils/logger";

import dashboardRoutes from "./routes/dashboard.routes";
import statsRoutes from "./routes/stats.routes";
import topicsRoutes from "./routes/topics.routes";
import problemsRoutes from "./routes/problems.routes";
import progressRoutes from "./routes/progress.routes";
import learnRoutes from "./routes/learn.routes";
import adminRoutes from "./routes/admin.routes";
import interviewsRoutes from "./routes/interviews.routes";
import analyticsRoutes from "./routes/analytics.routes";
import userRoutes from "./routes/user.routes";
import leetcodeRoutes from "./routes/leetcode.routes";
import extensionRoutes from "./routes/extension.routes";
import challengesRoutes from "./routes/challenges.routes";
import aiRoutes from "./routes/ai.routes";
import vaultRoutes from "./routes/vault.routes";
import notesRoutes from "./routes/notes.routes";
import solutionsRoutes from "./routes/solutions.routes";
import bookmarksRoutes from "./routes/bookmarks.routes";
import tagsRoutes from "./routes/tags.routes";
import searchRoutes from "./routes/search.routes";
import reviewQueueRoutes from "./routes/reviewQueue.routes";
import miscRoutes from "./routes/misc.routes";
import featuresRoutes from "./routes/features.routes";
import roadmapsRoutes from "./routes/roadmaps.routes";
import { requireFeature } from "./middlewares/featureGate";

dotenv.config();

export function createApp(): Express {
  const app = express();

  // Behind Render's (or any single) reverse proxy, use the client IP from
  // X-Forwarded-For; otherwise every user shares one rate-limit bucket.
  if (process.env.NODE_ENV === "production" || process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
  }

  const defaultDevOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3005",
    "http://127.0.0.1:3005",
  ];

  const configuredCorsOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedOrigins =
    configuredCorsOrigins.length > 0
      ? configuredCorsOrigins
      : process.env.NODE_ENV === "production"
        ? []
        : defaultDevOrigins;

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", ...allowedOrigins],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, tests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }),
  );

  // 3. Mount baseline API rate limiter before body parsing to mitigate DoS
  app.use("/api", generalApiLimiter);

  // 4. JSON body parser with strict 100kb payload bounding
  app.use(express.json({ limit: "100kb" }));

  // 5. Request logger (pino + request ID tracking)
  app.use((req, res, next) => {
    const reqId = (req.headers["x-request-id"] as string) || randomUUID();
    res.setHeader("X-Request-Id", reqId);
    const start = performance.now();

    res.on("finish", () => {
      const duration = Math.round(performance.now() - start);
      logger.info({
        reqId,
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        duration,
        hasAuth: Boolean(req.headers.authorization),
      });
    });

    next();
  });

  // Mount API routers
  app.use("/api", featuresRoutes);
  app.use("/api", roadmapsRoutes);
  app.use("/api", dashboardRoutes);
  app.use("/api", statsRoutes);
  app.use("/api", topicsRoutes);
  app.use("/api", problemsRoutes);
  app.use("/api", progressRoutes);
  app.use("/api", learnRoutes);
  app.use("/api", adminRoutes);
  app.use("/api/interviews", requireFeature("interviews"));
  app.use("/api", interviewsRoutes);
  app.use("/api", analyticsRoutes);
  app.use("/api", userRoutes);
  app.use("/api", leetcodeRoutes);
  app.use("/api", extensionRoutes);
  app.use("/api/challenges", requireFeature("arena"));
  app.use("/api", challengesRoutes);
  app.use("/api", aiRoutes);
  app.use("/api", vaultRoutes);
  app.use("/api", notesRoutes);
  app.use("/api", solutionsRoutes);
  app.use("/api", bookmarksRoutes);
  app.use("/api", tagsRoutes);
  app.use("/api", searchRoutes);
  app.use("/api", reviewQueueRoutes);
  app.use("/api", miscRoutes);

  // [NEW OPTIMIZED LOGIC: LIGHTWEIGHT KEEP-ALIVE PING TO PREVENT COLD STARTS]
  app.get("/api/ping", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.json({ status: "alive", timestamp: Date.now() });
  });

  // Root & Health check
  app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "DSA Tracker API is running" });
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "healthy" });
  });

  // 404 handler for unmatched API routes
  app.use("/api", (_req, res) => {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Endpoint not found",
      },
    });
  });

  // Centralized error-handling middleware returning consistent { error: { code, message } }
  app.use(
    (
      err: Error & { status?: number; statusCode?: number; code?: string },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      const statusCode =
        typeof err?.status === "number" && err.status >= 400 && err.status < 600
          ? err.status
          : typeof err?.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 600
            ? err.statusCode
            : 500;

      const code =
        typeof err?.code === "string"
          ? err.code
          : statusCode === 404
            ? "NOT_FOUND"
            : statusCode === 400
              ? "BAD_REQUEST"
              : "INTERNAL_SERVER_ERROR";

      const message =
        process.env.NODE_ENV === "production" && statusCode === 500
          ? "Internal server error"
          : err?.message || "Internal server error";

      logger.error({ err, code, statusCode }, "[Unhandled Error]");

      res.status(statusCode).json({
        error: {
          code,
          message,
        },
      });
    },
  );

  return app;
}

export const app = createApp();
export default app;
