import { test, expect } from "@playwright/test";

test.describe("5. Quick Session & Card Stepper Spec", () => {
  test("card stepper advances on review or next navigation", async ({ page }) => {
    await page.goto("/flashcards");
    await page.waitForLoadState("domcontentloaded");

    // Stepper indicator shows "Card 1 of N"
    const stepperIndicator = page.locator("text=/Card 1 of [0-9]+/i").first();
    await expect(stepperIndicator).toBeVisible();

    // Advance stepper with Next arrow button or right arrow key
    const nextButton = page.getByRole("button", { name: /Next Card|Next/i }).or(
      page.locator("button:has(svg.lucide-chevron-right)"),
    ).first();

    if (await nextButton.isVisible()) {
      await nextButton.click();
    } else {
      await page.keyboard.press("ArrowRight");
    }

    // Verify stepper indicator advanced to "Card 2 of N"
    await expect(page.locator("text=/Card 2 of [0-9]+/i").first()).toBeVisible();
  });
});

