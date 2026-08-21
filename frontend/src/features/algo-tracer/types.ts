export type SupportedLanguage = "javascript" | "python" | "cpp";

export type AlgorithmType =
  | "bubble-sort"
  | "selection-sort"
  | "insertion-sort"
  | "merge-sort"
  | "quick-sort"
  | "binary-search"
  | "linear-search"
  | "two-pointers"
  | "sliding-window"
  | "stack"
  | "queue"
  | "bfs"
  | "dfs"
  | "generic";

export type DiagramType =
  | "bar"
  | "array-box"
  | "split-merge"
  | "graph"
  | "stack"
  | "queue"
  | "generic";

export interface StepHighlighting {
  comparing?: number[];     // indices currently being compared
  swapping?: number[];      // indices currently swapping
  sorted?: number[];        // indices confirmed sorted
  pivot?: number | null;    // index of active pivot
  found?: number | null;    // index of found target
  activeRange?: [number, number]; // e.g. [low, high] or [left, right]
  eliminatedRange?: [number, number];
  currentNode?: string | number | null;
  visitedNodes?: Array<string | number>;
  activeEdge?: [string | number, string | number] | null;
  stackTop?: number | null;
  queueFront?: number | null;
  queueRear?: number | null;
}

export interface SplitMergeNode {
  id: string;
  depth: number;
  array: number[];
  leftIndex: number;
  rightIndex: number;
  stage: "split" | "merging" | "merged";
  active?: boolean;
}

export interface TraceStep {
  stepIndex: number;
  line: number; // 1-indexed Monaco line to highlight
  type:
    | "init"
    | "compare"
    | "swap"
    | "iterate"
    | "visit"
    | "insert"
    | "found"
    | "notfound"
    | "split"
    | "merge"
    | "push"
    | "pop"
    | "enqueue"
    | "dequeue"
    | "call"
    | "return"
    | "complete";
  arrayState: number[]; // snapshot of primary array
  highlighting: StepHighlighting;
  variables: Record<string, any>; // snapshot of variables at this step (i, j, mid, etc.)
  description: string; // Plain-English dynamic narrative
  callStack?: string[]; // Call stack for recursive algorithms
  treeState?: SplitMergeNode[]; // For merge sort
  graphState?: {
    nodes: Array<{ id: string; label: string }>;
    edges: Array<{ from: string; to: string }>;
    visited: string[];
    current: string | null;
    queueOrStack: string[];
  };
  dataStructureState?: (string | number)[]; // for stack / queue items
  theoryStepIndex?: number; // corresponding index in Theory "How it works"
}

export interface TheoryData {
  algoId: AlgorithmType;
  name: string;
  category: string;
  definition: string;
  howItWorks: string[];
  complexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
  properties: {
    isStable: boolean;
    isInPlace: boolean;
    dataStructure: string;
  };
  bestUsedWhen: string[];
}

export interface TraceSession {
  problemId?: string;
  code: string;
  language: SupportedLanguage;
  customInput: string;
  targetValue?: string;
  graphInput?: string;
  lastStepIndex: number;
  algoType?: AlgorithmType;
}

export interface AlgoDetectionResult {
  type: AlgorithmType;
  displayName: string;
  confidence: number;
  suggestedDiagram: DiagramType;
  theory?: TheoryData;
}
