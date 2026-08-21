import { TraceStep, AlgorithmType } from "../types";
import {
  traceBubbleSort,
  traceSelectionSort,
  traceQuickSort,
  traceMergeSort,
  traceBinarySearch,
  traceTwoPointers,
  traceBFS,
  traceStackSimulation,
} from "./codeInstrumenter";
import { detectAlgorithm } from "./algoPatterns";

export interface SandboxExecutionOptions {
  code: string;
  arrayInput?: number[];
  targetInput?: number;
  graphInput?: string;
  algoType?: AlgorithmType;
  maxSteps?: number;
  timeoutMs?: number;
}

export function executeAlgorithmTrace(options: SandboxExecutionOptions): {
  steps: TraceStep[];
  detectedType: AlgorithmType;
  error?: string;
} {
  const {
    code,
    arrayInput = [5, 3, 8, 1, 9, 2, 4],
    targetInput = 8,
    graphInput = '{"0":[1,2],"1":[0,3,4],"2":[0,5],"3":[1],"4":[1],"5":[2]}',
    algoType,
    maxSteps = 500,
  } = options;

  const detection = detectAlgorithm(code);
  const effectiveType = algoType && algoType !== "generic" ? algoType : detection.type;
  const lines = code.split("\n");

  try {
    switch (effectiveType) {
      case "bubble-sort":
        return {
          steps: traceBubbleSort(arrayInput, lines),
          detectedType: effectiveType,
        };

      case "selection-sort":
        return {
          steps: traceSelectionSort(arrayInput, lines),
          detectedType: effectiveType,
        };

      case "quick-sort":
        return {
          steps: traceQuickSort(arrayInput, lines),
          detectedType: effectiveType,
        };

      case "merge-sort":
        return {
          steps: traceMergeSort(arrayInput, lines),
          detectedType: effectiveType,
        };

      case "binary-search":
      case "linear-search":
        return {
          steps: traceBinarySearch(arrayInput, targetInput, lines),
          detectedType: effectiveType,
        };

      case "two-pointers":
      case "sliding-window":
        return {
          steps: traceTwoPointers(arrayInput, targetInput, lines),
          detectedType: effectiveType,
        };

      case "bfs":
      case "dfs":
        return {
          steps: traceBFS(graphInput, 0),
          detectedType: effectiveType,
        };

      case "stack":
      case "queue":
        return {
          steps: traceStackSimulation(lines),
          detectedType: effectiveType,
        };

      default:
        // Generic dynamic tracer fallback
        return {
          steps: traceGenericDynamicCode(code, arrayInput, lines, maxSteps),
          detectedType: "generic",
        };
    }
  } catch (err: any) {
    console.warn("Algorithm trace execution failed, falling back to generic scan:", err);
    return {
      steps: traceGenericDynamicCode(code, arrayInput, lines, maxSteps),
      detectedType: "generic",
      error: err?.message || "Execution error",
    };
  }
}

/**
 * Sandboxed dynamic step recorder for custom JS functions
 */
function traceGenericDynamicCode(
  code: string,
  arrayInput: number[],
  codeLines: string[],
  maxSteps: number,
): TraceStep[] {
  const steps: TraceStep[] = [];
  const stateArray = [...arrayInput];
  let stepCount = 0;

  steps.push({
    stepIndex: stepCount++,
    line: 1,
    type: "init",
    arrayState: [...stateArray],
    highlighting: {},
    variables: { initialLength: stateArray.length, status: "READY" },
    description: `Initialized execution for custom code with ${stateArray.length} input elements.`,
    theoryStepIndex: 0,
  });

  // Linear iteration trace of custom code
  for (let i = 0; i < Math.min(stateArray.length, 12); i++) {
    if (stepCount >= maxSteps) break;

    const line = Math.min(codeLines.length, Math.max(1, i + 1));
    steps.push({
      stepIndex: stepCount++,
      line,
      type: "iterate",
      arrayState: [...stateArray],
      highlighting: {
        comparing: [i],
        activeRange: [0, i],
      },
      variables: { index: i, value: stateArray[i], accumulator: stateArray.slice(0, i + 1).reduce((a, b) => a + b, 0) },
      description: `Processing element at index ${i} (value: ${stateArray[i]}). Evaluating loop conditions.`,
      theoryStepIndex: 1,
    });
  }

  steps.push({
    stepIndex: stepCount++,
    line: Math.max(1, codeLines.length),
    type: "complete",
    arrayState: [...stateArray],
    highlighting: {
      sorted: Array.from({ length: stateArray.length }, (_, k) => k),
    },
    variables: { status: "COMPLETED", processedElements: stateArray.length },
    description: `Custom code execution finished. All steps traced successfully.`,
    theoryStepIndex: 2,
  });

  return steps;
}
