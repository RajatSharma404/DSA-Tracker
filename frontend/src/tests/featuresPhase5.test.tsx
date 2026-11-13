import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import {
  FeaturesProvider,
  useFeatures,
  useFeature,
} from "@/components/providers/FeaturesProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { DEFAULT_FEATURE_FLAGS, FeatureFlags } from "@/types/features";
import { dsaApi } from "@/lib/api";

// Mock next/navigation
const mockNotFound = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({ problemId: "two-sum" }),
  notFound: () => mockNotFound(),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User", email: "test@example.com", role: "USER" } },
    status: "authenticated",
  }),
}));

// Mock ThemeProvider
vi.mock("@/components/providers/ThemeProvider", () => ({
  useTheme: () => ({ theme: "oled", setTheme: vi.fn() }),
  THEME_OPTIONS: [],
}));

describe("Phase 5: Frontend Feature Gating & Navigation Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("5.1: FeaturesProvider & Hook Fallbacks", () => {
    function TestConsumer() {
      const flags = useFeatures();
      const isPvp = useFeature("pvp");
      const isAlgoTracer = useFeature("algotracer");

      return (
        <div>
          <span data-testid="pvp-flag">{String(isPvp)}</span>
          <span data-testid="algotracer-flag">{String(isAlgoTracer)}</span>
          <span data-testid="all-flags">{JSON.stringify(flags)}</span>
        </div>
      );
    }

    it("should provide safe defaults (parked OFF, algotracer ON) when API fails", async () => {
      vi.spyOn(dsaApi, "getFeatureFlags").mockRejectedValueOnce(
        new Error("Network Error"),
      );

      render(
        <FeaturesProvider initialFlags={DEFAULT_FEATURE_FLAGS}>
          <TestConsumer />
        </FeaturesProvider>,
      );

      expect(screen.getByTestId("pvp-flag").textContent).toBe("false");
      expect(screen.getByTestId("algotracer-flag").textContent).toBe("true");
      expect(JSON.parse(screen.getByTestId("all-flags").textContent!)).toEqual(
        DEFAULT_FEATURE_FLAGS,
      );
    });

    it("should update flags dynamically when loaded from API", async () => {
      const customFlags: FeatureFlags = {
        pvp: true,
        arena: true,
        interviews: true,
        algotracer: true,
      };
      vi.spyOn(dsaApi, "getFeatureFlags").mockResolvedValueOnce(customFlags);

      await act(async () => {
        render(
          <FeaturesProvider initialFlags={DEFAULT_FEATURE_FLAGS}>
            <TestConsumer />
          </FeaturesProvider>,
        );
      });

      expect(screen.getByTestId("pvp-flag").textContent).toBe("true");
      expect(screen.getByTestId("algotracer-flag").textContent).toBe("true");
    });
  });

  describe("5.3: Navigation Gating (Sidebar, MobileDrawer, CommandPalette)", () => {
    it("Sidebar should hide parked items when flags are disabled by default", () => {
      render(
        <FeaturesProvider initialFlags={DEFAULT_FEATURE_FLAGS}>
          <Sidebar />
        </FeaturesProvider>,
      );

      // Core & showpiece visible by title/href
      expect(screen.getByRole("link", { name: "Dashboard" })).toBeDefined();
      expect(screen.getByRole("link", { name: "Topics" })).toBeDefined();
      expect(screen.getByRole("link", { name: "Code Tracer" })).toBeDefined();

      // Parked hidden
      expect(screen.queryByRole("link", { name: "1v1 Battles" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Timed Challenges" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Mock Interviews" })).toBeNull();
    });

    it("Sidebar should show parked items when flags are enabled", () => {
      const enabledFlags: FeatureFlags = {
        pvp: true,
        arena: true,
        interviews: true,
        algotracer: true,
      };

      render(
        <FeaturesProvider initialFlags={enabledFlags}>
          <Sidebar />
        </FeaturesProvider>,
      );

      expect(screen.getByRole("link", { name: "1v1 Battles" })).toBeDefined();
      expect(screen.getByRole("link", { name: "Timed Challenges" })).toBeDefined();
      expect(screen.getByRole("link", { name: "Mock Interviews" })).toBeDefined();
    });

    it("MobileDrawer should hide parked items when flags are disabled by default", () => {
      render(
        <FeaturesProvider initialFlags={DEFAULT_FEATURE_FLAGS}>
          <MobileDrawer isOpen={true} onClose={vi.fn()} />
        </FeaturesProvider>,
      );

      expect(screen.getByText("Dashboard")).toBeDefined();
      expect(screen.queryByText("1v1 Battles")).toBeNull();
      expect(screen.queryByText("Timed Challenges")).toBeNull();
      expect(screen.queryByText("Mock Interviews")).toBeNull();
    });

    it("CommandPalette should hide parked commands when flags are disabled", () => {
      vi.spyOn(dsaApi, "getTopics").mockResolvedValue([]);

      render(
        <FeaturesProvider initialFlags={DEFAULT_FEATURE_FLAGS}>
          <CommandPalette />
        </FeaturesProvider>,
      );

      // Open palette
      act(() => {
        window.dispatchEvent(new CustomEvent("dsa-open-command-palette"));
      });

      expect(screen.queryByText("1v1 PvP Speed Duels")).toBeNull();
      expect(screen.queryByText("The Arena Speed Challenge")).toBeNull();
      expect(screen.queryByText("AI Mock Technical Interviews")).toBeNull();
    });
  });

  describe("5.3: Page Route Guards (calls notFound() when disabled)", () => {
    it("PvP page calls notFound when pvp flag is disabled", async () => {
      const PvPPage = (await import("@/app/(dashboard)/pvp/page")).default;

      render(
        <FeaturesProvider initialFlags={{ ...DEFAULT_FEATURE_FLAGS, pvp: false }}>
          <PvPPage />
        </FeaturesProvider>,
      );

      expect(mockNotFound).toHaveBeenCalled();
    });

    it("Challenge page calls notFound when arena flag is disabled", async () => {
      const ChallengePage = (await import("@/app/(dashboard)/challenge/page")).default;

      render(
        <FeaturesProvider initialFlags={{ ...DEFAULT_FEATURE_FLAGS, arena: false }}>
          <ChallengePage />
        </FeaturesProvider>,
      );

      expect(mockNotFound).toHaveBeenCalled();
    });

    it("Interviews page calls notFound when interviews flag is disabled", async () => {
      const InterviewsPage = (await import("@/app/(dashboard)/interviews/page")).default;

      render(
        <FeaturesProvider initialFlags={{ ...DEFAULT_FEATURE_FLAGS, interviews: false }}>
          <InterviewsPage />
        </FeaturesProvider>,
      );

      expect(mockNotFound).toHaveBeenCalled();
    }, 15000);
  });
});
