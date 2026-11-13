import path from "path";
import fs from "fs";
import { createStorageState } from "./auth-helper";

export default async function globalSetup() {
  process.env.NODE_ENV = "test";
  process.env.E2E = "true";
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ||
    "postgresql://postgres:admin@localhost:5432/dsatracker_test?schema=public";

  // Load frontend/.env if present so NEXTAUTH_SECRET matches Next.js runtime
  const envPath = path.resolve(__dirname, "../frontend/.env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || "").trim().replace(/^['"]|['"]$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }

  console.log("🚀 Starting Playwright E2E Global Setup...");

  // 1. Seed deterministic test curriculum and users
  try {
    const { seedE2E } = await import("../backend/prisma/seed-e2e");
    await seedE2E();
  } catch (err: any) {
    console.warn("Notice: seedE2E skipped or handled externally:", err.message);
  }

  // 2. Create storageState for regular test user
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3005";
  const userStoragePath = path.resolve(__dirname, ".auth/user.json");
  await createStorageState(
    {
      sub: "e2e-test-user-id",
      email: "testuser@dsatracker.local",
      name: "E2E Test User",
      role: "USER",
    },
    userStoragePath,
    baseURL,
  );

  // 3. Create storageState for admin user
  const adminStoragePath = path.resolve(__dirname, ".auth/admin.json");
  await createStorageState(
    {
      sub: "e2e-admin-user-id",
      email: "admin@dsatracker.local",
      name: "E2E Admin User",
      role: "ADMIN",
    },
    adminStoragePath,
    baseURL,
  );

  console.log("✅ Playwright E2E Global Setup complete: Auth cookies minted for user & admin.");
}
