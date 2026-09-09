import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FlowchartPanel, FlowchartData } from "../FlowchartPanel";
import { LeetCodeEditor } from "../dashboard/LeetCodeEditor";
import { dsaApi } from "../../lib/api";
import { toast } from "sonner";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

let lastMockEditor: any = null;

// Mock @monaco-editor/react
vi.mock("@monaco-editor/react", () => {
  return {
    default: ({ onChange, onMount }: any) => {
      const mockEditor = {
        deltaDecorations: vi.fn().mockReturnValue(["dec-1"]),
        revealLineInCenter: vi.fn(),
      };
      lastMockEditor = mockEditor;
      const mockMonaco = {
        Range: class {
          constructor(
            public startLineNumber: number,
            public startColumn: number,
            public endLineNumber: number,
            public endColumn: number
          ) {}
        },
      };

      React.useEffect(() => {
        if (onMount) {
          onMount(mockEditor, mockMonaco);
        }
      }, [onMount]);

      return (
        <textarea
          data-testid="monaco-editor-mock"
          onChange={(e) => onChange && onChange(e.target.value)}
        />
      );
    },
  };
});

describe("FlowchartPanel Component", () => {
  const sampleData: FlowchartData = {
    nodes: [
      { id: "1", type: "start", label: "Start Algorithm", line: 1 },
      { id: "2", type: "process", label: "Initialize variables", line: 3 },
      { id: "3", type: "decision", label: "i < n ?", line: 5 },
      { id: "4", type: "io", label: "Print result", line: 7 },
      { id: "5", type: "end", label: "End Algorithm", line: 9 },
    ],
    edges: [
      { from: "1", to: "2" },
      { from: "2", to: "3" },
      { from: "3", to: "4", label: "True" },
      { from: "4", to: "5" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no nodes are provided", () => {
    render(<FlowchartPanel data={{ nodes: [], edges: [] }} onClose={vi.fn()} />);
    expect(
      screen.getByText(/No flowchart steps found/i)
    ).toBeDefined();
  });

  it("renders all nodes and labels from sample flowchart data", () => {
    render(<FlowchartPanel data={sampleData} onClose={vi.fn()} />);

    expect(screen.getByText("Start Algorithm")).toBeDefined();
    expect(screen.getByText("Initialize variables")).toBeDefined();
    expect(screen.getByText("i < n ?")).toBeDefined();
    expect(screen.getByText("Print result")).toBeDefined();
    expect(screen.getByText("End Algorithm")).toBeDefined();
    expect(screen.getByText("5 steps")).toBeDefined();
  });

  it("handles node click and passes node to onNodeClick", () => {
    const onNodeClick = vi.fn();
    render(
      <FlowchartPanel
        data={sampleData}
        onClose={vi.fn()}
        onNodeClick={onNodeClick}
      />
    );

    const decisionNode = screen.getByText("i < n ?");
    fireEvent.click(decisionNode);

    expect(onNodeClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "3",
        type: "decision",
        label: "i < n ?",
        line: 5,
      })
    );
  });

  it("handles zoom in, zoom out, and reset view controls", () => {
    render(<FlowchartPanel data={sampleData} onClose={vi.fn()} />);

    const zoomInBtn = screen.getByLabelText("Zoom in flowchart");
    const zoomOutBtn = screen.getByLabelText("Zoom out flowchart");
    const resetBtn = screen.getByLabelText("Reset zoom and position");

    expect(screen.getByText("100%")).toBeDefined();

    fireEvent.click(zoomInBtn);
    expect(screen.getByText("115%")).toBeDefined();

    fireEvent.click(zoomOutBtn);
    expect(screen.getByText("100%")).toBeDefined();

    fireEvent.click(resetBtn);
    expect(screen.getByText("100%")).toBeDefined();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<FlowchartPanel data={sampleData} onClose={onClose} />);

    const closeBtn = screen.getByLabelText("Close flowchart panel");
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it("handles mouse pan drag interactions on the canvas", () => {
    const { container } = render(
      <FlowchartPanel data={sampleData} onClose={vi.fn()} />
    );

    const canvas = container.querySelector(".cursor-grab");
    expect(canvas).toBeDefined();

    if (canvas) {
      fireEvent.mouseDown(canvas, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 130 });
      fireEvent.mouseUp(canvas);
    }
  });
});

describe("LeetCodeEditor Visualize Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(dsaApi, "getProblemDetails").mockResolvedValue({
      id: "prob-1",
      title: "Two Sum",
      slug: "two-sum",
      content: "<p>Two sum problem</p>",
      codeSnippets: [
        { langSlug: "cpp", code: "// C++ starter" },
        { langSlug: "python3", code: "# Python starter" },
      ],
    } as any);
    vi.spyOn(dsaApi, "getSolutionHistory").mockResolvedValue([]);
  });

  it("renders Visualize Flow button and triggers API call with mapped language", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        nodes: [
          { id: "1", type: "start", label: "Start", line: 1 },
          { id: "2", type: "process", label: "Process", line: 2 },
        ],
        edges: [{ from: "1", to: "2" }],
      }),
    });
    global.fetch = mockFetch;

    render(
      <LeetCodeEditor
        problemSlug="two-sum"
        problemTitle="Two Sum"
        problemId="p1"
      />
    );

    // Wait for snippets to load
    await waitFor(() => {
      expect(screen.getByText("🔀 Visualize Flow")).toBeDefined();
    });

    const visualizeBtn = screen.getByText("🔀 Visualize Flow");
    fireEvent.click(visualizeBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "https://codevis-backend.onrender.com/analyze",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining('"lang":"cpp"'),
        })
      );
    });

    // Flowchart panel should now be visible
    await waitFor(() => {
      expect(screen.getAllByText("Control Flow").length).toBeGreaterThan(0);
    });
  });

  it("handles CodeVis API failure gracefully with toast error", async () => {
    const mockFetch = vi.fn().mockRejectedValueOnce(new Error("Network Error"));
    global.fetch = mockFetch;

    render(
      <LeetCodeEditor
        problemSlug="two-sum"
        problemTitle="Two Sum"
        problemId="p1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("🔀 Visualize Flow")).toBeDefined();
    });

    const visualizeBtn = screen.getByText("🔀 Visualize Flow");
    fireEvent.click(visualizeBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Flowchart generation failed. Check your code syntax."
      );
    });
  });

  it("falls back to local AST engine when remote API fails with valid code", async () => {
    const mockFetch = vi.fn().mockRejectedValueOnce(new Error("Network Error"));
    global.fetch = mockFetch;

    render(
      <LeetCodeEditor
        problemSlug="two-sum"
        problemTitle="Two Sum"
        problemId="p1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("🔀 Visualize Flow")).toBeDefined();
    });

    const textarea = screen.getByTestId("monaco-editor-mock");
    fireEvent.change(textarea, {
      target: {
        value: "int twoSum() {\n    int a = 1;\n    return a;\n}",
      },
    });

    const visualizeBtn = screen.getByText("🔀 Visualize Flow");
    fireEvent.click(visualizeBtn);

    await waitFor(() => {
      expect(screen.getAllByText("Control Flow").length).toBeGreaterThan(0);
    });
  });

  it("highlights code in Monaco editor when node is clicked and clears on close", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        nodes: [
          { id: "n1", type: "start", label: "Start function", line: 1 },
          { id: "n2", type: "process", label: "Process data", line: 5 },
        ],
        edges: [{ from: "n1", to: "n2" }],
      }),
    });
    global.fetch = mockFetch;

    render(
      <LeetCodeEditor
        problemSlug="two-sum"
        problemTitle="Two Sum"
        problemId="p1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("🔀 Visualize Flow")).toBeDefined();
    });

    fireEvent.click(screen.getByText("🔀 Visualize Flow"));

    await waitFor(() => {
      expect(screen.getAllByText("Process data").length).toBeGreaterThan(0);
    });

    const processNodes = screen.getAllByRole("button", {
      name: /Process data/i,
    });
    fireEvent.click(processNodes[0]);

    expect(lastMockEditor.deltaDecorations).toHaveBeenCalledWith(
      expect.any(Array),
      expect.arrayContaining([
        expect.objectContaining({
          options: expect.objectContaining({
            className: "codevis-highlight",
            isWholeLine: true,
          }),
        }),
      ])
    );
    expect(lastMockEditor.revealLineInCenter).toHaveBeenCalledWith(5);

    // Click close button to restore full width and clear decorations
    const editorInstance = lastMockEditor;
    const closeButtons = screen.getAllByLabelText("Close flowchart panel");
    fireEvent.click(closeButtons[0]);

    expect(editorInstance.deltaDecorations).toHaveBeenCalledWith(
      ["dec-1"],
      []
    );
  });
});

