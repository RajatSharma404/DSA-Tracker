"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const services_1 = require("./services");
const prisma = new client_1.PrismaClient();
async function main() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log("No user found");
        return;
    }
    console.log("Testing with user:", user.id);
    try {
        const [totalProblems, solvedProblems, streak, weakTopics, revisions] = await Promise.all([
            prisma.problem.count(),
            prisma.progress.count({ where: { userId: user.id, status: "DONE" } }),
            prisma.streak.findUnique({ where: { userId: user.id } }),
            (0, services_1.getWeakTopics)(user.id),
            (0, services_1.getRevisionReminders)(user.id),
        ]);
        console.log("Success");
    }
    catch (err) {
        console.error("Error occurred:", err);
    }
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=test-dashboard.js.map