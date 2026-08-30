import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import DailyFocus from "../DailyFocus";
import BadgeShowcase from "../BadgeShowcase";
import SkillRadar from "../SkillRadar";
import LeetCodeSync from "../LeetCodeSync";
import AIMentorHint from "../AIMentorHint";
import AlgoPlayground from "../AlgoPlayground";
import ProblemNotes from "../ProblemNotes";
import ActivityHeatmap from "../ActivityHeatmap";
import { SolutionHistory } from "../SolutionHistory";
import TopicStudyGuide from "../TopicStudyGuide";
import { UserInspectorModal } from "../UserInspectorModal";
import { CityLeaderboard } from "../CityLeaderboard";
import { CityLevelPath } from "../CityLevelPath";
import { CodeEditor } from "../CodeEditor";
import { LeetCodeEditor } from "../LeetCodeEditor";
import AICodeArchitect from "../AICodeArchitect";
import { ReviewForm } from "../AICodeArchitect/ReviewForm";
import { ReviewResult } from "../AICodeArchitect/ReviewResult";
import { StructuredReport, StructuredReview } from "../AICodeArchitect/StructuredReport";
import { dsaApi } from "../../../lib/api";

describe("Dashboard Components (components/dashboard)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
  });

  describe("DailyFocus", () => {
    it("should render daily problem, session plan, click solve, view topic, and attempt challenge", async () => {
      vi.spyOn(dsaApi, "getDailyProblem").mockResolvedValueOnce({
        source: "WEAKNESS",
        reason: "Practice your weakest topic",
        problem: {
          id: "prob-1",
          title: "Two Sum",
          difficulty: "EASY",
          link: "https://leetcode.com/problems/two-sum",
          topicName: "Arrays",
          topicId: "top-1",
        },
        plan: [
          { id: "p1", title: "Two Sum", difficulty: "EASY", topicName: "Arrays" },
          { id: "p2", title: "Contains Duplicate", difficulty: "EASY", topicName: "Arrays" },
        ],
      } as any);

      vi.spyOn(dsaApi, "getLeetcodeDailyChallenge").mockResolvedValueOnce({
        link: "/problems/daily-challenge",
        question: {
          title: "Daily LeetCode Challenge",
          difficulty: "MEDIUM",
          topicTags: [{ name: "Dynamic Programming" }],
        },
      } as any);

      render(<DailyFocus />);
      await waitFor(() => {
        expect(screen.getByText("Two Sum")).toBeDefined();
      });
      expect(screen.getByText("Arrays")).toBeDefined();
      expect(screen.getByText("Daily LeetCode Challenge")).toBeDefined();

      const solveBtn = screen.getByText("Solve Now");
      fireEvent.click(solveBtn);

      const viewBtn = screen.getByText("View");
      fireEvent.click(viewBtn);

      const attemptBtn = screen.getByText("Attempt Challenge");
      fireEvent.click(attemptBtn);
    });

    it("should render all problems completed celebration view", async () => {
      vi.spyOn(dsaApi, "getDailyProblem").mockResolvedValueOnce({
        message: "ALL_PROBLEMS_SOLVED",
      } as any);
      vi.spyOn(dsaApi, "getLeetcodeDailyChallenge").mockResolvedValueOnce(null as any);

      render(<DailyFocus />);
      await waitFor(() => {
        expect(screen.getByText(/All Problems Conquered/i)).toBeDefined();
      });
    });
  });

  describe("BadgeShowcase", () => {
    it("should render badges and counts", async () => {
      vi.spyOn(dsaApi, "getAchievements").mockResolvedValueOnce({
        badges: [
          { id: "first-blood", name: "First Blood", icon: "🩸", unlocked: true },
          { id: "streak-7", name: "Week Warrior", icon: "🔥", unlocked: false, progress: 50 },
        ],
        stats: {
          totalBadges: 2,
          unlocked: 1,
          totalSolved: 1,
          currentStreak: 3,
          longestStreak: 4,
          completedTopics: 0,
        },
      });

      render(<BadgeShowcase />);
      await waitFor(() => {
        expect(screen.getByText("Badges")).toBeDefined();
      });
      expect(screen.getByText("1/2")).toBeDefined();
    });
  });

  describe("SkillRadar", () => {
    it("should render radar component with mastery stats", async () => {
      vi.spyOn(dsaApi, "getMasteryStats").mockResolvedValueOnce([
        { subject: "Arrays", A: 80, fullMark: 100 },
        { subject: "DP", A: 50, fullMark: 100 },
      ]);
      render(<SkillRadar />);
      await waitFor(() => {
        expect(screen.getByText("Mastery Radar")).toBeDefined();
      });
    });
  });

  describe("LeetCodeSync", () => {
    it("should render LeetCode sync, update username, save session, and trigger sync", async () => {
      vi.spyOn(dsaApi, "getUserSettings").mockResolvedValueOnce({
        leetcodeUsername: "algo_expert",
      });
      vi.spyOn(dsaApi, "updateLeetcodeUsername").mockResolvedValueOnce({ success: true } as any);
      vi.spyOn(dsaApi, "updateLeetcodeSession").mockResolvedValueOnce({ success: true } as any);
      vi.spyOn(dsaApi, "syncLeetcode").mockResolvedValueOnce({
        syncedCount: 2,
        syncedProblems: ["Two Sum", "3Sum"],
        syncSource: "EXTENSION",
        warning: null,
      } as any);

      const onSyncComplete = vi.fn();
      render(<LeetCodeSync onSyncComplete={onSyncComplete} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("algo_expert")).toBeDefined();
      });

      // Save username
      const usernameInput = screen.getByDisplayValue("algo_expert");
      fireEvent.change(usernameInput, { target: { value: "rajat_coder" } });
      const saveUserBtn = usernameInput.parentElement?.querySelector("button");
      if (saveUserBtn) fireEvent.click(saveUserBtn);

      // Save session
      const sessionInput = screen.getByPlaceholderText(/LEETCODE_SESSION/i);
      fireEvent.change(sessionInput, { target: { value: "LEETCODE_SESSION=abc123xyz" } });
      const saveSessionBtn = sessionInput.parentElement?.querySelector("button");
      if (saveSessionBtn) fireEvent.click(saveSessionBtn);

      // Sync now
      const syncBtn = screen.getByText("Sync Now");
      fireEvent.click(syncBtn);
    });
  });

  describe("AIMentorHint", () => {
    it("should fetch and render AI hint on request", async () => {
      vi.spyOn(dsaApi, "getAIHint").mockResolvedValueOnce({
        hint: "Consider using a hash map to look up complements in O(1).",
      });

      render(<AIMentorHint problemId="p1" problemTitle="Two Sum" />);
      const btn = screen.getByText("Get Mentor Insight");
      fireEvent.click(btn);

      await waitFor(() => {
        expect(screen.getByText(/hash map/i)).toBeDefined();
      });
    });
  });

  describe("AlgoPlayground", () => {
    it("should generate trace and exercise all playback controls (next, prev, play/pause, reset, timeline)", async () => {
      vi.spyOn(dsaApi, "getAlgoTrace").mockResolvedValueOnce({
        trace: {
          sampleInput: "[2, 7, 11, 15], target = 9",
          expectedOutput: "[0, 1]",
          approach: "Hash Map Complement",
          steps: [
            {
              step: 1,
              phase: "INIT",
              codeLine: "const map = new Map();",
              narrative: "Initialize complement map",
              thinking: "Map will store visited numbers",
              variables: [{ name: "i", value: "0", changed: true }],
              dataStructure: {
                type: "array",
                label: "nums",
                items: [
                  { value: "2", state: "active" },
                  { value: "7", state: "default" },
                ],
              },
            },
            {
              step: 2,
              phase: "FOUND",
              codeLine: "return [map.get(complement), i];",
              narrative: "Found complement in map",
              thinking: "O(1) lookup",
              variables: [{ name: "i", value: "1", changed: true }],
              dataStructure: {
                type: "array",
                label: "nums",
                items: [
                  { value: "2", state: "highlight" },
                  { value: "7", state: "highlight" },
                ],
              },
            },
          ],
        },
      } as any);

      render(
        <AlgoPlayground
          problemId="p1"
          problemTitle="Two Sum"
          initialCode="function twoSum() { return [0, 1]; }"
        />
      );

      const genBtn = screen.getByText("Generate Dry Run");
      expect(genBtn).toBeDefined();
      fireEvent.click(genBtn);

      await waitFor(() => {
        expect(screen.getByText(/Strategy:\s*Hash Map Complement/i)).toBeDefined();
        expect(screen.getByText("Initialize complement map")).toBeDefined();
      });

      // Next step
      const forwardBtn = screen.getAllByRole("button").find((b) => b.querySelector("svg.lucide-skip-forward"));
      if (forwardBtn) fireEvent.click(forwardBtn);

      // Prev step
      const backBtn = screen.getAllByRole("button").find((b) => b.querySelector("svg.lucide-skip-back"));
      if (backBtn) fireEvent.click(backBtn);

      // Play / Pause toggle
      const playBtn = screen.getAllByRole("button").find((b) => b.querySelector("svg.lucide-play"));
      if (playBtn) {
        fireEvent.click(playBtn);
        fireEvent.click(playBtn);
      }

      // Reset
      const resetBtn = screen.getAllByRole("button").find((b) => b.querySelector("svg.lucide-rotate-ccw"));
      if (resetBtn) fireEvent.click(resetBtn);

      // Play speed
      const speedBtn = screen.queryByText("2x");
      if (speedBtn) fireEvent.click(speedBtn);
    });
  });

  describe("ProblemNotes", () => {
    it("should render notes trigger, open notes modal, add note, switch types, and delete note", async () => {
      vi.spyOn(dsaApi, "getNotes").mockResolvedValueOnce([
        { id: "n1", content: "Remember base case", type: "LEARNING", createdAt: new Date().toISOString() },
      ]);
      vi.spyOn(dsaApi, "createNote").mockResolvedValueOnce({
        id: "n2",
        content: "Be mindful of edge cases",
        type: "GOTCHA",
        createdAt: new Date().toISOString(),
      } as any);
      vi.spyOn(dsaApi, "deleteNote").mockResolvedValueOnce({ success: true } as any);

      render(<ProblemNotes problemId="p1" />);
      const btn = screen.getByText(/Notes/i);
      expect(btn).toBeDefined();
      fireEvent.click(btn);

      await waitFor(() => {
        expect(screen.getByText("Remember base case")).toBeDefined();
      });

      // Click Add
      const addBtn = screen.getByText("Add");
      fireEvent.click(addBtn);

      // Switch type to GOTCHA
      const gotchaBtn = screen.getByText(/Gotcha/i);
      fireEvent.click(gotchaBtn);

      // Type note content
      const textarea = screen.getByPlaceholderText(/Write your note/i);
      fireEvent.change(textarea, { target: { value: "Be mindful of edge cases" } });

      // Save Note
      const saveBtn = screen.getByText("Save");
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText("Be mindful of edge cases")).toBeDefined();
      });

      // Delete note
      const deleteButtons = screen.getAllByRole("button").filter((b) => b.querySelector("svg.lucide-trash2"));
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
      }
    });
  });

  describe("ActivityHeatmap", () => {
    it("should render year selector, summary metrics, and activity matrix", () => {
      const mockActivity = [
        { date: "2026-01-05", count: 3 },
        { date: "2026-02-14", count: 7 },
        { date: "2026-08-20", count: 1 },
      ];

      render(<ActivityHeatmap data={mockActivity} />);
      expect(screen.getByText("11 Solved")).toBeDefined();
      expect(screen.getByText("Mastery Consistency")).toBeDefined();
    });
  });

  describe("SolutionHistory", () => {
    it("should load and display previous solutions with complexity tags", async () => {
      vi.spyOn(dsaApi, "getSolutionHistory").mockResolvedValueOnce([
        {
          id: "sol-1",
          code: "class Solution { public: int solve() { return 1; } };",
          language: "cpp",
          verdict: "ACCEPTED",
          score: 100,
          timeComplexity: "O(N)",
          spaceComplexity: "O(1)",
          isAIGenerated: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "sol-2",
          code: "class Solution { public: int solve() { return 0; } };",
          language: "cpp",
          verdict: "WRONG_ANSWER",
          score: 30,
          timeComplexity: "O(N^2)",
          spaceComplexity: "O(N)",
          isAIGenerated: true,
          createdAt: new Date().toISOString(),
        },
      ]);

      render(<SolutionHistory problemId="p1" />);
      await waitFor(() => {
        expect(screen.getByText(/Submission History/i)).toBeDefined();
        expect(screen.getByText("ACCEPTED")).toBeDefined();
      });
    });
  });

  describe("TopicStudyGuide", () => {
    it("should render study guide trigger, expand all, toggle all sections, copy code, and collapse", () => {
      render(<TopicStudyGuide topicName="Arrays" />);
      const guideBtn = screen.getByText(/Study Guide/i);
      expect(guideBtn).toBeDefined();

      fireEvent.click(guideBtn);
      expect(screen.getByText("What Are Arrays & Why They Matter")).toBeDefined();

      // Toggle Pattern Recognition
      const patternBtn = screen.getByText(/Pattern Recognition/i);
      fireEvent.click(patternBtn);

      // Toggle C++ STL Reference
      const stlBtn = screen.getByText(/C\+\+ STL Quick Reference/i);
      fireEvent.click(stlBtn);

      // Toggle Complexity Reference
      const complexityBtn = screen.getByText(/Complexity Reference/i);
      fireEvent.click(complexityBtn);

      // Toggle Worked Example
      const exampleBtn = screen.getByText(/Worked Example/i);
      fireEvent.click(exampleBtn);

      const expandBtn = screen.getByText("Expand All");
      fireEvent.click(expandBtn);

      // Copy example code
      const copyButtons = screen.getAllByRole("button").filter((b) => b.querySelector("svg.lucide-copy"));
      if (copyButtons.length > 0) {
        fireEvent.click(copyButtons[0]);
      }

      const collapseBtn = screen.getByText("Collapse All");
      fireEvent.click(collapseBtn);

      // Expand first section again
      const sectionBtn = screen.getByText("What Are Arrays & Why They Matter");
      fireEvent.click(sectionBtn);
      expect(screen.getByText("Key Takeaways")).toBeDefined();
    });

    it("should render C++ basics guide with STL reference sections", () => {
      render(<TopicStudyGuide topicName="c++ basics for dsa" />);
      const guideBtn = screen.getByText(/Study Guide/i);
      fireEvent.click(guideBtn);

      const expandBtn = screen.getByText("Expand All");
      fireEvent.click(expandBtn);
      expect(screen.getByText("Key Takeaways")).toBeDefined();
    });

    it("should return null for non-existent topic study guide", () => {
      const { container } = render(<TopicStudyGuide topicName="Unknown Topic XYZ" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("UserInspectorModal", () => {
    it("should render user profile, handle top close and bottom close", () => {
      const onClose = vi.fn();
      const onViewPath = vi.fn();

      // Tier 1: Grand Cyber Architect (> 20)
      const { rerender } = render(
        <UserInspectorModal
          user={{
            id: "u2",
            username: "CyberArchitect",
            completedLevels: 25,
          }}
          currentUserId="u1"
          rank={1}
          onClose={onClose}
          onViewPath={onViewPath}
        />
      );
      expect(screen.getByText("Grand Cyber Architect")).toBeDefined();

      // Click top close button
      const topCloseBtn = screen.getAllByRole("button").find((b) => b.querySelector("svg.lucide-x"));
      if (topCloseBtn) {
        fireEvent.click(topCloseBtn);
        expect(onClose).toHaveBeenCalled();
      }

      // Tier 2: Skyscraper Master (> 10)
      rerender(
        <UserInspectorModal
          user={{
            id: "u3",
            username: "SkyMaster",
            completedLevels: 14,
          }}
          currentUserId="u1"
          rank={2}
          onClose={onClose}
        />
      );
      expect(screen.getByText("Skyscraper Master")).toBeDefined();

      // Tier 3: Urban Developer (> 3)
      rerender(
        <UserInspectorModal
          user={{
            id: "u4",
            username: "UrbanDev",
            completedLevels: 6,
          }}
          currentUserId="u1"
          rank={5}
          onClose={onClose}
        />
      );
      expect(screen.getByText("Urban Developer")).toBeDefined();

      // Tier 4: Foundation Builder (<= 3)
      rerender(
        <UserInspectorModal
          user={{
            id: "u1",
            username: "NoviceCoder",
            completedLevels: 2,
          }}
          currentUserId="u1"
          rank={10}
          onClose={onClose}
        />
      );
      expect(screen.getByText("Foundation Builder")).toBeDefined();

      const closeBtn = screen.getByText("Close Inspector");
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });

    it("should return null when user is null", () => {
      const { container } = render(
        <UserInspectorModal
          user={null}
          currentUserId="u1"
          rank={1}
          onClose={vi.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("CityLeaderboard & CityLevelPath", () => {
    it("should render CityLeaderboard, handle user hover, mouseLeave, and clicks across all BuildingIcon tiers", () => {
      const mockUsers = [
        { id: "u1", username: "Alice", completedLevels: 25 },
        { id: "u2", username: "Bob", completedLevels: 12 },
        { id: "u3", username: "Charlie", completedLevels: 4 },
        { id: "u4", username: "Dave", completedLevels: 0 },
      ];
      const onHover = vi.fn();
      const onClick = vi.fn();

      render(
        <CityLeaderboard
          users={mockUsers}
          currentUserId="u1"
          hoveredUserId="u2"
          onHoverUser={onHover}
          onClickUser={onClick}
        />
      );
      const userCard = screen.getByText("Alice");
      expect(userCard).toBeDefined();
      fireEvent.mouseEnter(userCard);
      expect(onHover).toHaveBeenCalledWith("u1");

      fireEvent.mouseLeave(userCard);
      expect(onHover).toHaveBeenCalledWith(null);

      fireEvent.click(userCard);
      expect(onClick).toHaveBeenCalledWith("u1");
    });

    it("should render CityLevelPath and handle levelCleared event, level clicks, and empty levels", () => {
      const mockLevels = [
        {
          id: "lvl-1",
          name: "Arrays District",
          isCompleted: true,
          progress: {
            easy: { solved: 5, required: 5, total: 5 },
            medium: { solved: 3, required: 3, total: 3 },
            hard: { solved: 1, required: 1, total: 1 },
          },
        },
        {
          id: "lvl-2",
          name: "Trees District",
          isCompleted: false,
          progress: {
            easy: { solved: 2, required: 5, total: 5 },
            medium: { solved: 1, required: 3, total: 3 },
            hard: { solved: 0, required: 1, total: 1 },
          },
        },
        {
          id: "lvl-3",
          name: "Graphs District",
          isCompleted: false,
          progress: {
            easy: { solved: 0, required: 5, total: 5 },
            medium: { solved: 0, required: 3, total: 3 },
            hard: { solved: 0, required: 1, total: 1 },
          },
        },
      ];
      const { rerender } = render(<CityLevelPath levels={mockLevels} />);
      expect(screen.getByText("Arrays District")).toBeDefined();

      const currentLvl = screen.getByText("Trees District");
      fireEvent.click(currentLvl);

      act(() => {
        window.dispatchEvent(new Event("levelCleared"));
      });

      rerender(<CityLevelPath levels={[]} />);
      expect(screen.getByText("No levels found.")).toBeDefined();
    });
  });

  describe("CodeEditor & LeetCodeEditor", () => {
    it("should render CodeEditor and handle code updates", () => {
      render(<CodeEditor initialCode="int main() {}" />);
      expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();

      const textarea = screen.getByTestId("monaco-editor-mock");
      fireEvent.change(textarea, { target: { value: "int main() { return 0; }" } });
    });

    it("should render LeetCodeEditor loading state or editor", () => {
      render(
        <LeetCodeEditor
          problemSlug="two-sum"
          problemTitle="Two Sum"
          problemId="p1"
        />
      );
      expect(screen.getByText("Loading code templates...")).toBeDefined();
    });
  });

  describe("AICodeArchitect Sub-components", () => {
    it("should render ReviewForm, select LeetCode submission, and clear code", async () => {
      const onCodeChange = vi.fn();
      const onReview = vi.fn();
      vi.spyOn(dsaApi, "getLeetcodeSubmissions").mockResolvedValueOnce([
        { id: "sub-123", statusDisplay: "Accepted", lang: "cpp", timestamp: 1700000000 },
      ]);
      vi.spyOn(dsaApi, "getLeetcodeSubmissionCode").mockResolvedValueOnce({
        code: "class Solution { public: vector<int> twoSum() {} };",
      });

      render(
        <ReviewForm
          problemId="p1"
          problemTitle="Two Sum"
          code="int main() {}"
          onCodeChange={onCodeChange}
          onReview={onReview}
          isReviewing={false}
        />
      );

      const triggerBtn = screen.getByText("Begin Code Analysis");
      expect(triggerBtn).toBeDefined();
      fireEvent.click(triggerBtn);

      await waitFor(() => {
        expect(screen.getByText(/Sync Solution from LeetCode/i)).toBeDefined();
      });

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "sub-123" } });

      await waitFor(() => {
        expect(onCodeChange).toHaveBeenCalledWith("class Solution { public: vector<int> twoSum() {} };");
      });

      // Clear code
      window.confirm = vi.fn().mockReturnValue(true);
      const clearBtn = screen.getByLabelText("Clear code");
      fireEvent.click(clearBtn);
      expect(onCodeChange).toHaveBeenCalledWith("");
    });

    it("should render StructuredReport with detailed verdict breakdown", () => {
      const mockReview: StructuredReview = {
        verdict: "OPTIMAL",
        summary: "Optimal hash table approach with O(N) time and O(N) space.",
        efficiency: {
          timeComplexity: "O(N)",
          timeExplanation: "Single pass over the input array",
          spaceComplexity: "O(N)",
          spaceExplanation: "Hash map storage for complements",
          isOptimal: true,
          optimalNote: "Cannot be solved faster than linear time",
        },
        logic: {
          isCorrect: true,
          explanation: "Accurately maps values to their indices",
          edgeCases: [
            { case: "Duplicate numbers adding to target", handled: true, note: "Handled properly" },
          ],
        },
        cleanCode: [{ suggestion: "Use reserve on unordered_map", example: "mp.reserve(nums.size());" }],
        proTip: "Use std::unordered_map::reserve to eliminate rehashing overhead.",
      };

      render(<StructuredReport data={mockReview} />);
      expect(screen.getByText("OPTIMAL")).toBeDefined();
      expect(screen.getByText(/Cannot be solved faster/i)).toBeDefined();
      expect(screen.getByText(/Use reserve on unordered_map/i)).toBeDefined();
    });

    it("should render ReviewResult with copy functionality for both structured and markdown, and loading state", () => {
      const mockReview: StructuredReview = {
        verdict: "GOOD",
        summary: "Good solution",
        efficiency: {
          timeComplexity: "O(N log N)",
          timeExplanation: "Sorting step",
          spaceComplexity: "O(1)",
          spaceExplanation: "In-place",
          isOptimal: false,
          optimalNote: "Can use hash map",
        },
        logic: {
          isCorrect: true,
          explanation: "Two pointers after sorting",
          edgeCases: [],
        },
        cleanCode: [],
        proTip: "Try hash map next",
      };

      const { rerender } = render(
        <ReviewResult
          loading={false}
          review={{ type: "structured", data: mockReview }}
          problemId="p1"
          problemTitle="Two Sum"
          code="int main() {}"
        />
      );

      expect(screen.getByText("GOOD")).toBeDefined();

      const copyBtn = screen.getByLabelText("Copy analysis");
      fireEvent.click(copyBtn);

      rerender(
        <ReviewResult
          loading={false}
          review={{ type: "markdown", data: "### Markdown Review Title" }}
          problemId="p1"
          problemTitle="Two Sum"
          code="int main() {}"
        />
      );

      expect(screen.getByText(/Markdown Review Title/i)).toBeDefined();
      fireEvent.click(copyBtn);

      rerender(
        <ReviewResult
          loading={true}
          review={null}
          problemId="p1"
          problemTitle="Two Sum"
          code="int main() {}"
        />
      );
      expect(screen.getByText(/Deconstructing solution/i)).toBeDefined();
    });

    it("should render AICodeArchitect and trigger review analysis", async () => {
      vi.spyOn(dsaApi, "getAICodeReview").mockResolvedValueOnce({
        review: {
          type: "markdown",
          data: "### Great code structure!",
        },
      } as any);

      render(<AICodeArchitect problemId="p1" problemTitle="Two Sum" />);
      const btn = screen.getByText("Begin Code Analysis");
      expect(btn).toBeDefined();
      fireEvent.click(btn);

      const textarea = screen.getByPlaceholderText(/Paste your Two Sum solution here/i);
      fireEvent.change(textarea, { target: { value: "int twoSum() { return 0; }" } });

      const runBtn = screen.getByLabelText("Run code analysis");
      fireEvent.click(runBtn);

      await waitFor(() => {
        expect(screen.getByText("Exit Architect Mode")).toBeDefined();
      });
    });
  });
});
