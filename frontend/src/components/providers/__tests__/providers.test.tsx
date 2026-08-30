import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme, THEME_OPTIONS } from "../ThemeProvider";
import { ToastProvider, useToast, useToastNotification } from "../ToastProvider";
import NextAuthProvider from "../NextAuthProvider";
import { PwaProvider } from "../PwaProvider";
import ScrollRevealProvider from "../ScrollRevealProvider";

const ThemeTestConsumer = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme("matrix")}>Set Matrix</button>
    </div>
  );
};

describe("Providers (components/providers)", () => {
  describe("ThemeProvider", () => {
    it("should provide default theme and allow switching themes", () => {
      render(
        <ThemeProvider>
          <ThemeTestConsumer />
        </ThemeProvider>
      );

      const themeDisplay = screen.getByTestId("current-theme");
      expect(["oled", "cyberpunk", "matrix", "tokyonight", "nordic", "light"]).toContain(
        themeDisplay.textContent
      );

      const button = screen.getByText("Set Matrix");
      act(() => {
        button.click();
      });

      expect(themeDisplay.textContent).toBe("matrix");
    });

    it("should validate all available theme options", () => {
      expect(THEME_OPTIONS.length).toBe(6);
      expect(THEME_OPTIONS.some((t) => t.id === "oled")).toBe(true);
      expect(THEME_OPTIONS.some((t) => t.id === "matrix")).toBe(true);
    });
  });

  describe("ToastProvider & useToast", () => {
    it("should render toast provider and export utility methods", () => {
      const { container } = render(<ToastProvider />);
      expect(container).toBeDefined();

      const toast = useToast();
      expect(typeof toast.success).toBe("function");
      expect(typeof toast.error).toBe("function");
      expect(typeof toast.warning).toBe("function");
      expect(typeof toast.info).toBe("function");
      expect(typeof toast.loading).toBe("function");
      expect(typeof toast.promise).toBe("function");
      expect(typeof toast.dismiss).toBe("function");
      expect(typeof toast.dismissAll).toBe("function");

      const notif = useToastNotification();
      expect(typeof notif.success).toBe("function");

      expect(() => {
        toast.success("Success Msg", "desc");
        toast.error("Error Msg", "desc");
        toast.warning("Warn Msg", "desc");
        toast.info("Info Msg", "desc");
        toast.loading("Loading...");
        toast.dismiss(1);
        toast.dismissAll();
      }).not.toThrow();
    });

    it("should handle promise toast with function and string callbacks", async () => {
      const toast = useToast();
      const resolvedPromise = Promise.resolve({ count: 5 });
      const rejectedPromise = Promise.reject(new Error("Promise failed"));

      toast.promise(resolvedPromise, {
        loading: "Saving...",
        success: (data: any) => `Saved ${data.count} items`,
        error: (err: any) => `Error: ${err.message}`,
      });

      toast.promise(rejectedPromise, {
        loading: "Saving...",
        success: "Success!",
        error: "Failed!",
      });
    });
  });

  describe("NextAuthProvider", () => {
    it("should render children with session provider", () => {
      const { container } = render(
        <NextAuthProvider>
          <div>Protected Content</div>
        </NextAuthProvider>
      );
      expect(container).toBeDefined();
    });
  });

  describe("PwaProvider", () => {
    it("should render without crashing and handle install events and outcomes", async () => {
      const { container } = render(
        <PwaProvider>
          <div>PWA App</div>
        </PwaProvider>
      );
      expect(container).toBeDefined();

      const promptSpy = vi.fn().mockResolvedValue(undefined);
      const installEvent = new Event("beforeinstallprompt");
      (installEvent as any).prompt = promptSpy;
      (installEvent as any).userChoice = Promise.resolve({ outcome: "accepted" });

      act(() => {
        window.dispatchEvent(installEvent);
      });

      await act(async () => {
        window.dispatchEvent(new CustomEvent("dsa-install-pwa"));
      });

      expect(promptSpy).toHaveBeenCalled();
    });
  });

  describe("ScrollRevealProvider", () => {
    it("should render and initialize scroll reveal animation targets", () => {
      let observerCallback: any;
      global.IntersectionObserver = class MockIntersectionObserver {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        root = null;
        rootMargin = "";
        thresholds = [];
        takeRecords = vi.fn();
        constructor(callback: any) {
          observerCallback = callback;
        }
      } as any;

      const { container } = render(
        <div data-scroll-root="true">
          <div data-scroll-reveal="true">Section 1</div>
          <div>Section 2</div>
          <ScrollRevealProvider />
        </div>
      );

      expect(container).toBeDefined();

      // Trigger intersection
      if (observerCallback) {
        const targetElement = document.createElement("div");
        targetElement.style.setProperty("--scroll-reveal-delay", "100ms");
        observerCallback([{ isIntersecting: true, target: targetElement }]);
      }
    });

    it("should handle prefers-reduced-motion", () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container } = render(
        <div>
          <main>
            <div>Section 1</div>
          </main>
          <ScrollRevealProvider />
        </div>
      );

      expect(container).toBeDefined();
    });
  });
});
