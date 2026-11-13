import { test, expect } from "@playwright/test";

test.describe("7. Feature Flags Gating Spec", () => {
  test("parked routes (/pvp, /challenge, /interviews) return 404 page", async ({ page }) => {
    // 1. /pvp
    await page.goto("/pvp");
    await expect(page.locator("text=/404|This page could not be found|not found/i").first()).toBeVisible();

    // 2. /challenge
    await page.goto("/challenge");
    await expect(page.locator("text=/404|This page could not be found|not found/i").first()).toBeVisible();

    // 3. /interviews
    await page.goto("/interviews");
    await expect(page.locator("text=/404|This page could not be found|not found/i").first()).toBeVisible();
  });

  test("navigation sidebar hides parked items when flags are off", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Nav sidebar should not contain links to parked routes
    const sidebar = page.locator("aside, nav").first();
    await expect(sidebar.locator('a[href="/pvp"]')).toHaveCount(0);
    await expect(sidebar.locator('a[href="/challenge"]')).toHaveCount(0);
    await expect(sidebar.locator('a[href="/interviews"]')).toHaveCount(0);
  });
});

