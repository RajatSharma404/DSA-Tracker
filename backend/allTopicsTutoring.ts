/**
 * Complete DSA tutoring content for the bootcamp.
 * Every topic follows the same seven-part format:
 * 1. What is it?
 * 2. Core concept with diagram
 * 3. C++ implementation
 * 4. Dry run
 * 5. Complexity analysis
 * 6. Three classic problems
 * 7. Tricks, edge cases & checkpoint
 */

import { topics1to5 } from "./content/topics1to5";
import { topics6to10 } from "./content/topics6to10";
import { topics11to15 } from "./content/topics11to15";
import { topics16to20 } from "./content/topics16to20";

export const ALL_20_DSA_TOPICS = [
  { idx: 1, name: "Complexity Analysis", shortDesc: "Big-O notation and algorithm analysis" },
  { idx: 2, name: "Arrays", shortDesc: "Fixed-size contiguous memory operations" },
  { idx: 3, name: "Strings", shortDesc: "Character sequences and patterns" },
  { idx: 4, name: "Linked Lists", shortDesc: "Pointer-based dynamic data structures" },
  { idx: 5, name: "Stack & Queue", shortDesc: "LIFO and FIFO collections" },
  { idx: 6, name: "Hashing", shortDesc: "Hash tables, sets, and hash functions" },
  { idx: 7, name: "Binary Trees", shortDesc: "Tree traversals and recursion" },
  { idx: 8, name: "Binary Search Trees", shortDesc: "Ordered binary search trees" },
  { idx: 9, name: "Heaps & Priority Queues", shortDesc: "Priority queues and heap operations" },
  { idx: 10, name: "Tries", shortDesc: "Prefix trees and autocomplete" },
  { idx: 11, name: "Graphs Basics", shortDesc: "Graph representations and traversals" },
  { idx: 12, name: "Sorting Algorithms", shortDesc: "Comparison and non-comparison sorting" },
  { idx: 13, name: "Binary Search", shortDesc: "Logarithmic search and bisection" },
  { idx: 14, name: "Recursion Fundamentals", shortDesc: "Recursive problem solving" },
  { idx: 15, name: "Backtracking Strategies", shortDesc: "Search with pruning and undo" },
  { idx: 16, name: "Greedy Algorithms", shortDesc: "Locally optimal choices" },
  { idx: 17, name: "Dynamic Programming", shortDesc: "Overlapping subproblems and memoization" },
  { idx: 18, name: "Advanced DSU/Segment Trees/BIT", shortDesc: "Union-Find, Segment Tree, BIT" },
  { idx: 19, name: "Bit Manipulation", shortDesc: "Bitwise operations and tricks" },
  { idx: 20, name: "Advanced Graphs", shortDesc: "Shortest paths, MST, topo sort" },
] as const;

export type TopicContent = {
  title: string;
  whatIsIt: string;
  concept: string;
  code: string;
  dryRun: string;
  complexity: string;
  problems: string;
  tricks: string;
};

const TOPIC_CONTENTS: Record<number, TopicContent> = {
  ...topics1to5,
  ...topics6to10,
  ...topics11to15,
  ...topics16to20,
};

const buildTopicMarkdown = (topic: TopicContent) => {
  return [
    `# ${topic.title}`,
    `## 1. What is it?\n\n${topic.whatIsIt}`,
    `## 2. Core concept with diagram\n\n${topic.concept}`,
    `## 3. C++ implementation\n\n\`\`\`cpp\n${topic.code.trim()}\n\`\`\``,
    `## 4. Dry run\n\n${topic.dryRun}`,
    `## 5. Complexity analysis\n\n${topic.complexity}`,
    `## 6. Three classic problems\n\n${topic.problems}`,
    `## 7. Tricks, edge cases & checkpoint\n\n${topic.tricks}`,
  ].join("\n\n");
};

export const generateTopicContent = (topicIdx: number): string => {
  const topic = TOPIC_CONTENTS[topicIdx];
  if (!topic) {
    return [
      `# Topic ${topicIdx}`,
      "## 1. What is it?\n\nContent coming soon.",
      "## 2. Core concept with diagram\n\nContent coming soon.",
      "## 3. C++ implementation\n\n```cpp\n// Content coming soon\n```",
      "## 4. Dry run\n\nContent coming soon.",
      "## 5. Complexity analysis\n\nContent coming soon.",
      "## 6. Three classic problems\n\nContent coming soon.",
      "## 7. Tricks, edge cases & checkpoint\n\nContent coming soon.",
    ].join("\n\n");
  }

  return buildTopicMarkdown(topic);
};
