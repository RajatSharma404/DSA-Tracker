import { describe, it, expect } from "vitest";
import { generateAstFlowchart } from "../astFlowchartEngine";
import type { FlowchartNode } from "../../components/FlowchartPanel";

describe("astFlowchartEngine", () => {
  it("returns empty nodes and edges for empty code input", () => {
    const result = generateAstFlowchart("", "python");
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });

  it("parses Python binary search function into AST control flow nodes", () => {
    const pythonCode = `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
`;
    const result = generateAstFlowchart(pythonCode, "python");
    expect(result.nodes?.length).toBeGreaterThan(5);

    // Verify Start Node
    const startNode = result.nodes?.find((n: FlowchartNode) => n.type === "start");
    expect(startNode).toBeDefined();
    expect(startNode?.label).toContain("binary_search");
    expect(startNode?.line).toBe(1);

    // Verify Decisions
    const decisionNodes = result.nodes?.filter((n: FlowchartNode) => n.type === "decision");
    expect(decisionNodes?.length).toBeGreaterThanOrEqual(3);

    // Verify Returns / End Nodes
    const endNodes = result.nodes?.filter((n: FlowchartNode) => n.type === "end");
    expect(endNodes?.length).toBeGreaterThanOrEqual(2);

    // Verify Edges
    expect(result.edges?.length).toBeGreaterThan(0);
  });

  it("parses C++ function into AST control flow nodes", () => {
    const cppCode = `int binarySearch(const vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`;
    const result = generateAstFlowchart(cppCode, "cpp");
    expect(result.nodes?.length).toBeGreaterThan(4);

    const startNode = result.nodes?.find((n: FlowchartNode) => n.type === "start");
    expect(startNode).toBeDefined();
    expect(startNode?.label).toContain("binarySearch");

    const decisionNode = result.nodes?.find((n: FlowchartNode) => n.type === "decision");
    expect(decisionNode).toBeDefined();
  });

  it("parses I/O statements into io type nodes", () => {
    const code = `def solve():
    print("Hello world")
    return 0`;
    const result = generateAstFlowchart(code, "python");
    const ioNode = result.nodes?.find((n: FlowchartNode) => n.type === "io");
    expect(ioNode).toBeDefined();
    expect(ioNode?.label).toContain("print");
  });

  it("attaches start and end algorithm fallbacks when no explicit function header is present", () => {
    const code = `x = 10
y = 20
z = x + y`;
    const result = generateAstFlowchart(code, "python");
    expect(result.nodes?.[0].type).toBe("start");
    expect(result.nodes?.[result.nodes.length - 1].type).toBe("end");
  });
});
