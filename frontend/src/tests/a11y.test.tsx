import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import "fake-indexeddb/auto";
import axe from "axe-core";
import LoginPage from "@/app/(auth)/login/page";
import SettingsPage from "@/app/(dashboard)/settings/page";
import SearchPage from "@/app/(dashboard)/search/page";
import FlashcardsPage from "@/app/(dashboard)/flashcards/page";
import ReviewQueuePage from "@/app/(dashboard)/review/page";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import * as nextAuth from "next-auth/react";
import * as navigation from "next/navigation";
import { dsaApi } from "@/lib/api";

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User", email: "test@example.com" } },
    status: "authenticated",
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getProviders: vi.fn(async () => ({ google: { id: "google" } })),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/review",
}));

// Mock soundEffects
vi.mock("@/lib/soundEffects", () => ({
  soundEffects: {
    playClick: vi.fn(),
    playToggle: vi.fn(),
    playSuccess: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "best-practice"],
    },
    rules: {
      // Color contrast in JSDOM cannot reliably compute rendered pseudo-elements and CSS variables
      // (Verified mathematically across all 5 themes in check-theme-contrast.mjs)
      "color-contrast": { enabled: false },
    },
  });

  const criticalOrSerious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );

  if (criticalOrSerious.length > 0) {
    const errorDetails = criticalOrSerious.map(
      (v) => `${v.id} (${v.impact}): ${v.description} -> Nodes: ${v.nodes.map((n) => n.html).join(", ")}`,
    );
    throw new Error(`Accessibility violations found:\n${errorDetails.join("\n")}`);
  }

  return results;
}

describe("Phase 4b: Accessibility Audits (axe-core WCAG 2.1 AA)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Login page should have 0 serious/critical accessibility violations", async () => {
    const { container } = render(<LoginPage />);
    const results = await checkA11y(container);
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toHaveLength(0);
  });

  it("Settings page should have 0 serious/critical accessibility violations", async () => {
    const { container } = render(
      <ThemeProvider>
        <SettingsPage />
      </ThemeProvider>,
    );
    const results = await checkA11y(container);
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toHaveLength(0);
  });

  it("Flashcards page should have 0 serious/critical accessibility violations", async () => {
    const { container } = render(<FlashcardsPage />);
    const results = await checkA11y(container);
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toHaveLength(0);
  });

  it("Search problems list should have 0 serious/critical accessibility violations", async () => {
    vi.spyOn(dsaApi, "searchProblems").mockResolvedValue({
      problems: [
        {
          id: "two-sum",
          title: "Two Sum",
          difficulty: "EASY",
          topic: { id: "t1", name: "Arrays" },
          status: "DONE",
          isBookmarked: false,
          userTags: [],
        },
      ],
      total: 1,
    } as any);
    vi.spyOn(dsaApi, "getTopics").mockResolvedValue([
      { id: "t1", name: "Arrays", description: "", orderIndex: 1, createdAt: "", updatedAt: "" },
    ]);

    const { container } = render(<SearchPage />);
    const results = await checkA11y(container);
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toHaveLength(0);
  });

  it("Review queue page should have 0 serious/critical accessibility violations", async () => {
    vi.spyOn(dsaApi, "getReviewQueue").mockResolvedValue({
      due: [
        {
          progressId: "p1",
          problemId: "two-sum",
          title: "Two Sum",
          difficulty: "EASY",
          topicName: "Arrays",
          link: "https://leetcode.com",
          nextReviewDate: new Date().toISOString(),
          interval: 1,
        },
      ],
      upcoming: [],
      stats: { totalDue: 1, totalUpcoming: 0 },
    });

    const { container } = render(<ReviewQueuePage />);
    const results = await checkA11y(container);
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toHaveLength(0);
  });
});
