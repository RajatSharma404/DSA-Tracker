import { spawnSync } from "child_process";
import path from "path";

const testDbUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:admin@localhost:5432/dsatracker_test?schema=public";

const isReset = process.argv.includes("--reset");
const scriptPath = path.resolve("backend/prisma/seed-e2e.ts");
const args = [scriptPath];
if (isReset) args.push("--reset");

const tsxBin = process.platform === "win32"
  ? path.resolve("backend/node_modules/.bin/tsx.cmd")
  : path.resolve("backend/node_modules/.bin/tsx");

console.log(`🌱 Running E2E Seed against: ${testDbUrl.replace(/:[^:@]+@/, ":****@")}`);

const result = spawnSync(tsxBin, args, {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    DATABASE_URL: testDbUrl,
    NODE_ENV: "test",
    E2E: "true",
  },
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}
