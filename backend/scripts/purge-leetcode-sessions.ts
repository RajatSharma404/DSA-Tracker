import { prisma } from "../db/prisma";

/**
 * Purges stored LeetCode session cookies and blind hashes from the database.
 * Usage:
 *   npx tsx scripts/purge-leetcode-sessions.ts           # Dry-run mode (default, no writes)
 *   npx tsx scripts/purge-leetcode-sessions.ts --confirm # Executes the purge
 */
async function main() {
  const isConfirm = process.argv.includes("--confirm");

  console.log("==================================================");
  console.log("🔒 LeetCode Session Cookie Purge Utility");
  console.log(`Mode: ${isConfirm ? "🔴 LIVE EXECUTION (--confirm)" : "🟡 DRY-RUN (safe preview)"}`);
  console.log("==================================================");

  const usersWithSessions = await prisma.user.findMany({
    where: {
      OR: [
        { leetcodeSession: { not: null } },
        { leetcodeSessionHash: { not: null } },
      ],
    },
    select: {
      id: true,
      email: true,
      leetcodeUsername: true,
      leetcodeSession: true,
      leetcodeSessionHash: true,
    },
  });

  console.log(`Found ${usersWithSessions.length} user(s) with stored session cookies / hashes:`);
  for (const u of usersWithSessions) {
    console.log(
      ` - User: ${u.email} (ID: ${u.id}) | Username: ${u.leetcodeUsername || "N/A"} | HasSession: ${Boolean(u.leetcodeSession)} | HasHash: ${Boolean(u.leetcodeSessionHash)}`
    );
  }

  if (!isConfirm) {
    console.log("\n🟡 DRY-RUN COMPLETE: No changes were written to the database.");
    console.log("To execute the purge, run:");
    console.log("  npx tsx scripts/purge-leetcode-sessions.ts --confirm\n");
    return;
  }

  const result = await prisma.user.updateMany({
    where: {
      OR: [
        { leetcodeSession: { not: null } },
        { leetcodeSessionHash: { not: null } },
      ],
    },
    data: {
      leetcodeSession: null,
      leetcodeSessionHash: null,
    },
  });

  console.log(`\n✅ PURGE COMPLETE: Successfully nulled leetcodeSession and leetcodeSessionHash for ${result.count} user(s).`);
}

main()
  .catch((err) => {
    console.error("❌ Purge script failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

