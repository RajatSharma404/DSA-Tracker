import { describe, it, expect } from "vitest";
import { detectAlgorithm } from "../algoPatterns";
import {
  traceBubbleSort,
  traceSelectionSort,
  traceQuickSort,
  traceMergeSort,
  traceBinarySearch,
  traceTwoPointers,
  traceBFS,
  traceStackSimulation,
} from "../codeInstrumenter";
import { executeAlgorithmTrace } from "../sandboxRunner";

describe("Algo Tracer Core Utilities", () => {
  describe("detectAlgorithm (algoPatterns.ts)", () => {
    it("should detect bubble sort pattern", () => {
      const code = `
        function bubbleSort(arr) {
          for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
              if (arr[j] > arr[j + 1]) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
              }
            }
          }
        }
      `;
      const res = detectAlgorithm(code);
      expect(res.type).toBe("bubble-sort");
      expect(res.suggestedDiagram).toBe("bar");
    });

    it("should detect binary search pattern", () => {
      const code = `
        function binarySearch(arr, target) {
          let left = 0, right = arr.length - 1;
          while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            if (arr[mid] === target) return mid;
            else if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
          }
          return -1;
        }
      `;
      const res = detectAlgorithm(code);
      expect(res.type).toBe("binary-search");
      expect(res.suggestedDiagram).toBe("array-box");
    });

    it("should fallback to generic on arbitrary unknown code", () => {
      const code = `console.log("hello world");`;
      const res = detectAlgorithm(code);
      expect(res.type).toBe("generic");
    });
  });

  describe("codeInstrumenter.ts", () => {
    const lines = ["function solve() {", "  // algorithm", "}"];

    it("should generate trace steps for bubble sort", () => {
      const steps = traceBubbleSort([4, 2, 1], lines);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].type).toBe("init");
      expect(steps[steps.length - 1].type).toBe("complete");
    });

    it("should generate trace steps for selection sort", () => {
      const steps = traceSelectionSort([4, 2, 1], lines);
      expect(steps.length).toBeGreaterThan(0);
    });

    it("should generate trace steps for quick sort", () => {
      const steps = traceQuickSort([3, 1, 2], lines);
      expect(steps.length).toBeGreaterThan(0);
    });

    it("should generate trace steps for merge sort", () => {
      const steps = traceMergeSort([4, 1, 3, 2], lines);
      expect(steps.length).toBeGreaterThan(0);
    });

    it("should generate trace steps for binary search", () => {
      const steps = traceBinarySearch([1, 2, 3, 4, 5], 3, lines);
      expect(steps.length).toBeGreaterThan(0);
    });

    it("should generate trace steps for two pointers", () => {
      const steps = traceTwoPointers([1, 2, 3, 4], 5, lines);
      expect(steps.length).toBeGreaterThan(0);
    });

    it("should generate trace steps for BFS", () => {
      const steps = traceBFS('{"0":[1,2],"1":[],"2":[]}', 0);
      expect(steps.length).toBeGreaterThan(0);
    });

    it("should generate trace steps for Stack simulation", () => {
      const steps = traceStackSimulation(lines);
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe("executeAlgorithmTrace (sandboxRunner.ts)", () => {
    it("should execute trace for detected algorithm correctly", () => {
      const code = `
        function bubbleSort(arr) {
          for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
              if (arr[j] > arr[j + 1]) {
                let temp = arr[j];
              }
            }
          }
        }
      `;

      const result = executeAlgorithmTrace({
        code,
        arrayInput: [5, 2, 8],
      });

      expect(result.detectedType).toBe("bubble-sort");
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();
    });

    it("should execute trace for all supported forced algorithm types", () => {
      const code = `function test() {}`;
      const algos = [
        "selection-sort",
        "quick-sort",
        "merge-sort",
        "binary-search",
        "two-pointers",
        "bfs",
        "stack",
        "generic",
      ] as const;

      algos.forEach((algo) => {
        const res = executeAlgorithmTrace({
          code,
          algoType: algo,
          arrayInput: [3, 1, 2],
        });
        expect(res.steps.length).toBeGreaterThan(0);
      });
    });
  });
});
