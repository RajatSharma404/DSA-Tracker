import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

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
import cityRoutes from "./routes/city.routes";
import miscRoutes from "./routes/misc.routes";

dotenv.config();

export function createApp(): Express {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  const corsOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors(
      corsOrigins.length > 0
        ? {
            origin: corsOrigins,
            credentials: true,
          }
        : undefined,
    ),
  );

  app.use(express.json());

  // Request logger
  app.use((req, _res, next) => {
    console.log(
      `${req.method} ${req.path} - Auth Header: ${req.headers.authorization ? "Present" : "Missing"}`,
    );
    next();
  });

  // Mount API routers
  app.use("/api", dashboardRoutes);
  app.use("/api", statsRoutes);
  app.use("/api", topicsRoutes);
  app.use("/api", problemsRoutes);
  app.use("/api", progressRoutes);
  app.use("/api", learnRoutes);
  app.use("/api", adminRoutes);
  app.use("/api", interviewsRoutes);
  app.use("/api", analyticsRoutes);
  app.use("/api", userRoutes);
  app.use("/api", leetcodeRoutes);
  app.use("/api", extensionRoutes);
  app.use("/api", challengesRoutes);
  app.use("/api", aiRoutes);
  app.use("/api", vaultRoutes);
  app.use("/api", notesRoutes);
  app.use("/api", solutionsRoutes);
  app.use("/api", bookmarksRoutes);
  app.use("/api", tagsRoutes);
  app.use("/api", searchRoutes);
  app.use("/api", reviewQueueRoutes);
  app.use("/api", cityRoutes);
  app.use("/api", miscRoutes);

  // Root & Health check
  app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "DSA Tracker API is running" });
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "healthy" });
  });

  return app;
}

export const app = createApp();
export default app;
