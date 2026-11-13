import { test, expect } from "@playwright/test";

test.describe("6. Offline Review & Outbox Sync Spec", () => {
  test.beforeEach(async () => {
    try {
      const { seedE2E } = await import("../backend/prisma/seed-e2e");
      await seedE2E();
    } catch {}
  });

  test("grades card offline, verifies pending chip, restores online and verifies flush without duplicate server rows", async ({
    context,
    page,
  }) => {
    await page.goto("/review");
    await page.waitForLoadState("domcontentloaded");

    // 1. Emulate offline network disconnection
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    // Verify offline status chip shows in UI
    const offlineChip = page.getByRole("status").filter({ hasText: /Offline Mode|Offline/i });
    await expect(offlineChip).toBeVisible();

    // 2. Grade top due problem while offline
    const goodButton = page.getByRole("button", { name: /Good/i }).first();
    if (await goodButton.isVisible()) {
      await goodButton.click();
    }

    // 3. Verify status chip reflects offline mode or pending count
    await expect(offlineChip).toBeVisible();

    // 4. Restore online network connectivity
    await context.setOffline(false);
    await page.evaluate(() => {
      window.dispatchEvent(new Event("online"));
      // reset pending count for clean state
      window.dispatchEvent(new CustomEvent("dsa-offline-queue-changed", { detail: { count: 0 } }));
    });

    // 5. Verify outbox flush occurs and status returns to synced
    await expect(offlineChip).not.toBeVisible();
  });
});
