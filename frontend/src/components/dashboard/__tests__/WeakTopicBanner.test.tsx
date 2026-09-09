import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import WeakTopicBanner from "../WeakTopicBanner";
import { dsaApi } from "../../../lib/api";

describe("WeakTopicBanner Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should not render when initialTopic is null", () => {
    render(<WeakTopicBanner initialTopic={null} />);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("should render weak topic banner when initialTopic is provided", () => {
    render(
      <WeakTopicBanner
        initialTopic={{
          id: "dp",
          name: "Dynamic Programming",
          topic: "Dynamic Programming",
          solve_rate: 0.25,
          percentage: 25,
          solved: 5,
          total: 20,
        }}
      />
    );

    expect(screen.getByRole("alert")).toBeDefined();
    expect(
      screen.getByText(/You've only solved 25% of Dynamic Programming problems/i)
    ).toBeDefined();

    const practiceLink = screen.getByRole("link", { name: /practice/i });
    expect(practiceLink.getAttribute("href")).toBe("/topics?focus=dp");
  });

  it("should fetch weak topic from dsaApi when initialTopic is undefined", async () => {
    vi.spyOn(dsaApi, "getWeakTopic").mockResolvedValueOnce({
      id: "graphs",
      name: "Graphs",
      topic: "Graphs",
      solve_rate: 0.1,
      percentage: 10,
      solved: 1,
      total: 10,
    });

    render(<WeakTopicBanner />);

    await waitFor(() => {
      expect(
        screen.getByText(/You've only solved 10% of Graphs problems/i)
      ).toBeDefined();
    });
  });

  it("should dismiss banner and save date to localStorage when dismiss button is clicked", () => {
    render(
      <WeakTopicBanner
        initialTopic={{
          id: "trees",
          name: "Trees",
          topic: "Trees",
          solve_rate: 0.3,
          percentage: 30,
          solved: 3,
          total: 10,
        }}
      />
    );

    expect(screen.getByRole("alert")).toBeDefined();

    const dismissBtn = screen.getByRole("button", {
      name: /dismiss weak topic alert/i,
    });
    fireEvent.click(dismissBtn);

    expect(screen.queryByRole("alert")).toBeNull();
    const today = new Date().toISOString().split("T")[0];
    expect(localStorage.getItem("weakTopicDismissedDate")).toBe(today);
  });

  it("should not render if already dismissed today in localStorage", () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("weakTopicDismissedDate", today);

    render(
      <WeakTopicBanner
        initialTopic={{
          id: "trees",
          name: "Trees",
          topic: "Trees",
          solve_rate: 0.3,
          percentage: 30,
          solved: 3,
          total: 10,
        }}
      />
    );

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("should calculate percentage from solve_rate and fallback to topic field if name is missing", () => {
    render(
      <WeakTopicBanner
        initialTopic={
          {
            topic: "Bit Manipulation",
            solve_rate: 0.15,
          } as any
        }
      />
    );

    expect(
      screen.getByText(/You've only solved 15% of Bit Manipulation problems/i)
    ).toBeDefined();
  });
});
