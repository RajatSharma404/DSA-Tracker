import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatCard } from "../StatCard";
import { Flame } from "lucide-react";

describe("StatCard Component", () => {
  it("should render title, value, icon, and handle mouse tilt and leave", () => {
    const { container } = render(
      <StatCard
        title="Total Solved"
        value={42}
        icon={Flame}
        description="Problems solved"
        trend="+10%"
        trendUp={true}
      />
    );
    expect(screen.getByText("Total Solved")).toBeDefined();
    expect(screen.getByText("Problems solved")).toBeDefined();
    expect(screen.getByText("↑ +10%")).toBeDefined();

    const card = container.firstChild as HTMLElement;
    fireEvent.mouseMove(card, { clientX: 100, clientY: 50 });
    fireEvent.mouseLeave(card);
  });

  it("should render negative trend and string value", () => {
    render(
      <StatCard
        title="Streak Status"
        value="Master Level"
        icon={Flame}
        trend="-5%"
        trendUp={false}
        description="vs last week"
      />
    );
    expect(screen.getByText("↓ -5%")).toBeDefined();
    expect(screen.getByText("Master Level")).toBeDefined();
  });
});
