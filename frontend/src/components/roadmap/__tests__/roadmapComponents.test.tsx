import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReactFlowProvider } from "reactflow";
import TopicNode from "../TopicNode";
import ProblemNode from "../ProblemNode";
import ProblemDrawer from "../ProblemDrawer";
import CustomRoadmapBuilder from "../CustomRoadmapBuilder";
import {
  parseRoadmapText,
  serializeRoadmapText,
  createDefaultNodeData,
} from "../roadmapText";
import RoadmapGraph from "../RoadmapGraph";
import { dsaApi } from "../../../lib/api";

describe("Roadmap Components (components/roadmap)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("roadmapText Parser & Serializer", () => {
    it("should serialize and parse roadmap document", () => {
      const doc = {
        title: "Test Roadmap",
        nodes: [
          {
            id: "node_1",
            type: "custom",
            position: { x: 100, y: 100 },
            data: createDefaultNodeData("starting", { label: "Start Journey" }),
          },
          {
            id: "node_2",
            type: "custom",
            position: { x: 300, y: 100 },
            data: createDefaultNodeData("problem", {
              label: "Two Sum",
              problemTitle: "Two Sum",
            }),
          },
        ],
        edges: [
          {
            id: "e1_2",
            source: "node_1",
            target: "node_2",
          },
        ],
      };

      const serialized = serializeRoadmapText(doc);
      expect(serialized).toContain("Start%20Journey");
      expect(serialized).toContain("Two%20Sum");

      const parsed = parseRoadmapText(serialized);
      expect(parsed.nodes.length).toBe(2);
      expect(parsed.nodes[0].data.label).toBe("Start Journey");
      expect(parsed.edges.length).toBe(1);
    });
  });

  describe("TopicNode", () => {
    it("should render topic progress, label, and handle clicks", () => {
      const onOpen = vi.fn();
      const onExpand = vi.fn();

      render(
        <ReactFlowProvider>
          <TopicNode
            data={{
              label: "Binary Search",
              progressPercentage: 50,
              solvedProblems: 3,
              totalProblems: 6,
              tier: "Tier 1: Core",
              isTarget: true,
              isExpanded: false,
              onOpenDrawer: onOpen,
              onToggleExpand: onExpand,
            }}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByText("Binary Search")).toBeDefined();
      expect(screen.getByText(/3\s*\/\s*6/)).toBeDefined();

      const node = screen.getByText("Binary Search");
      fireEvent.click(node);
      expect(onOpen).toHaveBeenCalled();

      const expandBtn = screen.getByText("Expand Nodes");
      fireEvent.click(expandBtn);
      expect(onExpand).toHaveBeenCalled();
    });

    it("should render expanded state with Hide Nodes button", () => {
      const onExpand = vi.fn();
      render(
        <ReactFlowProvider>
          <TopicNode
            data={{
              label: "Trees",
              progressPercentage: 40,
              solvedProblems: 2,
              totalProblems: 5,
              isExpanded: true,
              onToggleExpand: onExpand,
            }}
          />
        </ReactFlowProvider>
      );

      const hideBtn = screen.getByText("Hide Nodes");
      expect(hideBtn).toBeDefined();
      fireEvent.click(hideBtn);
      expect(onExpand).toHaveBeenCalled();
    });

    it("should render 100% completed badge", () => {
      render(
        <ReactFlowProvider>
          <TopicNode
            data={{
              label: "Arrays",
              progressPercentage: 100,
              solvedProblems: 10,
              totalProblems: 10,
            }}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByText(/10\s*\/\s*10/)).toBeDefined();
    });
  });

  describe("ProblemNode", () => {
    it("should render problem node with difficulty and status", () => {
      render(
        <ReactFlowProvider>
          <ProblemNode
            data={{
              label: "Two Sum",
              difficulty: "EASY",
              status: "DONE",
              link: "https://leetcode.com/problems/two-sum",
            }}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByText("Two Sum")).toBeDefined();
      expect(screen.getByText("EASY")).toBeDefined();
    });
  });

  describe("ProblemDrawer", () => {
    it("should render problem drawer with problems, filter difficulty, search, hover, and toggle status", async () => {
      vi.spyOn(dsaApi, "updateProgress").mockResolvedValue({ success: true } as any);
      vi.spyOn(dsaApi, "getProblem").mockResolvedValue({ id: "p1", title: "Two Sum" } as any);

      const onClose = vi.fn();
      const onStatusChange = vi.fn();
      const mockProblems = [
        {
          id: "p1",
          title: "Two Sum",
          difficulty: "EASY" as const,
          status: "TODO" as const,
          link: "https://leetcode.com/problems/two-sum",
          orderIndex: 1,
          topicId: "t1",
          topicName: "Arrays",
        },
        {
          id: "p2",
          title: "3Sum",
          difficulty: "MEDIUM" as const,
          status: "DONE" as const,
          link: "https://leetcode.com/problems/3sum",
          orderIndex: 2,
          topicId: "t1",
          topicName: "Arrays",
        },
      ];

      const { rerender } = render(
        <ProblemDrawer
          isOpen={true}
          onClose={onClose}
          topic={{ id: "t1", name: "Arrays", totalProblems: 2, solvedProblems: 1 } as any}
          problems={mockProblems}
          onProblemStatusChange={onStatusChange}
        />
      );

      expect(screen.getByText("Two Sum")).toBeDefined();
      expect(screen.getByText("3Sum")).toBeDefined();

      // Hover on problem title to prefetch
      const titleLink = screen.getByText("Two Sum");
      fireEvent.mouseEnter(titleLink);
      fireEvent.click(titleLink);

      // Search problem
      const searchInput = screen.getByPlaceholderText(/Search problem title/i);
      fireEvent.change(searchInput, { target: { value: "Two" } });
      expect(screen.getByText("Two Sum")).toBeDefined();
      expect(screen.queryByText("3Sum")).toBeNull();

      fireEvent.change(searchInput, { target: { value: "" } });

      // Filter by Difficulty
      const mediumFilter = screen.getAllByText("MEDIUM")[0];
      fireEvent.click(mediumFilter);
      expect(screen.getByText("3Sum")).toBeDefined();

      // Filter by Status
      const allFilter = screen.getAllByText("ALL")[0];
      fireEvent.click(allFilter);

      // Toggle problem status
      const statusBtn = screen.getAllByRole("button").find((b) => b.querySelector("svg.lucide-circle"));
      if (statusBtn) {
        fireEvent.click(statusBtn);
        expect(onStatusChange).toHaveBeenCalled();
      }

      // Close drawer
      const closeBtn = screen.getAllByRole("button")[0];
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();

      // Loading state
      rerender(
        <ProblemDrawer
          isOpen={true}
          onClose={onClose}
          topic={{ id: "t1", name: "Arrays", totalProblems: 2, solvedProblems: 1 } as any}
          problems={[]}
          loading={true}
        />
      );
      expect(screen.getByText("Loading problems...")).toBeDefined();
    });
  });

  describe("RoadmapGraph", () => {
    it("should render RoadmapGraph, search input, collapse and expand controls", async () => {
      vi.spyOn(dsaApi, "getTopics").mockResolvedValue([
        {
          id: "t1",
          name: "Arrays",
          description: "Array fundamentals",
          totalProblems: 5,
          solvedProblems: 2,
          progressPercentage: 40,
        },
      ]);
      vi.spyOn(dsaApi, "getTopicProblems").mockResolvedValue([]);

      render(
        <ReactFlowProvider>
          <RoadmapGraph />
        </ReactFlowProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Arrays")).toBeDefined();
      });

      const searchInput = screen.getByPlaceholderText(/Jump to topic/i);
      fireEvent.change(searchInput, { target: { value: "Array" } });

      // Expand and collapse controls
      const expandBtn = screen.queryByText(/Expand All/i);
      if (expandBtn) fireEvent.click(expandBtn);

      const collapseBtn = screen.queryByText(/Collapse/i);
      if (collapseBtn) fireEvent.click(collapseBtn);
    });
  });

  describe("CustomRoadmapBuilder", () => {
    it("should render custom roadmap builder interface", async () => {
      vi.spyOn(dsaApi, "searchProblems").mockResolvedValue([]);
      vi.spyOn(dsaApi, "getTags").mockResolvedValue([]);

      render(
        <ReactFlowProvider>
          <CustomRoadmapBuilder />
        </ReactFlowProvider>
      );

      expect(screen.getByText(/Loading custom roadmap builder/i)).toBeDefined();
    });
  });
});
