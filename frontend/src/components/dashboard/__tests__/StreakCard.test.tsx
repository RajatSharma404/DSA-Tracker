import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import StreakCard from "../StreakCard";
import { dsaApi } from "../../../lib/api";

describe("StreakCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render active streak from props without loading state", () => {
    render(<StreakCard streak={5} longestStreak={10} />);

    expect(screen.getByText(/5 day streak/i)).toBeDefined();
    expect(screen.getByText("10 days")).toBeDefined();
  });

  it("should render zero streak prompt when streak is 0", () => {
    render(<StreakCard streak={0} longestStreak={0} />);

    expect(screen.getByText(/Start your streak today!/i)).toBeDefined();
    expect(screen.getByText("0 days")).toBeDefined();
  });

  it("should fetch streak data from API when props are not provided", async () => {
    vi.spyOn(dsaApi, "getStreak").mockResolvedValueOnce({
      currentStreak: 7,
      longestStreak: 14,
    });

    render(<StreakCard />);

    await waitFor(() => {
      expect(screen.getByText(/7 day streak/i)).toBeDefined();
      expect(screen.getByText("14 days")).toBeDefined();
    });
  });

  it("should handle singular day for longest streak of 1", () => {
    render(<StreakCard streak={1} longestStreak={1} />);

    expect(screen.getByText(/1 day streak/i)).toBeDefined();
    expect(screen.getByText("1 day")).toBeDefined();
  });
});
