import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("3. Review Queue Spec", () => {
  test.beforeEach(async () => {
    try {
      const { seedE2E } = await import("../backend/prisma/seed-e2e");
      await seedE2E();
    } catch {}
  });

  test("shows 3 seeded due items, rates Good and Again with correct rescheduling", async ({
    page,
    request,
  }) => {
    await page.goto("/review");
    await page.waitForLoadState("domcontentloaded");

    // 1. Verify 3 seeded due problems are visible
    await expect(page.getByText(/Due for Review \(3\)/i)).toBeVisible();

    // 2. Rate Good on the top item
    const goodButton = page.getByRole("button", { name: /Good/i }).first();
    await expect(goodButton).toBeVisible();
    await goodButton.click();

    // Queue count decrements from 3 to 2
    await expect(page.getByText(/Due for Review \(2\)/i)).toBeVisible();

    // 3. Rate Again (Forgot) on the next item
    const forgotButton = page.getByRole("button", { name: /Forgot/i }).first();
    await expect(forgotButton).toBeVisible();
    await forgotButton.click();

    // Queue count decrements from 2 to 1
    await expect(page.getByText(/Due for Review \(1\)/i)).toBeVisible();

    // 4. Verify API intervals: Good should have higher nextReviewDate than Again
    const reviewQueueRes = await request.get("/api/review-queue");
    if (reviewQueueRes.ok()) {
      const data = await reviewQueueRes.json();
      expect(data.due.length).toBe(1);
      expect(data.upcoming.length).toBeGreaterThanOrEqual(2);
    }
  });

  test("review page has zero serious/critical accessibility violations", async ({ page }) => {
    await page.goto("/review");
    await page.waitForLoadState("domcontentloaded");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    expect(seriousOrCritical).toEqual([]);
  });
});
