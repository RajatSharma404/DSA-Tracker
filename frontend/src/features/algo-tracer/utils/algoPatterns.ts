import {
  AlgorithmType,
  DiagramType,
  AlgoDetectionResult,
} from "../types";
import { THEORY_DB } from "../data/theoryDB";

interface DetectionRule {
  type: AlgorithmType;
  displayName: string;
  diagram: DiagramType;
  match: (code: string) => boolean;
}

const DETECTION_RULES: DetectionRule[] = [
  {
    type: "bubble-sort",
    displayName: "Bubble Sort",
    diagram: "bar",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("bubblesort") || lower.includes("bubble_sort")) return true;
      const hasNestedLoops = /(for|while).*\{[\s\S]*?(for|while)/i.test(code);
      const hasAdjacentCompare = /\[\s*(\w+)\s*\]\s*>\s*\[\s*\1\s*\+\s*1\s*\]/i.test(code) ||
        /arr\[j\]\s*>\s*arr\[j\s*\+\s*1\]/i.test(code);
      return hasNestedLoops && hasAdjacentCompare;
    },
  },
  {
    type: "selection-sort",
    displayName: "Selection Sort",
    diagram: "bar",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("selectionsort") || lower.includes("selection_sort")) return true;
      const hasMinTracking = /(minidx|min_idx|minindex|min_index|smallest|min)\s*=/i.test(code);
      const hasNestedLoops = /(for|while).*\{[\s\S]*?(for|while)/i.test(code);
      return hasNestedLoops && hasMinTracking;
    },
  },
  {
    type: "insertion-sort",
    displayName: "Insertion Sort",
    diagram: "bar",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("insertionsort") || lower.includes("insertion_sort")) return true;
      const hasKeyShift = /(key|current|val|temp)\s*=\s*\w+\[\s*i\s*\]/i.test(code) &&
        /(j\s*>=?\s*0|j\s*>\s*0)/i.test(code);
      return hasKeyShift;
    },
  },
  {
    type: "merge-sort",
    displayName: "Merge Sort",
    diagram: "split-merge",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("mergesort") || lower.includes("merge_sort")) return true;
      const hasMergeFn = /(function\s+merge|def\s+merge|void\s+merge|let\s+merged|const\s+merged)/i.test(code);
      const hasMidSplit = /(Math\.floor|\/\/|\/)\s*\(?.*length\s*\/\s*2|\/ 2\)?/i.test(code) || /slice\(0,\s*mid\)/i.test(code);
      return hasMergeFn || hasMidSplit;
    },
  },
  {
    type: "quick-sort",
    displayName: "Quick Sort",
    diagram: "bar",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("quicksort") || lower.includes("quick_sort")) return true;
      const hasPivot = /(pivot|partition|pi\s*=)/i.test(code);
      const hasRecursion = /(quickSort|quick_sort)/i.test(code);
      return hasPivot || hasRecursion;
    },
  },
  {
    type: "binary-search",
    displayName: "Binary Search",
    diagram: "array-box",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("binarysearch") || lower.includes("binary_search")) return true;
      const hasMidCalc = /(mid|middle)\s*=\s*(Math\.floor\()?.*(low|left|l)\s*\+\s*(high|right|r)/i.test(code);
      const hasLoopCondition = /(low|left|l)\s*<=?\s*(high|right|r)/i.test(code);
      return hasMidCalc || hasLoopCondition;
    },
  },
  {
    type: "two-pointers",
    displayName: "Two Pointers",
    diagram: "array-box",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("twopointer") || lower.includes("two_pointer") || lower.includes("twosum")) return true;
      const hasLeftRight = /(left|l)\s*=\s*0[\s\S]*?(right|r)\s*=\s*.*length/i.test(code);
      const hasWhileLoop = /while\s*\(\s*(left|l)\s*<\s*(right|r)\s*\)/i.test(code);
      return hasLeftRight || hasWhileLoop;
    },
  },
  {
    type: "sliding-window",
    displayName: "Sliding Window",
    diagram: "array-box",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("slidingwindow") || lower.includes("sliding_window") || lower.includes("window")) return true;
      const hasWindowPattern = /(windowsum|window_sum|windowsize|window_size|window|maxsum|max_sum)/i.test(code);
      return hasWindowPattern;
    },
  },
  {
    type: "bfs",
    displayName: "Breadth-First Search (BFS)",
    diagram: "graph",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("bfs") || lower.includes("breadth")) return true;
      const hasQueueAndVisited = /(queue|q\.)/i.test(code) && /(visited|seen)/i.test(code);
      return hasQueueAndVisited;
    },
  },
  {
    type: "dfs",
    displayName: "Depth-First Search (DFS)",
    diagram: "graph",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("dfs") || lower.includes("depth")) return true;
      const hasDfsRecursion = /(function\s+dfs|def\s+dfs|dfs\()/i.test(code);
      return hasDfsRecursion;
    },
  },
  {
    type: "stack",
    displayName: "Stack Operations",
    diagram: "stack",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("stack")) return true;
      const hasPushPop = /\.push\([\s\S]*?\.pop\(/i.test(code) || /stack\.push/i.test(code);
      return hasPushPop;
    },
  },
  {
    type: "queue",
    displayName: "Queue Operations",
    diagram: "queue",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("queue")) return true;
      const hasEnqueueDequeue = /(enqueue|dequeue|\.push\([\s\S]*?\.shift\()/i.test(code);
      return hasEnqueueDequeue;
    },
  },
  {
    type: "linear-search",
    displayName: "Linear Search",
    diagram: "array-box",
    match: (code: string) => {
      const lower = code.toLowerCase();
      if (lower.includes("linearsearch") || lower.includes("linear_search")) return true;
      const hasSingleScan = /(for|while).*===?\s*(target|val|key)/i.test(code);
      return hasSingleScan;
    },
  },
];

export function detectAlgorithm(code: string): AlgoDetectionResult {
  const cleanedCode = code.trim();
  if (!cleanedCode) {
    return {
      type: "generic",
      displayName: "Custom Algorithm",
      confidence: 0,
      suggestedDiagram: "generic",
      theory: THEORY_DB.generic,
    };
  }

  for (const rule of DETECTION_RULES) {
    if (rule.match(cleanedCode)) {
      return {
        type: rule.type,
        displayName: rule.displayName,
        confidence: 0.95,
        suggestedDiagram: rule.diagram,
        theory: THEORY_DB[rule.type] || THEORY_DB.generic,
      };
    }
  }

  return {
    type: "generic",
    displayName: "Custom Algorithm",
    confidence: 0.5,
    suggestedDiagram: "bar",
    theory: undefined,
  };
}
