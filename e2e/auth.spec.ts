import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("1. Auth & RBAC Spec", () => {
  test("unauthenticated visit redirects to /login", async ({ browser }) => {
    // Isolated context without cookies
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto("/review");
    await expect(page).toHaveURL(/\/login/);

    await context.close();
  });

  test("authenticated user reaches the dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("non-admin gets redirected from /admin", async ({ page }) => {
    // Current storageState is for USER role
    await page.goto("/admin");
    // NextAuth middleware denies access and redirects non-admin to login or unauthorized
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test("dashboard has zero critical or serious accessibility violations", async ({ page }) => {
    await page.goto("/");
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

