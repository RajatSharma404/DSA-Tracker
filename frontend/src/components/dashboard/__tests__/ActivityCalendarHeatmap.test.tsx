import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ActivityCalendarHeatmap from "../ActivityCalendarHeatmap";
import { dsaApi } from "../../../lib/api";

describe("ActivityCalendarHeatmap Component", () => {
  const sampleData = [
    { date: "2026-09-08", count: 2 },
    { date: "2026-09-09", count: 5 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render activity heatmap from props and show total problems solved", () => {
    render(<ActivityCalendarHeatmap data={sampleData} />);

    expect(screen.getByText("Activity Heatmap")).toBeDefined();
    expect(
      screen.getByText(/7 problems solved in the last year/i)
    ).toBeDefined();
    expect(screen.getByText("Less")).toBeDefined();
    expect(screen.getByText("More")).toBeDefined();
  });

  it("should fetch heatmap data from API when propData is undefined", async () => {
    vi.spyOn(dsaApi, "getHeatmap").mockResolvedValueOnce([
      { date: "2026-09-01", count: 3 },
      { date: "2026-09-02", count: 1 },
    ]);

    render(<ActivityCalendarHeatmap />);

    await waitFor(() => {
      expect(screen.getByText("Activity Heatmap")).toBeDefined();
      expect(
        screen.getByText(/4 problems solved in the last year/i)
      ).toBeDefined();
    });
  });

  it("should handle empty data gracefully", () => {
    render(<ActivityCalendarHeatmap data={[]} />);

    expect(screen.getByText("Activity Heatmap")).toBeDefined();
    expect(
      screen.getByText(/0 problems solved in the last year/i)
    ).toBeDefined();
  });
});
