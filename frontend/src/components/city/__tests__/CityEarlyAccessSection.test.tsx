import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CityEarlyAccessSection } from "../CityEarlyAccessSection";

describe("CityEarlyAccessSection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should submit citizen pass, copy and revoke", () => {
    render(<CityEarlyAccessSection />);
    expect(screen.getByText("Claim Your Metropolitan Citizen Pass")).toBeDefined();

    const classSelect = screen.getByRole("combobox");
    fireEvent.change(classSelect, { target: { value: "Dynamic Programmer" } });

    const input = screen.getByPlaceholderText("e.g. CyberGladiator or alex@code.dev");
    fireEvent.change(input, { target: { value: "alex@code.dev" } });

    fireEvent.click(screen.getByText("Mint VIP Citizen Pass"));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText("alex@code.dev")).toBeDefined();

    const copyBtn = screen.getAllByRole("button")[0];
    if (copyBtn) fireEvent.click(copyBtn);

    const revokeBtn = screen.getAllByRole("button").find((b) => b.querySelector("svg.lucide-x"));
    if (revokeBtn) fireEvent.click(revokeBtn);
  });
});
