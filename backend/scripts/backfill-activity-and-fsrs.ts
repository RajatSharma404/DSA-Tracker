import { PrismaClient, ActivityEventType, ReviewState } from "@prisma/client";

export async function runBackfill(options: { dryRun?: boolean } = {}) {
  const prisma = new PrismaClient();
  const dryRun =
    options.dryRun ??
    (process.argv.includes("--dry-run") || process.env.DRY_RUN === "true");

  console.log(`[backfill] Starting backfill (dryRun: ${dryRun})...`);

  try {
    const allProgress = await prisma.progress.findMany({
      include: {
        problem: true,
      },
    });

    let createdEvents = 0;
    let updatedProgressCount = 0;

    for (const prog of allProgress) {
      // 1. Backfill ActivityEvent SOLVED rows from completedAt
      if (prog.status === "DONE" && prog.completedAt) {
        const existingEvent = await prisma.activityEvent.findFirst({
          where: {
            userId: prog.userId,
            problemId: prog.problemId,
            type: ActivityEventType.SOLVED,
          },
        });

        if (!existingEvent) {
          if (!dryRun) {
            await prisma.activityEvent.create({
              data: {
                userId: prog.userId,
                problemId: prog.problemId,
                type: ActivityEventType.SOLVED,
                occurredAt: prog.completedAt,
                metadata: {
                  backfilled: true,
                  timeSpent: prog.timeSpent,
                },
              },
            });
          }
          createdEvents++;
        }
      }

      // 2. Set repetitions and state from interval history where inferable
      let repetitions = prog.repetitions;
      let state = prog.state;

      if (prog.status === "DONE") {
        if (state === ReviewState.NEW) {
          state = ReviewState.REVIEW;
        }
        if (repetitions === 0 && prog.interval > 0) {
          if (prog.interval >= 6) {
            repetitions = Math.max(2, Math.round(Math.log2(prog.interval / 3) + 2));
          } else {
            repetitions = 1;
          }
        }
      }

      const needsUpdate =
        repetitions !== prog.repetitions || state !== prog.state;

      if (needsUpdate) {
        if (!dryRun) {
          await prisma.progress.update({
            where: { id: prog.id },
            data: {
              repetitions,
              state,
              lastReviewedAt: prog.lastReviewedAt || prog.completedAt || undefined,
            },
          });
        }
        updatedProgressCount++;
      }
    }

    console.log(
      `[backfill] Complete! Created ActivityEvents: ${createdEvents}, Updated Progress: ${updatedProgressCount} (dryRun: ${dryRun})`,
    );
    return { createdEvents, updatedProgressCount, dryRun };
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.includes("backfill-activity-and-fsrs")) {
  runBackfill().catch((err) => {
    console.error("[backfill] Fatal error:", err);
    process.exit(1);
  });
}

