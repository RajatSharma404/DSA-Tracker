import { describe, it, expect, vi, beforeEach } from "vitest";
import { offlineQueue } from "../offlineQueue";
import { trackEvent, getEventLog, clearEventLog, getKpiSnapshot } from "../analytics";
import { soundEffects } from "../soundEffects";
import { cityAudio } from "../cityAudio";
import {
  DESIGN_TOKENS,
  cardStyles,
  buttonStyles,
  skeletonStyles,
  cn,
  getStatusStyle,
  getDifficultyStyle,
} from "../design-tokens";
import { getExtensionHealth, submitViaExtension } from "../extensionBridge";
import proxyConfig from "../../proxy";

describe("Frontend Core Libraries", () => {
  beforeEach(() => {
    localStorage.clear();
    clearEventLog();
    vi.clearAllMocks();
  });

  describe("offlineQueue (lib/offlineQueue.ts)", () => {
    it("should enqueue mutations and count pending items", () => {
      offlineQueue.enqueue("UPDATE_PROGRESS", { problemId: "p1", status: "DONE" });
      expect(offlineQueue.getPendingCount()).toBe(1);

      offlineQueue.enqueue("TOGGLE_BOOKMARK", { problemId: "p2" });
      expect(offlineQueue.getPendingCount()).toBe(2);
    });
  });

  describe("analytics (lib/analytics.ts)", () => {
    it("should track events and log to localStorage", () => {
      trackEvent("dashboard_viewed", { source: "sidebar" });
      trackEvent("problem_submitted", { problemId: "two-sum" });

      const log = getEventLog();
      expect(log).toHaveLength(2);
      expect(log[0].event).toBe("dashboard_viewed");
      expect(log[1].event).toBe("problem_submitted");
    });

    it("should compute KPI snapshots correctly", () => {
      trackEvent("dashboard_viewed");
      trackEvent("dashboard_primary_cta_clicked");
      trackEvent("review_quality_selected");
      trackEvent("review_completed");

      const kpi = getKpiSnapshot(7);
      expect(kpi.dashboardViews).toBe(1);
      expect(kpi.dashboardPrimaryCta).toBe(1);
      expect(kpi.dashboardActionRate).toBe(100);
      expect(kpi.reviewCompletionRate).toBe(100);
    });

    it("should clear event log", () => {
      trackEvent("dashboard_viewed");
      expect(getEventLog()).toHaveLength(1);
      clearEventLog();
      expect(getEventLog()).toHaveLength(0);
    });
  });

  describe("soundEffects (lib/soundEffects.ts)", () => {
    it("should toggle mute and play audio triggers without crashing", () => {
      const isMuted = soundEffects.toggleMute();
      expect(typeof isMuted).toBe("boolean");
      expect(soundEffects.getMuted()).toBe(isMuted);

      // Unmute and test sound triggers
      if (soundEffects.getMuted()) soundEffects.toggleMute();

      expect(() => soundEffects.playClick()).not.toThrow();
      expect(() => soundEffects.playOpen()).not.toThrow();
      expect(() => soundEffects.playSuccess()).not.toThrow();
      expect(() => soundEffects.playToggle()).not.toThrow();
      expect(() => soundEffects.playError()).not.toThrow();
      expect(() => soundEffects.playChord()).not.toThrow();
    });
  });

  describe("cityAudio (lib/cityAudio.ts)", () => {
    it("should toggle mute and trigger city audio synthesis", () => {
      expect(typeof cityAudio.getMuted()).toBe("boolean");
      const toggled = cityAudio.toggleMute();
      expect(cityAudio.getMuted()).toBe(toggled);

      if (cityAudio.getMuted()) cityAudio.toggleMute();

      expect(() => cityAudio.playSelect()).not.toThrow();
      expect(() => cityAudio.playHover()).not.toThrow();
      expect(() => cityAudio.playSweep()).not.toThrow();
      expect(() => cityAudio.playSpire()).not.toThrow();
      expect(() => cityAudio.playConstruct()).not.toThrow();
      expect(() => cityAudio.playPassUnlocked()).not.toThrow();
      expect(() => cityAudio.playGlitch()).not.toThrow();
    });
  });

  describe("design-tokens (lib/design-tokens.ts)", () => {
    it("should export design tokens, card styles, and button styles", () => {
      expect(DESIGN_TOKENS.colors).toBeDefined();
      expect(DESIGN_TOKENS.colors.background.primary).toBe("var(--bg-primary)");
      expect(DESIGN_TOKENS.colors.status.optimal).toBeDefined();
      expect(DESIGN_TOKENS.colors.status.success).toBeDefined();

      expect(cardStyles.base).toContain("bg-[var(--bg-card)]");
      expect(buttonStyles.primary).toContain("bg-[var(--accent-primary)]");
      expect(skeletonStyles.base).toContain("animate-pulse");
    });

    it("should merge classes using cn", () => {
      expect(cn("a", false, "b", undefined, "c")).toBe("a b c");
    });

    it("should get status and difficulty styles", () => {
      expect(getStatusStyle("OPTIMAL")).toBeDefined();
      expect(getStatusStyle("error")).toBeDefined();

      expect(getDifficultyStyle("EASY").text).toBe("text-emerald-400");
      expect(getDifficultyStyle("MEDIUM").text).toBe("text-amber-400");
      expect(getDifficultyStyle("HARD").text).toBe("text-rose-400");
    });
  });

  describe("extensionBridge (lib/extensionBridge.ts)", () => {
    it("should return not installed status on ping failure/timeout", async () => {
      const health = await getExtensionHealth();
      expect(health.state).toBe("NOT_INSTALLED");
      expect(health.signedIn).toBe(false);
    });

    it("should handle READY status when extension responds with signedIn true", async () => {
      const listener = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail?.action === "PING") {
          document.dispatchEvent(
            new CustomEvent("DSA_TRACKER_EXTENSION_RESPONSE_DOM", {
              detail: {
                source: "DSA_TRACKER_EXTENSION",
                requestId: customEvent.detail.requestId,
                ok: true,
                payload: { installed: true, leetcodeSignedIn: true },
              },
            })
          );
        }
      };

      document.addEventListener("DSA_TRACKER_EXTENSION_REQUEST_DOM", listener);
      const health = await getExtensionHealth();
      document.removeEventListener("DSA_TRACKER_EXTENSION_REQUEST_DOM", listener);

      expect(health.state).toBe("READY");
      expect(health.signedIn).toBe(true);
    });

    it("should handle INSTALLED_NOT_READY status when extension is not signed in", async () => {
      const listener = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail?.action === "PING") {
          document.dispatchEvent(
            new CustomEvent("DSA_TRACKER_EXTENSION_RESPONSE_DOM", {
              detail: {
                source: "DSA_TRACKER_EXTENSION",
                requestId: customEvent.detail.requestId,
                ok: true,
                payload: { installed: true, leetcodeSignedIn: false },
              },
            })
          );
        }
      };

      document.addEventListener("DSA_TRACKER_EXTENSION_REQUEST_DOM", listener);
      const health = await getExtensionHealth();
      document.removeEventListener("DSA_TRACKER_EXTENSION_REQUEST_DOM", listener);

      expect(health.state).toBe("INSTALLED_NOT_READY");
      expect(health.signedIn).toBe(false);
    });

    it("should submit via extension successfully and handle errors", async () => {
      const listener = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail?.action === "SUBMIT_TO_LEETCODE") {
          document.dispatchEvent(
            new CustomEvent("DSA_TRACKER_EXTENSION_RESPONSE_DOM", {
              detail: {
                source: "DSA_TRACKER_EXTENSION",
                requestId: customEvent.detail.requestId,
                ok: true,
                payload: { verdict: "ACCEPTED", accepted: true, timedOut: false },
              },
            })
          );
        }
      };

      document.addEventListener("DSA_TRACKER_EXTENSION_REQUEST_DOM", listener);
      const res = await submitViaExtension({
        problemSlug: "two-sum",
        code: "int main() {}",
        language: "cpp",
        timeoutMs: 1000,
      });
      document.removeEventListener("DSA_TRACKER_EXTENSION_REQUEST_DOM", listener);

      expect(res.verdict).toBe("ACCEPTED");
      expect(res.accepted).toBe(true);
    });
  });
});
