"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkUserStats() {
    const users = await prisma.user.findMany();
    for (const user of users) {
        const count = await prisma.progress.count({
            where: { userId: user.id, status: "DONE" },
        });
        console.log(user.email, "Solved:", count, "LC Username:", user.leetcodeUsername, "LC Session:", user.leetcodeSession ? (user.leetcodeSession.length > 5 ? "yes" : "yes") : "none");
    }
}
checkUserStats().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=test-sync.js.map