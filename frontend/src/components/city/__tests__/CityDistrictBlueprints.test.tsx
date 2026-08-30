import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CityDistrictBlueprints } from "../CityDistrictBlueprints";

describe("CityDistrictBlueprints", () => {
  it("should switch district blueprint tabs", () => {
    render(<CityDistrictBlueprints />);
    expect(screen.getAllByText("Arrays & Hash Grid").length).toBeGreaterThan(0);

    const dpTab = screen.getByText(/Two Pointers Corridor/i);
    fireEvent.click(dpTab);

    const windowTab = screen.getByText(/Sliding Window Lagoon/i);
    fireEvent.click(windowTab);
  });
});
