import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import FlashcardsPage from "../page";
import { soundEffects } from "@/lib/soundEffects";
import { toast } from "sonner";

vi.mock("@/lib/soundEffects", () => ({
  soundEffects: {
    playClick: vi.fn(),
    playToggle: vi.fn(),
    playSuccess: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Phase 4b: Flashcards Keyboard Navigation Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should flip card using Space key and flip back using Enter key", () => {
    render(<FlashcardsPage />);

    // Initially front shows "Tap or Space to Reveal"
    expect(screen.getByText(/Tap or Space to Reveal/i)).toBeInTheDocument();
    expect(screen.queryByText(/Click to Flip Front/i)).not.toBeInTheDocument();

    // Press Space to flip
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " " }));
    });
    expect(soundEffects.playToggle).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Click to Flip Front/i)).toBeInTheDocument();
    expect(screen.getByText(/Key Invariant Formula/i)).toBeInTheDocument();

    // Press Enter to flip back
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", key: "Enter" }));
    });
    expect(soundEffects.playToggle).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/Tap or Space to Reveal/i)).toBeInTheDocument();
    expect(screen.queryByText(/Click to Flip Front/i)).not.toBeInTheDocument();
  });

  it("should rate card using number keys 1-4 and advance to next card", () => {
    render(<FlashcardsPage />);

    expect(screen.getAllByText(/Prefix Sum & Subarray Query Invariant/i).length).toBeGreaterThan(0);

    // Press '4' (Easy)
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "4" }));
    });
    expect(soundEffects.playSuccess).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('SM-2 Interval expanded for "Prefix Sum & Subarray Query Invariant"'),
    );

    // Should have advanced to next card
    expect(screen.getAllByText(/Two Pointers: Converging Invariant/i).length).toBeGreaterThan(0);

    // Press '1' (Again)
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
    });
    expect(toast.info).toHaveBeenCalledWith(
      expect.stringContaining('Scheduled for short-interval recall: "Two Pointers: Converging Invariant"'),
    );
  });

  it("should flip back to front when Escape is pressed on back of card", () => {
    render(<FlashcardsPage />);

    // Flip to back
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " " }));
    });
    expect(screen.getByText(/Click to Flip Front/i)).toBeInTheDocument();

    // Press Escape
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(screen.getByText(/Tap or Space to Reveal/i)).toBeInTheDocument();
    expect(screen.queryByText(/Click to Flip Front/i)).not.toBeInTheDocument();
  });

  it("should navigate previous and next cards using arrow keys", () => {
    render(<FlashcardsPage />);

    expect(screen.getAllByText(/Prefix Sum & Subarray Query Invariant/i).length).toBeGreaterThan(0);

    // ArrowRight -> Next card
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    });
    expect(screen.getAllByText(/Two Pointers: Converging Invariant/i).length).toBeGreaterThan(0);

    // ArrowLeft -> Back to first card
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    });
    expect(screen.getAllByText(/Prefix Sum & Subarray Query Invariant/i).length).toBeGreaterThan(0);
  });
});
