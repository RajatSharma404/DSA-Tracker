"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDifficultyRamp = exports.calculateWeeklySolveVelocity = exports.calculateTopicBreakdown = exports.calculateWeakestTopic = exports.generateHeatmapFromSolves = exports.calculateStreakFromSolves = exports.createApp = exports.app = void 0;
require("dotenv/config");
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
Object.defineProperty(exports, "app", { enumerable: true, get: function () { return app_1.app; } });
Object.defineProperty(exports, "createApp", { enumerable: true, get: function () { return app_1.createApp; } });
const prisma_1 = require("./db/prisma");
const analyticsCalculations_1 = require("./services/analyticsCalculations");
Object.defineProperty(exports, "calculateStreakFromSolves", { enumerable: true, get: function () { return analyticsCalculations_1.calculateStreakFromSolves; } });
Object.defineProperty(exports, "generateHeatmapFromSolves", { enumerable: true, get: function () { return analyticsCalculations_1.generateHeatmapFromSolves; } });
Object.defineProperty(exports, "calculateWeakestTopic", { enumerable: true, get: function () { return analyticsCalculations_1.calculateWeakestTopic; } });
Object.defineProperty(exports, "calculateTopicBreakdown", { enumerable: true, get: function () { return analyticsCalculations_1.calculateTopicBreakdown; } });
Object.defineProperty(exports, "calculateWeeklySolveVelocity", { enumerable: true, get: function () { return analyticsCalculations_1.calculateWeeklySolveVelocity; } });
Object.defineProperty(exports, "calculateDifficultyRamp", { enumerable: true, get: function () { return analyticsCalculations_1.calculateDifficultyRamp; } });
dotenv_1.default.config();
const PORT = process.env.PORT || 3001;
let server = null;
if (process.env.NODE_ENV !== "test") {
    server = app_1.app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
    const handleShutdown = async (signal) => {
        console.log(`Received ${signal}. Shutting down gracefully...`);
        if (server) {
            server.close(async () => {
                await prisma_1.prisma.$disconnect();
                console.log("Closed HTTP server and disconnected Prisma.");
                process.exit(0);
            });
        }
        else {
            await prisma_1.prisma.$disconnect();
            process.exit(0);
        }
    };
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    process.on("SIGINT", () => handleShutdown("SIGINT"));
}
exports.default = app_1.app;
//# sourceMappingURL=index.js.map