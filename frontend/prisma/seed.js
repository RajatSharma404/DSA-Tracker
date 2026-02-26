"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
        const topic = await prisma.topic.create({
            data: {
                name: topicData.name,
                description: topicData.description,
                orderIndex: topicData.order,
            }
        });
        for (const problemData of topicData.problems) {
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