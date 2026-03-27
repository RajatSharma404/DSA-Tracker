"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    // Create a default user
    const user = await prisma.user.upsert({
        where: { email: 'user@dsatracker.local' },
        update: {},
        create: {
            email: 'user@dsatracker.local',
            name: 'DSA Pro User',
            streak: {
                create: {
                    currentStreak: 0,
                    longestStreak: 0,
                }
            }
        },
    });
    const seedDataPath = path_1.default.join(__dirname, '../../dsa-roadmap-seed.json');
    const seedData = JSON.parse(fs_1.default.readFileSync(seedDataPath, 'utf8'));
    for (const topicData of seedData.topics) {
        const topic = await prisma.topic.upsert({
            where: { name: topicData.name },
            update: {
                description: topicData.description,
                orderIndex: topicData.order,
            },
            create: {
                name: topicData.name,
                description: topicData.description,
                orderIndex: topicData.order,
            }
        });
        for (const problemData of topicData.problems) {
            // Find matches by title within this topic to avoid duplicates
            const existingProblem = await prisma.problem.findFirst({
                where: {
                    title: problemData.title,
                    topicId: topic.id,
                }
            });
            if (existingProblem) {
                await prisma.problem.update({
                    where: { id: existingProblem.id },
                    data: {
                        link: problemData.leetcode,
                        difficulty: problemData.difficulty.toUpperCase(),
                        orderIndex: problemData.order,
                    }
                });
            }
            else {
                await prisma.problem.create({
                    data: {
                        title: problemData.title,
                        link: problemData.leetcode,
                        difficulty: problemData.difficulty.toUpperCase(),
                        orderIndex: problemData.order,
                        topicId: topic.id,
                    }
                });
            }
        }
    }
    console.log('Database seeded successfully.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map