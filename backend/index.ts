import dotenv from "dotenv";
import { app, createApp } from "./app";
import { prisma } from "./db/prisma";
import {
  calculateStreakFromSolves,
  generateHeatmapFromSolves,
  calculateWeakestTopic,
  calculateTopicBreakdown,
  calculateWeeklySolveVelocity,
  calculateDifficultyRamp,
} from "./services/analyticsCalculations";

dotenv.config();

const PORT = process.env.PORT || 3001;

// Re-export calculation functions for backward compatibility with existing tests
export {
  app,
  createApp,
  calculateStreakFromSolves,
  generateHeatmapFromSolves,
  calculateWeakestTopic,
  calculateTopicBreakdown,
  calculateWeeklySolveVelocity,
  calculateDifficultyRamp,
};

let server: ReturnType<typeof app.listen> | null = null;

if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  const handleShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    if (server) {
      server.close(async () => {
        await prisma.$disconnect();
        console.log("Closed HTTP server and disconnected Prisma.");
        process.exit(0);
      });
    } else {
      await prisma.$disconnect();
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}

export default app;
