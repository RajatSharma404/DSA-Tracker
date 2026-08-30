import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CityHoloSimulator } from "../CityHoloSimulator";

describe("CityHoloSimulator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should switch architectures, build floors and reset grid", () => {
    render(<CityHoloSimulator />);
    expect(screen.getByText("Cyberpunk Spire")).toBeDefined();

    fireEvent.click(screen.getByText("Matrix Obelisk"));

    const buildBtn = screen.getByText("Deploy Algorithmic Floor");
    fireEvent.click(buildBtn);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    fireEvent.click(screen.getByText("Reset Grid"));
    expect(screen.getByText("SECTOR 07 FOUNDATION")).toBeDefined();
  });
});
