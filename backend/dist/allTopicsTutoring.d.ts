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
export declare const ALL_20_DSA_TOPICS: readonly [{
    readonly idx: 1;
    readonly name: "Complexity Analysis";
    readonly shortDesc: "Big-O notation and algorithm analysis";
}, {
    readonly idx: 2;
    readonly name: "Arrays";
    readonly shortDesc: "Fixed-size contiguous memory operations";
}, {
    readonly idx: 3;
    readonly name: "Strings";
    readonly shortDesc: "Character sequences and patterns";
}, {
    readonly idx: 4;
    readonly name: "Linked Lists";
    readonly shortDesc: "Pointer-based dynamic data structures";
}, {
    readonly idx: 5;
    readonly name: "Stack & Queue";
    readonly shortDesc: "LIFO and FIFO collections";
}, {
    readonly idx: 6;
    readonly name: "Hashing";
    readonly shortDesc: "Hash tables, sets, and hash functions";
}, {
    readonly idx: 7;
    readonly name: "Binary Trees";
    readonly shortDesc: "Tree traversals and recursion";
}, {
    readonly idx: 8;
    readonly name: "Binary Search Trees";
    readonly shortDesc: "Ordered binary search trees";
}, {
    readonly idx: 9;
    readonly name: "Heaps & Priority Queues";
    readonly shortDesc: "Priority queues and heap operations";
}, {
    readonly idx: 10;
    readonly name: "Tries";
    readonly shortDesc: "Prefix trees and autocomplete";
}, {
    readonly idx: 11;
    readonly name: "Graphs Basics";
    readonly shortDesc: "Graph representations and traversals";
}, {
    readonly idx: 12;
    readonly name: "Sorting Algorithms";
    readonly shortDesc: "Comparison and non-comparison sorting";
}, {
    readonly idx: 13;
    readonly name: "Binary Search";
    readonly shortDesc: "Logarithmic search and bisection";
}, {
    readonly idx: 14;
    readonly name: "Recursion Fundamentals";
    readonly shortDesc: "Recursive problem solving";
}, {
    readonly idx: 15;
    readonly name: "Backtracking Strategies";
    readonly shortDesc: "Search with pruning and undo";
}, {
    readonly idx: 16;
    readonly name: "Greedy Algorithms";
    readonly shortDesc: "Locally optimal choices";
}, {
    readonly idx: 17;
    readonly name: "Dynamic Programming";
    readonly shortDesc: "Overlapping subproblems and memoization";
}, {
    readonly idx: 18;
    readonly name: "Advanced DSU/Segment Trees/BIT";
    readonly shortDesc: "Union-Find, Segment Tree, BIT";
}, {
    readonly idx: 19;
    readonly name: "Bit Manipulation";
    readonly shortDesc: "Bitwise operations and tricks";
}, {
    readonly idx: 20;
    readonly name: "Advanced Graphs";
    readonly shortDesc: "Shortest paths, MST, topo sort";
}];
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
export declare const generateTopicContent: (topicIdx: number) => string;
//# sourceMappingURL=allTopicsTutoring.d.ts.map