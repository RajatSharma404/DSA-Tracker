/**
 * Schedules reviews for solved problems that never got one (for example solves
 * imported before imports scheduled them). The app also does this on its own
 * when the review queue or dashboard loads; this script does it for every user
 * at once, e.g. right after deploying.
 *
 *   npx tsx scripts/schedule-unscheduled-solves.ts [userId]
 */
import "dotenv/config";
import { prisma } from "../db/prisma";
import { scheduleUnscheduledSolves } from "../services/reviewScheduling";

async function main() {
  const only = process.argv[2];
  const users = only
    ? [{ userId: only }]
    : await prisma.progress.groupBy({ by: ["userId"], where: { status: "DONE", nextReviewDate: null } });
  let total = 0;
  for (const { userId } of users) total += await scheduleUnscheduledSolves(userId);
  console.log(`Scheduled ${total} solves across ${users.length} user(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
