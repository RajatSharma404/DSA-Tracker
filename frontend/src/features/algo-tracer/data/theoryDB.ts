import { AlgorithmType, TheoryData } from "../types";

export const THEORY_DB: Record<AlgorithmType, TheoryData> = {
  "bubble-sort": {
    algoId: "bubble-sort",
    name: "Bubble Sort",
    category: "Comparison Sorting",
    definition:
      "A simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.",
    howItWorks: [
      "Start at the beginning of the array with index i = 0.",
      "Compare adjacent elements arr[j] and arr[j+1].",
      "If arr[j] > arr[j+1], swap them to push the larger item to the right.",
      "Repeat the comparison pass until the largest unsorted element bubbles to the end.",
      "Shrink the unsorted boundary by 1 and repeat until no swaps occur.",
    ],
    complexity: {
      best: "O(N)",
      average: "O(N²)",
      worst: "O(N²)",
      space: "O(1)",
    },
    properties: {
      isStable: true,
      isInPlace: true,
      dataStructure: "Array",
    },
    bestUsedWhen: [
      "Educational purposes to understand sorting invariants.",
      "Extremely small arrays or almost fully sorted data (with early-exit flag).",
      "When stable in-place sorting is required with minimal code footprint.",
    ],
  },

  "selection-sort": {
    algoId: "selection-sort",
    name: "Selection Sort",
    category: "Comparison Sorting",
    definition:
      "An in-place comparison sort that divides the array into sorted and unsorted subarrays, continually selecting the minimum element from the unsorted portion and moving it to the sorted section.",
    howItWorks: [
      "Divide the array into a sorted prefix (initially empty) and unsorted suffix.",
      "Find the minimum element in the remaining unsorted subarray.",
      "Swap the minimum element with the first element of the unsorted subarray.",
      "Advance the sorted prefix boundary by one position.",
      "Repeat until all elements are in their final positions.",
    ],
    complexity: {
      best: "O(N²)",
      average: "O(N²)",
      worst: "O(N²)",
      space: "O(1)",
    },
    properties: {
      isStable: false,
      isInPlace: true,
      dataStructure: "Array",
    },
    bestUsedWhen: [
      "When write/swap operations are very expensive compared to reads (only O(N) swaps).",
      "Memory space is severely constrained (strictly O(1) auxiliary memory).",
      "Small dataset benchmarks where simple loops outperform recursive overhead.",
    ],
  },

  "insertion-sort": {
    algoId: "insertion-sort",
    name: "Insertion Sort",
    category: "Comparison Sorting",
    definition:
      "A sorting algorithm that builds the final sorted array one item at a time by repeatedly taking the next element and inserting it into its correct position among previously sorted elements.",
    howItWorks: [
      "Assume the first element (index 0) is already sorted.",
      "Pick the next element (key) at index i.",
      "Compare the key backward with elements in the sorted portion.",
      "Shift all sorted elements greater than the key one position to the right.",
      "Insert the key into its correct vacant spot.",
    ],
    complexity: {
      best: "O(N)",
      average: "O(N²)",
      worst: "O(N²)",
      space: "O(1)",
    },
    properties: {
      isStable: true,
      isInPlace: true,
      dataStructure: "Array",
    },
    bestUsedWhen: [
      "Nearly sorted arrays (runs in near O(N) time).",
      "Online sorting where data arrives in a continuous stream.",
      "Base cases of hybrid sorting algorithms like Timsort and Introsort.",
    ],
  },

  "merge-sort": {
    algoId: "merge-sort",
    name: "Merge Sort",
    category: "Divide & Conquer Sorting",
    definition:
      "An efficient, general-purpose, divide-and-conquer comparison-based algorithm that divides the unsorted list into halves, recursively sorts them, and merges the sorted sublists.",
    howItWorks: [
      "Divide: Split the array into two halves at the midpoint.",
      "Conquer: Recursively call mergeSort on both left and right subarrays.",
      "Base Case: Stop splitting when subarray length is <= 1.",
      "Combine: Merge the two sorted halves by comparing elements one by one.",
      "Copy the merged results back to form the completely sorted array.",
    ],
    complexity: {
      best: "O(N log N)",
      average: "O(N log N)",
      worst: "O(N log N)",
      space: "O(N)",
    },
    properties: {
      isStable: true,
      isInPlace: false,
      dataStructure: "Array / Linked List",
    },
    bestUsedWhen: [
      "Guaranteed O(N log N) worst-case time complexity is required.",
      "Stable sorting is needed for complex objects or multi-key ordering.",
      "External sorting where data exceeds RAM and resides on disk.",
    ],
  },

  "quick-sort": {
    algoId: "quick-sort",
    name: "Quick Sort",
    category: "Divide & Conquer Sorting",
    definition:
      "A divide-and-conquer algorithm that selects a 'pivot' element and partitions the array such that smaller elements move to the left and larger elements move to the right, then recursively sorts the sub-partitions.",
    howItWorks: [
      "Choose a pivot element from the current array segment.",
      "Partition the array: reorder so elements < pivot are left and elements >= pivot are right.",
      "Place the pivot in its final sorted position index.",
      "Recursively apply the same logic to the left subarray.",
      "Recursively apply the same logic to the right subarray.",
    ],
    complexity: {
      best: "O(N log N)",
      average: "O(N log N)",
      worst: "O(N²)",
      space: "O(log N)",
    },
    properties: {
      isStable: false,
      isInPlace: true,
      dataStructure: "Array",
    },
    bestUsedWhen: [
      "General-purpose fast in-memory sorting with exceptional cache locality.",
      "When average-case speed is prioritized over strict worst-case guarantees.",
      "Systems where auxiliary memory is constrained.",
    ],
  },

  "binary-search": {
    algoId: "binary-search",
    name: "Binary Search",
    category: "Search Algorithm",
    definition:
      "A fast search algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.",
    howItWorks: [
      "Initialize low = 0 and high = array.length - 1.",
      "Calculate midpoint: mid = Math.floor((low + high) / 2).",
      "Compare arr[mid] with the target.",
      "If arr[mid] === target, return mid (found!).",
      "If arr[mid] < target, eliminate left half by setting low = mid + 1.",
      "If arr[mid] > target, eliminate right half by setting high = mid - 1.",
    ],
    complexity: {
      best: "O(1)",
      average: "O(log N)",
      worst: "O(log N)",
      space: "O(1)",
    },
    properties: {
      isStable: true,
      isInPlace: true,
      dataStructure: "Sorted Array",
    },
    bestUsedWhen: [
      "Searching in large, sorted arrays or monotonic answer spaces.",
      "Finding boundaries, lower-bound/upper-bound, or peak elements.",
      "Optimizing problems with 'Check if X is feasible' monotonic predicates.",
    ],
  },

  "linear-search": {
    algoId: "linear-search",
    name: "Linear Search",
    category: "Search Algorithm",
    definition:
      "A basic search algorithm that checks every element of a list sequentially until a match is found or the entire list has been searched.",
    howItWorks: [
      "Start at the first element index i = 0.",
      "Compare current element arr[i] with target.",
      "If arr[i] === target, return current index i.",
      "Otherwise, increment i and move to the next item.",
      "If loop finishes without a match, return -1 (not found).",
    ],
    complexity: {
      best: "O(1)",
      average: "O(N)",
      worst: "O(N)",
      space: "O(1)",
    },
    properties: {
      isStable: true,
      isInPlace: true,
      dataStructure: "Array / List",
    },
    bestUsedWhen: [
      "Searching in unsorted collections with unknown order.",
      "Very small datasets where sorting overhead is not justified.",
      "Streaming inputs where random access is not available.",
    ],
  },

  "two-pointers": {
    algoId: "two-pointers",
    name: "Two Pointers Technique",
    category: "Array / String Technique",
    definition:
      "A pattern where two pointers iterate across the data structure in tandem (converging from opposite ends or moving at different speeds) to find pairs or optimal windows in linear time.",
    howItWorks: [
      "Initialize left pointer at 0 and right pointer at length - 1.",
      "Evaluate the relationship between arr[left] and arr[right].",
      "If target condition is satisfied, record or return the solution.",
      "If metric is too small, advance left++ to increase value.",
      "If metric is too large, decrement right-- to decrease value.",
    ],
    complexity: {
      best: "O(N)",
      average: "O(N)",
      worst: "O(N)",
      space: "O(1)",
    },
    properties: {
      isStable: true,
      isInPlace: true,
      dataStructure: "Array / String",
    },
    bestUsedWhen: [
      "Two Sum on sorted arrays, 3Sum, Container With Most Water, Trapping Rain Water.",
      "Palindrome validation, reversing arrays in-place, removing duplicates.",
    ],
  },

  "sliding-window": {
    algoId: "sliding-window",
    name: "Sliding Window",
    category: "Subarray Technique",
    definition:
      "An optimization pattern that maintains a contiguous subarray window across an iterable, dynamically expanding and contracting boundaries to compute metrics in linear time.",
    howItWorks: [
      "Initialize window boundaries [left, right] at index 0.",
      "Expand right boundary and incorporate arr[right] into running aggregate.",
      "Check if window condition is valid or invalid.",
      "While invalid, contract from the left by removing arr[left] and incrementing left.",
      "Update answer with optimal window size or sum.",
    ],
    complexity: {
      best: "O(N)",
      average: "O(N)",
      worst: "O(N)",
      space: "O(1)",
    },
    properties: {
      isStable: true,
      isInPlace: true,
      dataStructure: "Array / String",
    },
    bestUsedWhen: [
      "Maximum or minimum subarray problems of fixed or variable size.",
      "Longest substring with K distinct characters, anagram search, minimum window substring.",
    ],
  },

  "stack": {
    algoId: "stack",
    name: "Stack (LIFO)",
    category: "Linear Data Structure",
    definition:
      "A Last-In, First-Out (LIFO) abstract data type where elements are inserted (pushed) and removed (popped) strictly from the top.",
    howItWorks: [
      "Push: Insert a new item onto the top of the stack.",
      "Peek: Inspect the top item without removing it.",
      "Pop: Remove and return the most recently inserted item from top.",
      "Track stack capacity or emptiness.",
    ],
    complexity: {
      best: "O(1)",
      average: "O(1)",
      worst: "O(1)",
      space: "O(N)",
    },
    properties: {
      isStable: true,
      isInPlace: true,
      dataStructure: "Stack",
    },
    bestUsedWhen: [
      "Parentheses matching, expression evaluation (RPN), function call stacks.",
      "Monotonic stack for Next Greater Element and Histogram rectangle problems.",
      "Backtracking and undo/redo state histories.",
    ],
  },

  "queue": {
    algoId: "queue",
    name: "Queue (FIFO)",
    category: "Linear Data Structure",
    definition:
      "A First-In, First-Out (FIFO) abstract data type where items are inserted at the back (rear) and removed from the front.",
    howItWorks: [
      "Enqueue: Append element to the rear of the queue.",
      "Front: View element at the front without removal.",
      "Dequeue: Remove and return element from the front.",
      "Maintain order of arrival for fair scheduling.",
    ],
    complexity: {
      best: "O(1)",
      average: "O(1)",
      worst: "O(1)",
      space: "O(N)",
    },
    properties: {
      isStable: true,
      isInPlace: true,
      dataStructure: "Queue",
    },
    bestUsedWhen: [
      "Breadth-First Search (BFS) level-order tree and graph traversals.",
      "Task scheduling, buffer management, rate limiters, print queues.",
    ],
  },

  "bfs": {
    algoId: "bfs",
    name: "Breadth-First Search (BFS)",
    category: "Graph / Tree Traversal",
    definition:
      "A graph traversal algorithm that explores all neighbor nodes at the current depth before moving on to nodes at the next depth level using a FIFO Queue.",
    howItWorks: [
      "Push the starting source node into a FIFO queue and mark it as visited.",
      "Dequeue the front node and process it.",
      "Iterate over all unvisited adjacent neighbors.",
      "Mark each neighbor visited and enqueue it.",
      "Repeat until the queue is completely empty.",
    ],
    complexity: {
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)",
      space: "O(V)",
    },
    properties: {
      isStable: true,
      isInPlace: false,
      dataStructure: "Graph / Queue",
    },
    bestUsedWhen: [
      "Finding the shortest path in unweighted graphs.",
      "Level-order traversal of trees.",
      "Connected component detection and multi-source flood fill algorithms.",
    ],
  },

  "dfs": {
    algoId: "dfs",
    name: "Depth-First Search (DFS)",
    category: "Graph / Tree Traversal",
    definition:
      "A graph traversal algorithm that explores as far as possible along each branch before backtracking using recursion or an explicit LIFO Stack.",
    howItWorks: [
      "Visit the current node and mark it as visited.",
      "For each unvisited neighbor, recursively call DFS.",
      "Continue diving deeper along that branch until a dead end is reached.",
      "Backtrack to the previous node and explore remaining alternate branches.",
    ],
    complexity: {
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)",
      space: "O(V)",
    },
    properties: {
      isStable: true,
      isInPlace: false,
      dataStructure: "Graph / Stack",
    },
    bestUsedWhen: [
      "Topological sorting and cycle detection in directed graphs.",
      "Solving mazes, puzzles, backtracking (N-Queens, Sudoku), and finding connected components.",
      "Path existence queries between two nodes.",
    ],
  },

  "generic": {
    algoId: "generic",
    name: "Custom Algorithm",
    category: "User Code",
    definition:
      "Custom algorithmic code executing with live state instrumentation and variable watch inspect.",
    howItWorks: [
      "Executes user instructions line-by-line in a sandboxed runtime environment.",
      "Captures memory mutations, variable assignments, and loop invariants.",
      "Updates the visualizer and variable inspector on each recorded step.",
    ],
    complexity: {
      best: "Dynamic",
      average: "Dynamic",
      worst: "Dynamic",
      space: "Dynamic",
    },
    properties: {
      isStable: true,
      isInPlace: true,
      dataStructure: "Memory Heap",
    },
    bestUsedWhen: [
      "Testing arbitrary algorithms, experimental solutions, and interview problem logic.",
    ],
  },
};
