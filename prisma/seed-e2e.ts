import { seedE2E, resetTestDatabase } from "../backend/prisma/seed-e2e";

async function main() {
  const isReset = process.argv.includes("--reset");
  if (isReset) {
    await resetTestDatabase();
  }
  await seedE2E();
}

main().catch((err) => {
  console.error("❌ E2E Seed failed:", err);
  process.exit(1);
});

