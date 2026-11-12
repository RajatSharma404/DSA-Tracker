import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL || "";
if (!databaseUrl.endsWith("_test") && !databaseUrl.includes("_test?")) {
  throw new Error(
    `Refusing to run seed-e2e on non-test database! DATABASE_URL must end in _test. Current URL: ${databaseUrl.replace(/:[^:@]+@/, ":****@")}`,
  );
}

const prisma = new PrismaClient();

export async function resetTestDatabase() {
  console.log("Truncating test database tables...");
  const tablenames = [
    "ReviewLog",
    "ActivityEvent",
    "SyncReceipt",
    "ExtensionDevice",
    "SolutionHistory",
    "ProblemNote",
    "Streak",
    "DailyActivity",
    "Progress",
    "Problem",
    "Topic",
    "User",
  ];

  for (const table of tablenames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch {
      // Table may not exist or have different casing
    }
  }
}

export async function seedE2E() {
  console.log("Seeding E2E test database...");

  // 1. Test User (timezone UTC)
  const testUser = await prisma.user.upsert({
    where: { email: "testuser@dsatracker.local" },
    update: { timezone: "UTC", role: "USER", name: "E2E Test User" },
    create: {
      id: "e2e-test-user-id",
      email: "testuser@dsatracker.local",
      name: "E2E Test User",
      role: "USER",
      timezone: "UTC",
      streak: {
        create: {
          currentStreak: 2,
          longestStreak: 5,
          lastActivityDate: new Date(),
        },
      },
    },
  });

  // 2. Admin User
  await prisma.user.upsert({
    where: { email: "admin@dsatracker.local" },
    update: { timezone: "UTC", role: "ADMIN", name: "E2E Admin User" },
    create: {
      id: "e2e-admin-user-id",
      email: "admin@dsatracker.local",
      name: "E2E Admin User",
      role: "ADMIN",
      timezone: "UTC",
      streak: {
        create: {
          currentStreak: 1,
          longestStreak: 1,
        },
      },
    },
  });

  // 3. Small Curriculum (3 Topics, 12 Problems across difficulties)
  const topicsData = [
    {
      id: "topic-arrays",
      name: "Arrays & Hashing",
      description: "Fundamental array and hash table patterns",
      orderIndex: 1,
      problems: [
        { id: "prob-two-sum", title: "Two Sum", difficulty: "EASY", link: "https://leetcode.com/problems/two-sum/", orderIndex: 1 },
        { id: "prob-contains-dup", title: "Contains Duplicate", difficulty: "EASY", link: "https://leetcode.com/problems/contains-duplicate/", orderIndex: 2 },
        { id: "prob-valid-anagram", title: "Valid Anagram", difficulty: "EASY", link: "https://leetcode.com/problems/valid-anagram/", orderIndex: 3 },
        { id: "prob-group-anagrams", title: "Group Anagrams", difficulty: "MEDIUM", link: "https://leetcode.com/problems/group-anagrams/", orderIndex: 4 },
      ],
    },
    {
      id: "topic-two-pointers",
      name: "Two Pointers",
      description: "Two-pointer technique for sorted and sequenced data",
      orderIndex: 2,
      problems: [
        { id: "prob-valid-palindrome", title: "Valid Palindrome", difficulty: "EASY", link: "https://leetcode.com/problems/valid-palindrome/", orderIndex: 1 },
        { id: "prob-two-sum-ii", title: "Two Sum II", difficulty: "MEDIUM", link: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", orderIndex: 2 },
        { id: "prob-3sum", title: "3Sum", difficulty: "MEDIUM", link: "https://leetcode.com/problems/3sum/", orderIndex: 3 },
        { id: "prob-container-water", title: "Container With Most Water", difficulty: "MEDIUM", link: "https://leetcode.com/problems/container-with-most-water/", orderIndex: 4 },
      ],
    },
    {
      id: "topic-sliding-window",
      name: "Sliding Window",
      description: "Subarray and substring optimization patterns",
      orderIndex: 3,
      problems: [
        { id: "prob-stock-buy-sell", title: "Best Time to Buy and Sell Stock", difficulty: "EASY", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", orderIndex: 1 },
        { id: "prob-longest-substring", title: "Longest Substring Without Repeating Characters", difficulty: "MEDIUM", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", orderIndex: 2 },
        { id: "prob-longest-repeating", title: "Longest Repeating Character Replacement", difficulty: "MEDIUM", link: "https://leetcode.com/problems/longest-repeating-character-replacement/", orderIndex: 3 },
        { id: "prob-min-window", title: "Minimum Window Substring", difficulty: "HARD", link: "https://leetcode.com/problems/minimum-window-substring/", orderIndex: 4 },
      ],
    },
  ];

  for (const topicData of topicsData) {
    const topic = await prisma.topic.upsert({
      where: { id: topicData.id },
      update: { name: topicData.name, description: topicData.description, orderIndex: topicData.orderIndex },
      create: { id: topicData.id, name: topicData.name, description: topicData.description, orderIndex: topicData.orderIndex },
    });

    for (const prob of topicData.problems) {
      await prisma.problem.upsert({
        where: { id: prob.id },
        update: {
          title: prob.title,
          difficulty: prob.difficulty as any,
          link: prob.link,
          orderIndex: prob.orderIndex,
          topicId: topic.id,
        },
        create: {
          id: prob.id,
          title: prob.title,
          difficulty: prob.difficulty as any,
          link: prob.link,
          orderIndex: prob.orderIndex,
          topicId: topic.id,
        },
      });
    }
  }

  // 4. Progress rows: 3 problems due for review
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // nextReviewDate in the past => due!

  const dueProblemIds = ["prob-two-sum", "prob-valid-palindrome", "prob-stock-buy-sell"];

  // Reset any previous non-due progress for clean repeatable runs
  await prisma.progress.deleteMany({
    where: {
      userId: testUser.id,
      problemId: { notIn: dueProblemIds },
    },
  });

  for (const problemId of dueProblemIds) {
    await prisma.progress.upsert({
      where: {
        userId_problemId: {
          userId: testUser.id,
          problemId,
        },
      },
      update: {
        status: "DONE",
        completedAt: threeDaysAgo,
        nextReviewDate: oneDayAgo,
        state: "REVIEW",
        interval: 1,
        repetitions: 1,
        easinessFactor: 2.5,
        lastReviewedAt: threeDaysAgo,
      },
      create: {
        userId: testUser.id,
        problemId,
        status: "DONE",
        completedAt: threeDaysAgo,
        nextReviewDate: oneDayAgo,
        state: "REVIEW",
        interval: 1,
        repetitions: 1,
        easinessFactor: 2.5,
        lastReviewedAt: threeDaysAgo,
      },
    });
  }

  console.log("✅ E2E Test DB Seeded: 2 users, 3 topics, 12 problems, 3 due reviews.");
}

async function main() {
  const isReset = process.argv.includes("--reset");
  if (isReset) {
    await resetTestDatabase();
  }
  await seedE2E();
}

if (require.main === module || process.argv[1]?.includes("seed-e2e")) {
  main()
    .catch((err) => {
      console.error("❌ E2E Seed failed:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
