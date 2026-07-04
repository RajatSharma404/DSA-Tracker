import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
