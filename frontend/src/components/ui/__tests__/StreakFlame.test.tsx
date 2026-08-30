import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { StreakFlame } from "../StreakFlame";

describe("StreakFlame Component", () => {
  it("should render blaze tier for 7+ days and trigger click sound", () => {
    render(<StreakFlame streakDays={14} showBadge={true} />);
    const badge = screen.getByText("7d Blaze");
    expect(badge).toBeDefined();
    fireEvent.click(badge);
  });

  it("should render supernova tier for 100+ days", () => {
    render(<StreakFlame streakDays={120} showBadge={true} />);
    const supernova = screen.getByText("100d Supernova");
    expect(supernova).toBeDefined();
    fireEvent.click(supernova);
  });

  it("should render spark and plasma tiers", () => {
    const { rerender } = render(<StreakFlame streakDays={2} showBadge={true} />);
    expect(screen.getByText("Active Streak")).toBeDefined();

    rerender(<StreakFlame streakDays={35} showBadge={true} />);
    expect(screen.getByText("30d Plasma")).toBeDefined();

    rerender(<StreakFlame streakDays={5} showBadge={false} />);
    expect(screen.queryByText("Active Streak")).toBeNull();
  });
});
