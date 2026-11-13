import { PrismaClient } from "../backend/node_modules/@prisma/client";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:admin@localhost:5432/dsatracker_test?schema=public";

if (!databaseUrl.includes("_test")) {
  throw new Error("Refusing to seed benchmark data into non-test database! DATABASE_URL must contain _test");
}

const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } },
});

export async function seedBenchmarkData(datasetType: "1_user" | "1000_users" = "1_user") {
  console.log(`🚀 Seeding benchmark dataset: ${datasetType}...`);

  // Ensure base topic and problems exist
  const topic = await prisma.topic.upsert({
    where: { id: "bench-topic" },
    update: {},
    create: {
      id: "bench-topic",
      name: "Benchmark Topic",
      orderIndex: 999,
    },
  });

  console.log("Creating 500 benchmark problems...");
  const problemData = Array.from({ length: 500 }).map((_, i) => ({
    id: `bench-prob-${i}`,
    title: `Benchmark Problem ${i}`,
    difficulty: (i % 3 === 0 ? "EASY" : i % 3 === 1 ? "MEDIUM" : "HARD") as any,
    link: `https://leetcode.com/problems/bench-prob-${i}/`,
    orderIndex: i,
    topicId: topic.id,
  }));

  await prisma.problem.createMany({
    data: problemData,
    skipDuplicates: true,
  });

  const now = new Date();

  if (datasetType === "1_user") {
    // 1 user, 5,000 Progress rows, 20,000 ActivityEvent rows
    const userId = "bench-user-1";
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: "bench-user-1@dsatracker.local",
        name: "Benchmark User 1",
        timezone: "UTC",
      },
    });

    console.log("Inserting 5,000 Progress rows...");
    const progressRows: any[] = [];
    for (let i = 0; i < 5000; i++) {
      const probId = `bench-prob-${i % 500}`;
      const isDue = i % 4 === 0;
      const nextReview = isDue
        ? new Date(now.getTime() - (i % 10 + 1) * 86400000)
        : new Date(now.getTime() + (i % 30 + 1) * 86400000);

      progressRows.push({
        id: `bench-prog-${userId}-${i}`,
        userId,
        problemId: probId,
        status: "DONE",
        completedAt: new Date(now.getTime() - (i % 100) * 86400000),
        nextReviewDate: nextReview,
        interval: (i % 20) + 1,
        repetitions: (i % 5) + 1,
        easinessFactor: 2.5,
        state: "REVIEW",
        lastReviewedAt: new Date(now.getTime() - (i % 10) * 86400000),
      });
    }

    // Chunked createMany to stay within Postgres param limits
    for (let i = 0; i < progressRows.length; i += 1000) {
      await prisma.progress.createMany({
        data: progressRows.slice(i, i + 1000),
        skipDuplicates: true,
      });
    }

    console.log("Inserting 20,000 ActivityEvent rows...");
    const eventRows: any[] = [];
    for (let i = 0; i < 20000; i++) {
      const probId = `bench-prob-${i % 500}`;
      const daysAgo = i % 365;
      eventRows.push({
        id: `bench-event-${userId}-${i}`,
        userId,
        problemId: probId,
        type: i % 2 === 0 ? "SOLVED" : "REVIEWED",
        occurredAt: new Date(now.getTime() - daysAgo * 86400000),
        metadata: { score: (i % 100) + 1 },
      });
    }

    for (let i = 0; i < eventRows.length; i += 2000) {
      await prisma.activityEvent.createMany({
        data: eventRows.slice(i, i + 2000),
        skipDuplicates: true,
      });
    }

    console.log(`✅ Seeded Dataset 1: User ${userId} with 5,000 Progress rows & 20,000 ActivityEvent rows.`);
  }

  await prisma.$disconnect();
}

if (process.argv[1]?.includes("seed-bench")) {
  const dataset = process.argv.includes("--1000") ? "1000_users" : "1_user";
  seedBenchmarkData(dataset).catch((e) => {
    console.error("Bench seed failed:", e);
    process.exit(1);
  });
}
