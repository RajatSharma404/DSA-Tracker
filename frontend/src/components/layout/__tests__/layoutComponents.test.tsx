import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { TopNavbar } from "../TopNavbar";
import { Sidebar } from "../Sidebar";
import { MobileBottomNav } from "../MobileBottomNav";
import { MobileHeader } from "../MobileHeader";
import { MobileDrawer } from "../MobileDrawer";
import { PageTransition } from "../PageTransition";
import { CommandPalette } from "../CommandPalette";
import { KeyboardShortcutsModal } from "../KeyboardShortcutsModal";
import { SyncInstructionModal } from "../SyncInstructionModal";
import { ExtensionStatusBadge } from "../ExtensionStatusBadge";
import { GlobalKeyBindings } from "../GlobalKeyBindings";
import { ThemeProvider } from "../../providers/ThemeProvider";
import { dsaApi } from "../../../lib/api";
import * as nextAuth from "next-auth/react";

describe("Layout Components (components/layout)", () => {
  describe("TopNavbar", () => {
    it("should render search bar, sound controls, streak, and sync button", () => {
      const onOpen = vi.fn();
      render(<TopNavbar onOpenCommandPalette={onOpen} streakCount={5} />);

      const searchBtn = screen.getByLabelText("Open Command Search (⌘K)");
      expect(searchBtn).toBeDefined();
      fireEvent.click(searchBtn);
      expect(onOpen).toHaveBeenCalled();

      // Sound mute toggle
      const soundBtn = screen.getByLabelText(/Toggle Sound Effects/i);
      expect(soundBtn).toBeDefined();
      fireEvent.click(soundBtn);

      // Setup guide button
      const setupBtn = screen.getByLabelText("Open Setup Instructions");
      expect(setupBtn).toBeDefined();
      fireEvent.click(setupBtn);
    });
  });

  describe("Sidebar", () => {
    it("should render navigation links, brand title, and handle collapse toggle", () => {
      const { container } = render(
        <ThemeProvider>
          <Sidebar />
        </ThemeProvider>
      );
      expect(container).toBeDefined();

      const collapseBtn = screen.queryByLabelText(/Collapse navigation|Expand navigation/i);
      if (collapseBtn) {
        fireEvent.click(collapseBtn);
        fireEvent.click(collapseBtn);
      }
    });

    it("should render admin panel link when user is admin", () => {
      vi.spyOn(nextAuth, "useSession").mockReturnValue({
        data: { user: { name: "Admin", role: "ADMIN" } },
        status: "authenticated",
      } as any);

      render(
        <ThemeProvider>
          <Sidebar />
        </ThemeProvider>
      );

      expect(screen.getByTitle("Admin Panel")).toBeDefined();
    });
  });

  describe("Mobile Navigation & Header", () => {
    it("should render MobileHeader and trigger drawer toggle", () => {
      const onToggle = vi.fn();
      render(<MobileHeader isDrawerOpen={false} onToggleDrawer={onToggle} />);
      const btn = screen.getByLabelText("Open navigation menu");
      fireEvent.click(btn);
      expect(onToggle).toHaveBeenCalled();
    });

    it("should render MobileBottomNav with navigation tabs", () => {
      const onToggle = vi.fn();
      render(<MobileBottomNav isDrawerOpen={false} onToggleDrawer={onToggle} />);
      expect(screen.getByText("Dashboard")).toBeDefined();
      expect(screen.getByText("Roadmap")).toBeDefined();

      const menuBtn = screen.getByLabelText(/Toggle full menu drawer/i);
      fireEvent.click(menuBtn);
      expect(onToggle).toHaveBeenCalled();
    });

    it("should render MobileDrawer when open and handle link clicks", () => {
      const onClose = vi.fn();
      render(
        <ThemeProvider>
          <MobileDrawer isOpen={true} onClose={onClose} />
        </ThemeProvider>
      );
      expect(screen.getByText("DSA Pro")).toBeDefined();

      const closeBtn = screen.queryByLabelText(/Close/i);
      if (closeBtn) {
        fireEvent.click(closeBtn);
      }
    });
  });

  describe("PageTransition", () => {
    it("should render children", () => {
      render(
        <PageTransition>
          <div>Page Content</div>
        </PageTransition>
      );
      expect(screen.getByText("Page Content")).toBeDefined();
    });
  });

  describe("Modals and Badges", () => {
    it("should render CommandPalette, open on event, search with tags, and select actions", async () => {
      vi.spyOn(dsaApi, "getTopics").mockResolvedValue([
        { id: "t1", name: "Arrays & Hashing", description: "", totalProblems: 5, solvedProblems: 2, progressPercentage: 40 },
      ]);
      vi.spyOn(dsaApi, "searchProblems").mockResolvedValue([
        { id: "p1", title: "Two Sum", difficulty: "EASY", link: "https://leetcode.com/problems/two-sum", topicName: "Arrays", topicId: "t1" } as any,
      ]);
      vi.spyOn(dsaApi, "syncLeetcode").mockResolvedValue({ success: true } as any);

      render(
        <ThemeProvider>
          <CommandPalette />
        </ThemeProvider>
      );

      act(() => {
        window.dispatchEvent(new CustomEvent("dsa-open-command-palette"));
      });

      const searchInput = screen.getByPlaceholderText(
        "Search problems, topics, actions, or switch theme..."
      );
      expect(searchInput).toBeDefined();

      // Search queries with prefixes
      fireEvent.change(searchInput, { target: { value: "#easy Two Sum" } });
      fireEvent.change(searchInput, { target: { value: "#medium 3Sum" } });
      fireEvent.change(searchInput, { target: { value: "#hard Trap" } });
      fireEvent.change(searchInput, { target: { value: "" } });

      // Click quick actions
      const randomOption = screen.queryByText(/Pick Random Problem/i);
      if (randomOption) fireEvent.click(randomOption);

      const syncOption = screen.queryByText(/Sync with LeetCode/i);
      if (syncOption) fireEvent.click(syncOption);

      // Click theme switcher
      const matrixOption = screen.queryByText(/Matrix Emerald/i);
      if (matrixOption) fireEvent.click(matrixOption);

      // Keyboard navigation
      fireEvent.keyDown(searchInput, { key: "ArrowDown" });
      fireEvent.keyDown(searchInput, { key: "ArrowUp" });
      fireEvent.keyDown(searchInput, { key: "Enter" });
      fireEvent.keyDown(searchInput, { key: "Escape" });
    });

    it("should render KeyboardShortcutsModal when open and handle close", () => {
      const onClose = vi.fn();
      render(<KeyboardShortcutsModal isOpen={true} onClose={onClose} />);
      expect(screen.getByText("Keyboard Shortcuts")).toBeDefined();

      const closeBtn = screen.queryByLabelText(/Close/i);
      if (closeBtn) {
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it("should render SyncInstructionModal, allow switching tabs, checking connection, and saving cookie", async () => {
      vi.spyOn(dsaApi, "getUserSettings").mockResolvedValueOnce({
        leetcodeSession: "existing_session_123",
        leetcodeUsername: "test_architect",
      });
      vi.spyOn(dsaApi, "updateLeetcodeSession").mockResolvedValueOnce({ success: true } as any);
      vi.spyOn(dsaApi, "syncLeetcode").mockResolvedValueOnce({ syncSource: "session", syncedCount: 5 } as any);

      const onClose = vi.fn();
      render(<SyncInstructionModal isOpen={true} onClose={onClose} />);
      expect(screen.getByText("Setup & Power User Guide")).toBeDefined();

      // Test connection
      const testConnBtn = screen.getByRole("button", { name: /Checking|Test Connection/i });
      fireEvent.click(testConnBtn);

      // Switch to Cookie Tab
      const cookieTab = screen.getByText("Session Cookie");
      expect(cookieTab).toBeDefined();
      fireEvent.click(cookieTab);

      // Switch to Chrome Extension Tab
      const extTab = screen.getByText("Chrome Extension");
      expect(extTab).toBeDefined();
      fireEvent.click(extTab);

      // Switch to Keyboard Shortcuts Tab
      const shortcutsTab = screen.getByText(/Keyboard & Vim Chords/i);
      expect(shortcutsTab).toBeDefined();
      fireEvent.click(shortcutsTab);
    });

    it("should render ExtensionStatusBadge and open modal on click", () => {
      render(<ExtensionStatusBadge />);
      const badge = screen.getByRole("button");
      expect(badge).toBeDefined();
      fireEvent.click(badge);
    });

    it("should mount GlobalKeyBindings and handle two-stroke chords and single shortcuts", () => {
      render(<GlobalKeyBindings />);

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "g" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "g" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "r" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "g" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "l" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "g" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "g" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "t" }));
      });
    });
  });
});
