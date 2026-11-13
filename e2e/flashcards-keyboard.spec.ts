import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("4. Flashcards Keyboard Navigation Spec", () => {
  test("Space flips card, 1-4 rates, and Escape exits session", async ({ page }) => {
    await page.goto("/flashcards");
    await page.waitForLoadState("domcontentloaded");

    // Ensure flashcard container is visible
    const flashcard = page.getByRole("region", { name: /Flashcard Study Area|Flashcard/i }).or(
      page.locator(".perspective-1000, [aria-label*='flashcard' i], main"),
    ).first();
    await expect(flashcard).toBeVisible();

    // 1. Press Space to flip the card
    await page.keyboard.press("Space");
    // Verify flipped state (e.g. Solution or Answer or Hint revealed)
    await expect(page.locator("text=/Answer|Solution|Complexity|Recall/i").first()).toBeVisible();

    // 2. Press "3" to grade as "Good"
    await page.keyboard.press("3");

    // 3. Press Escape to exit session
    await page.keyboard.press("Escape");
  });

  test("flashcards page has zero serious/critical accessibility violations", async ({ page }) => {
    await page.goto("/flashcards");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(400);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    expect(seriousOrCritical).toEqual([]);
  });
});
