import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3005",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    storageState: "./e2e/.auth/user.json",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_NO_WEBSERVER
    ? undefined
    : [
        {
          command: "npm --prefix backend run dev",
          url: "http://127.0.0.1:3001/health",
          reuseExistingServer: !process.env.CI,
          timeout: 30000,
          stdout: "pipe",
          stderr: "pipe",
          env: {
            NODE_ENV: "test",
            E2E: "true",
            PORT: "3001",
            DATABASE_URL:
              process.env.DATABASE_URL ||
              "postgresql://postgres:admin@localhost:5432/dsatracker_test?schema=public",
            BACKEND_JWT_SECRET:
              process.env.BACKEND_JWT_SECRET ||
              "58c6abb5a1c47b1872ea8b43a1963fd258c6abb5a1c47b1872ea8b43a1963fd2",
          },
        },
        {
          command: "npm --prefix frontend run dev",
          url: "http://127.0.0.1:3005",
          reuseExistingServer: !process.env.CI,
          timeout: 60000,
          stdout: "pipe",
          stderr: "pipe",
          env: {
            NODE_ENV: "test",
            E2E: "true",
            PORT: "3005",
            DATABASE_URL:
              process.env.DATABASE_URL ||
              "postgresql://postgres:admin@localhost:5432/dsatracker_test?schema=public",
            NEXTAUTH_URL: "http://localhost:3005",
            NEXTAUTH_SECRET:
              process.env.NEXTAUTH_SECRET ||
              "58c6abb5a1c47b1872ea8b43a1963fd2",
            BACKEND_JWT_SECRET:
              process.env.BACKEND_JWT_SECRET ||
              "58c6abb5a1c47b1872ea8b43a1963fd258c6abb5a1c47b1872ea8b43a1963fd2",
            NEXT_PUBLIC_API_URL: "http://localhost:3001/api",
          },
        },
      ],
});
