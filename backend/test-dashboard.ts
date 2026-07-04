import { PrismaClient } from "@prisma/client";
import { getWeakTopics, getRevisionReminders } from "./services";

const prisma = new PrismaClient();

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
      getWeakTopics(user.id),
      getRevisionReminders(user.id),
    ]);
    console.log("Success");
  } catch (err) {
    console.error("Error occurred:", err);
  }
}

main().finally(() => prisma.$disconnect());
