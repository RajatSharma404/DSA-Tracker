import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AnalyticsPage from "../page";
import { dsaApi } from "../../../../lib/api";
import { toast } from "sonner";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock @monaco-editor/react
vi.mock("@monaco-editor/react", () => {
  return {
    default: ({ onChange, value }: any) => (
      <textarea
        data-testid="monaco-editor-mock"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    ),
  };
});

// Mock Recharts ResponsiveContainer to render children with explicit dimensions for jsdom
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => (
      <div style={{ width: 500, height: 320 }}>{children}</div>
    ),
  };
});

describe("AnalyticsPage & CodeVis Sandbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(dsaApi, "getTimeAnalytics").mockResolvedValue({
      totalTimeMinutes: 240,
      totalSolved: 12,
      avgByDifficulty: { EASY: 8, MEDIUM: 18, HARD: 35 },
      weeklyTrends: [
        {
          week: "Week 1",
          solved: 4,
          avgTime: 12,
          avgEasy: 8,
          avgMedium: 15,
          avgHard: 25,
        },
      ],
      speedInsights: [
        {
          difficulty: "EASY",
          recentAvg: 7,
          olderAvg: 10,
          change: 30,
        },
      ],
      topicBreakdown: [
        { name: "Arrays", totalTime: 120, count: 6, avgTime: 20 },
      ],
      fastest: {
        title: "Two Sum",
        topicName: "Arrays",
        timeSpent: 5,
        difficulty: "EASY",
      },
      slowest: null,
    });

    vi.spyOn(dsaApi, "getProductivityAnalytics").mockResolvedValue({});
    vi.spyOn(dsaApi, "getInterviewReadiness").mockResolvedValue({
      score: 85,
      level: "STRONG",
      metrics: {
        timedMediumHard: 80,
        consistency14d: 85,
        revisionReliability: 90,
        topicCoverage: 75,
      },
      snapshot: {
        solvedLast14d: 14,
        solvedTotal: 45,
        mediumHardSolved: 28,
        coveredTopics: 8,
        totalTopics: 12,
      },
    });

    vi.spyOn(dsaApi, "getTopicBreakdown").mockResolvedValue([
      { topic: "Arrays", subject: "Arrays", percentage: 75, solved: 6, total: 8 },
      { topic: "Trees", subject: "Trees", percentage: 50, solved: 3, total: 6 },
    ]);

    vi.spyOn(dsaApi, "getWeeklyStats").mockResolvedValue({
      weeks: [
        { week: "Week of Jan 12", solved: 2 },
        { week: "Week of Jan 19", solved: 5 },
      ],
      average: 3.5,
    });

    vi.spyOn(dsaApi, "getDifficultyByMonth").mockResolvedValue([
      { month: "Jan", easy: 3, medium: 2, hard: 1, total: 6 },
      { month: "Feb", easy: 4, medium: 3, hard: 2, total: 9 },
    ]);
  });

  it("renders the 3 new Recharts charts with cards and titles", async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Topic Mastery Radar")).toBeDefined();
      expect(screen.getByText("Weekly Solve Velocity")).toBeDefined();
      expect(screen.getByText("Difficulty Ramp")).toBeDefined();
    });

    // Check one-line descriptions
    expect(
      screen.getByText("Multi-axis mastery percentage across algorithm categories.")
    ).toBeDefined();
    expect(
      screen.getByText("8-week problem completion rate with average pace benchmark.")
    ).toBeDefined();
    expect(
      screen.getByText("Monthly progression across Easy, Medium, and Hard problem tiers.")
    ).toBeDefined();
  });

  it("renders CodeVis Sandbox, handles language switches, and generates flowchart", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        nodes: [
          { id: "1", type: "start", label: "Start function", line: 1 },
          { id: "2", type: "process", label: "binarySearch loop", line: 4 },
        ],
        edges: [{ from: "1", to: "2" }],
      }),
    });
    global.fetch = mockFetch;

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("🔀 Visualize Any Code")).toBeDefined();
    });

    expect(
      screen.getByText("Paste any snippet to see its control flow")
    ).toBeDefined();

    // Test language switch
    const cppBtn = screen.getByRole("button", { name: "C++" });
    fireEvent.click(cppBtn);

    const textarea = screen.getByTestId("monaco-editor-mock");
    expect((textarea as HTMLTextAreaElement).value).toContain("C++ function snippet");

    // Generate flowchart
    const generateBtn = screen.getByRole("button", {
      name: /Generate Flowchart/i,
    });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "https://codevis-backend.onrender.com/analyze",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"lang":"cpp"'),
        })
      );
    });

    // Flowchart output should appear
    await waitFor(() => {
      expect(screen.getByText("binarySearch loop")).toBeDefined();
    });
  });

  it("falls back to local AST engine when remote CodeVis API fails", async () => {
    const mockFetch = vi.fn().mockRejectedValueOnce(new Error("CodeVis error"));
    global.fetch = mockFetch;

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("🔀 Visualize Any Code")).toBeDefined();
    });

    const generateBtn = screen.getByRole("button", {
      name: /Generate Flowchart/i,
    });
    fireEvent.click(generateBtn);

    // Should fall back to local AST engine and display flowchart without crashing
    await waitFor(() => {
      expect(screen.getAllByText(/binary_search/i).length).toBeGreaterThan(0);
    });
  });

  it("handles empty code with toast error", async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("🔀 Visualize Any Code")).toBeDefined();
    });

    const textarea = screen.getByTestId("monaco-editor-mock");
    fireEvent.change(textarea, { target: { value: "   " } });

    const generateBtn = screen.getByRole("button", {
      name: /Generate Flowchart/i,
    });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please provide code to visualize."
      );
    });
  });
});
