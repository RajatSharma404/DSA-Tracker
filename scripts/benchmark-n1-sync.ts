import { PrismaClient } from "../backend/node_modules/@prisma/client";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:admin@localhost:5432/dsatracker_test?schema=public";

async function runBenchmark() {
  console.log("⚡ Running N+1 Sync Benchmark (Old Per-Row vs Current Bulk Preload)...");

  let queryCount = 0;
  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: [
      {
        emit: "event",
        level: "query",
      },
    ],
  });

  (prisma as any).$on("query", () => {
    queryCount++;
  });

  // Ensure test problems exist
  const problems = await prisma.problem.findMany({ take: 100 });
  if (problems.length < 50) {
    console.warn("Seeding 100 test problems for benchmark...");
    const topic = await prisma.topic.upsert({
      where: { id: "n1-topic" },
      update: {},
      create: { id: "n1-topic", name: "N+1 Benchmark Topic", orderIndex: 1 },
    });
    const batch = Array.from({ length: 100 }).map((_, i) => ({
      id: `n1-prob-${i}`,
      title: `N1 Problem ${i}`,
      link: `https://leetcode.com/problems/n1-prob-${i}/`,
      difficulty: "EASY" as const,
      topicId: topic.id,
      orderIndex: i,
    }));
    await prisma.problem.createMany({ data: batch, skipDuplicates: true });
  }

  const userId = "n1-bench-user";
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: "n1-bench@dsatracker.local", name: "N1 Bench" },
  });

  const sampleSubmissions = Array.from({ length: 100 }).map((_, i) => ({
    titleSlug: `n1-prob-${i}`,
    title: `N1 Problem ${i}`,
    timestamp: Date.now() - i * 1000,
  }));

  // -------------------------------------------------------------------------
  // 1. Current Bulk Preload Approach (10 Runs)
  // -------------------------------------------------------------------------
  const bulkTimes: number[] = [];
  let bulkQueries = 0;

  for (let r = 0; r < 10; r++) {
    queryCount = 0;
    const start = performance.now();

    // Query 1: Bulk preload problems
    const allProblems = await prisma.problem.findMany({
      select: { id: true, title: true, link: true, topicId: true },
    });
    const slugMap = new Map<string, (typeof allProblems)[0]>();
    for (const p of allProblems) {
      const slug = p.link.split("/problems/")[1]?.replace(/\/$/, "") || p.id;
      slugMap.set(slug.toLowerCase(), p);
    }

    // Query 2: Bulk preload progress
    const allProgress = await prisma.progress.findMany({
      where: { userId },
      select: { problemId: true, status: true },
    });
    const progressMap = new Map<string, (typeof allProgress)[0]>();
    for (const prog of allProgress) {
      progressMap.set(prog.problemId, prog);
    }

    // Match in-memory
    const matched = [];
    for (const sub of sampleSubmissions) {
      const p = slugMap.get(sub.titleSlug.toLowerCase());
      if (p) matched.push(p);
    }

    const elapsed = performance.now() - start;
    bulkTimes.push(elapsed);
    if (r === 0) bulkQueries = queryCount;
  }

  // -------------------------------------------------------------------------
  // 2. Simulated Old Per-Row Approach (10 Runs)
  // -------------------------------------------------------------------------
  const oldTimes: number[] = [];
  let oldQueries = 0;

  for (let r = 0; r < 10; r++) {
    queryCount = 0;
    const start = performance.now();

    for (const sub of sampleSubmissions) {
      // Per-row problem lookup (100 DB round trips)
      await prisma.problem.findFirst({
        where: { link: { contains: sub.titleSlug } },
      });
      // Per-row progress lookup (100 DB round trips)
      await prisma.progress.findUnique({
        where: { userId_problemId: { userId, problemId: sub.titleSlug } },
      });
    }

    const elapsed = performance.now() - start;
    oldTimes.push(elapsed);
    if (r === 0) oldQueries = queryCount;
  }

  const median = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  };

  const results = {
    old: {
      roundTrips: oldQueries,
      medianMs: Number(median(oldTimes).toFixed(2)),
      minMs: Number(Math.min(...oldTimes).toFixed(2)),
      maxMs: Number(Math.max(...oldTimes).toFixed(2)),
    },
    bulk: {
      roundTrips: bulkQueries,
      medianMs: Number(median(bulkTimes).toFixed(2)),
      minMs: Number(Math.min(...bulkTimes).toFixed(2)),
      maxMs: Number(Math.max(...bulkTimes).toFixed(2)),
    },
  };

  console.table(results);
  await prisma.$disconnect();
  return results;
}

runBenchmark().catch((e) => {
  console.error("Benchmark failed:", e);
  process.exit(1);
});

