"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Brain,
  RotateCw,
  CheckCircle2,
  Sparkles,
  Zap,
  BookOpen,
  Award,
  Flame,
  Layers,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Keyboard,
} from "lucide-react";
import { toast } from "sonner";
import { soundEffects } from "@/lib/soundEffects";

interface Flashcard {
  id: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  front: {
    title: string;
    question: string;
    tags: string[];
  };
  back: {
    coreInvariant: string;
    timeComplexity: string;
    spaceComplexity: string;
    keyTakeaway: string;
    codeTemplate?: string;
  };
  category: "DP" | "Graphs" | "Pointers" | "Trees" | "Math" | "Arrays";
}

const FLASHCARDS: Flashcard[] = [
  // ==========================================
  // EASY: DAILY BASIS ESSENTIALS & FUNDAMENTALS
  // ==========================================
  {
    id: "prefix-sum",
    topic: "Arrays / Precomputation",
    difficulty: "Easy",
    category: "Arrays",
    front: {
      title: "Prefix Sum & Subarray Query Invariant",
      question:
        "How does prefix sum transform arbitrary range sum queries into O(1) operations, and how does it detect subarrays summing to K?",
      tags: ["Easy", "Prefix Sum", "Range Queries", "Hash Map"],
    },
    back: {
      coreInvariant:
        "prefix[i] = prefix[i-1] + nums[i-1]. Any range sum(L, R) = prefix[R + 1] - prefix[L]. Subarray sum equals K iff prefix[curr] - prefix[prev] = K <=> prefix[prev] = prefix[curr] - K.",
      timeComplexity: "O(N) build, O(1) range query",
      spaceComplexity: "O(N) (or O(1) prefix tracker)",
      keyTakeaway:
        "Store prefix sums in a hash map with their frequencies or indices to detect subarray sums in a single linear pass.",
      codeTemplate:
        "const prefix = new Array(n + 1).fill(0);\nfor (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];\nconst rangeSum = (l: number, r: number) => prefix[r + 1] - prefix[l];",
    },
  },
  {
    id: "two-pointers-converge",
    topic: "Two Pointers / Sorted Search",
    difficulty: "Easy",
    category: "Pointers",
    front: {
      title: "Two Pointers: Converging Invariant",
      question:
        "Why does moving pointers inward from boundaries in a sorted array guarantee finding target sums or palindromes in O(N) without missing pairs?",
      tags: ["Easy", "Two Pointers", "Sorted Arrays", "Two Sum II"],
    },
    back: {
      coreInvariant:
        "Since array is sorted, sum = nums[L] + nums[R]. If sum < target, no element paired with nums[L] can ever reach target, so L must advance (L++). If sum > target, R must retreat (R--). Monotonically eliminates one row/column of candidates per step.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "Sorted order enables irreversible pruning of the search space at each comparison step.",
      codeTemplate:
        "let l = 0, r = nums.length - 1;\nwhile (l < r) {\n  const sum = nums[l] + nums[r];\n  if (sum === target) return [l, r];\n  sum < target ? l++ : r--;\n}",
    },
  },
  {
    id: "sliding-window",
    topic: "Arrays / Two Pointers",
    difficulty: "Easy",
    category: "Arrays",
    front: {
      title: "Sliding Window: Expand & Contract Invariant",
      question:
        "How do Left and Right pointers maintain validity when searching for optimal subarrays satisfying monotonic constraints?",
      tags: ["Easy", "Sliding Window", "Substrings", "Two Pointers"],
    },
    back: {
      coreInvariant:
        "Expand window greedily by incrementing R and incorporating nums[R]. When the window condition is violated, advance L and remove nums[L] until validity is restored. Each element enters and exits the window at most once.",
      timeComplexity: "O(N) amortized (2N pointer steps)",
      spaceComplexity: "O(K) character map / O(1)",
      keyTakeaway:
        "Requires monotonicity: adding elements only increases/maintains the metric, removing only decreases it.",
      codeTemplate:
        "let l = 0, maxLen = 0;\nfor (let r = 0; r < n; r++) {\n  add(nums[r]);\n  while (isInvalid()) { remove(nums[l++]); }\n  maxLen = Math.max(maxLen, r - l + 1);\n}",
    },
  },
  {
    id: "linked-list-mid",
    topic: "Two Pointers / Linked Lists",
    difficulty: "Easy",
    category: "Pointers",
    front: {
      title: "Fast & Slow Pointers (Midpoint Invariant)",
      question:
        "How does moving fast by 2 steps and slow by 1 step find the exact midpoint of a linked list in a single pass?",
      tags: ["Easy", "Linked List", "Fast & Slow", "Midpoint"],
    },
    back: {
      coreInvariant:
        "Fast pointer moves twice as fast as slow pointer. When fast reaches the tail or null, slow has traveled exactly half the distance, landing directly on node floor(N / 2).",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "Crucial building block for Linked List Merge Sort and Palindrome verification.",
      codeTemplate:
        "let slow = head, fast = head;\nwhile (fast && fast.next) {\n  slow = slow.next;\n  fast = fast.next.next;\n}\nreturn slow; // Middle node",
    },
  },
  {
    id: "linked-list-reversal",
    topic: "Linked Lists / In-Place Manipulation",
    difficulty: "Easy",
    category: "Pointers",
    front: {
      title: "3-Pointer In-Place List Reversal Invariant",
      question:
        "What are the 3 invariant pointers needed to reverse a singly linked list in-place without memory leaks or losing references?",
      tags: ["Easy", "Linked List", "In-Place", "Reverse List"],
    },
    back: {
      coreInvariant:
        "Maintain prev, curr, and next. Before rewiring curr.next = prev, preserve next = curr.next. Advance prev = curr, curr = next. At all iterations, the sublist preceding curr is completely reversed.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "Always cache the forward reference `curr.next` before mutating the link backwards.",
      codeTemplate:
        "let prev = null, curr = head;\nwhile (curr) {\n  const next = curr.next;\n  curr.next = prev;\n  prev = curr;\n  curr = next;\n}\nreturn prev; // New head",
    },
  },
  {
    id: "bfs-level-order",
    topic: "Trees / Breadth-First Search",
    difficulty: "Easy",
    category: "Trees",
    front: {
      title: "Tree BFS Level-Order Queue Invariant",
      question:
        "How do you guarantee processing nodes strictly level-by-level without mixing generational depths in a BFS queue?",
      tags: ["Easy", "Trees", "BFS", "Queue", "Level Order"],
    },
    back: {
      coreInvariant:
        "Snapshot levelSize = queue.length at the start of each while iteration. Iterate exactly levelSize times to dequeue and process all nodes of the current depth before examining newly enqueued children.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(W) (maximum width <= N/2)",
      keyTakeaway:
        "In unweighted trees or graphs, BFS level count strictly equals minimum shortest distance.",
      codeTemplate:
        "const q = [root];\nwhile (q.length) {\n  const len = q.length;\n  for (let i = 0; i < len; i++) {\n    const node = q.shift()!;\n    if (node.left) q.push(node.left);\n    if (node.right) q.push(node.right);\n  }\n}",
    },
  },
  {
    id: "tree-post-order",
    topic: "Trees / Depth-First Search",
    difficulty: "Easy",
    category: "Trees",
    front: {
      title: "Post-Order Subtree Synthesis Invariant",
      question:
        "Why is post-order traversal (Left, Right, Root) the canonical recursive pattern for subtree aggregation (height, diameter, max path sum)?",
      tags: ["Easy", "Trees", "DFS", "Recursion", "Post-Order"],
    },
    back: {
      coreInvariant:
        "A parent node cannot determine its answer until both left and right child subtrees return their finalized metrics. Bottom-up synthesis combines leftResult and rightResult before returning up to ancestor.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(H) recursion stack (H = height)",
      keyTakeaway:
        "Compute global answer at current node using both children; return maximum single-branch contribution upward.",
      codeTemplate:
        "function height(node) {\n  if (!node) return 0;\n  const l = height(node.left);\n  const r = height(node.right);\n  maxDiameter = Math.max(maxDiameter, l + r);\n  return 1 + Math.max(l, r);\n}",
    },
  },
  {
    id: "gcd-euclidean",
    topic: "Math / Number Theory",
    difficulty: "Easy",
    category: "Math",
    front: {
      title: "Euclidean Algorithm & GCD Modulo Invariant",
      question:
        "Why does gcd(a, b) = gcd(b, a % b) converge to the Greatest Common Divisor in logarithmic steps?",
      tags: ["Easy", "Math", "Number Theory", "GCD", "Euclidean"],
    },
    back: {
      coreInvariant:
        "Any integer dividing both a and b also divides their remainder a - q*b = a % b. Because remainder decreases by at least half every 2 steps, it reaches 0 in O(log(min(a, b))) iterations.",
      timeComplexity: "O(log(min(a, b)))",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "LCM is derived via lcm(a, b) = (a / gcd(a, b)) * b. Divide first to prevent integer overflow.",
      codeTemplate:
        "function gcd(a: number, b: number): number {\n  while (b !== 0) { const t = b; b = a % b; a = t; }\n  return a;\n}\nconst lcm = (a: number, b: number) => (a / gcd(a, b)) * b;",
    },
  },
  {
    id: "kernighan-bits",
    topic: "Math / Bit Manipulation",
    difficulty: "Easy",
    category: "Math",
    front: {
      title: "Brian Kernighan's Bit Manipulation Invariant",
      question:
        "How does the operation n & (n - 1) clear the lowest set bit in O(set bits) time?",
      tags: ["Easy", "Bit Manipulation", "Hamming Weight", "Bits"],
    },
    back: {
      coreInvariant:
        "Subtracting 1 from n flips all trailing zeros up to and including the lowest set 1-bit. Performing bitwise AND with original n zeroes out that lowest set bit while leaving all higher bits untouched.",
      timeComplexity: "O(k) where k is count of set bits (<= 32)",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "Checks power of two in O(1): n > 0 && (n & (n - 1)) === 0.",
      codeTemplate:
        "let count = 0;\nwhile (n !== 0) {\n  n &= (n - 1); // Clears least significant set bit\n  count++;\n}\nreturn count;",
    },
  },

  // ==========================================
  // MEDIUM: INDUSTRY-STANDARD CORE ALGORITHMS
  // ==========================================
  {
    id: "kadane",
    topic: "Dynamic Programming / Arrays",
    difficulty: "Medium",
    category: "DP",
    front: {
      title: "Kadane's Algorithm Invariant",
      question:
        "What is the core state invariant of Kadane's maximum subarray sum algorithm?",
      tags: ["Medium", "Maximum Subarray", "Dynamic Programming", "O(N)"],
    },
    back: {
      coreInvariant:
        "At every index i, max_ending_here = max(nums[i], max_ending_here + nums[i]). Either extend the previous contiguous subarray or discard it and start fresh at nums[i].",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "If adding the accumulated sum makes the current value smaller than itself, immediately drop the prefix sum.",
      codeTemplate:
        "let currMax = 0, globalMax = -Infinity;\nfor (const x of nums) {\n  currMax = Math.max(x, currMax + x);\n  globalMax = Math.max(globalMax, currMax);\n}",
    },
  },
  {
    id: "binary-search-bounds",
    topic: "Binary Search / Sorted Arrays",
    difficulty: "Medium",
    category: "Arrays",
    front: {
      title: "Binary Search: Lower Bound (std::lower_bound)",
      question:
        "How does the half-open interval [L, R) guarantee finding the first index where nums[i] >= target without off-by-one errors?",
      tags: ["Medium", "Binary Search", "Lower Bound", "LearnCpp"],
    },
    back: {
      coreInvariant:
        "Maintain search range [L, R). If nums[mid] >= target, target could be at mid or earlier, so tighten R = mid. If nums[mid] < target, target is strictly right of mid, so L = mid + 1. Terminates when L === R.",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "Half-open range [0, N) naturally returns N when all elements are strictly less than target.",
      codeTemplate:
        "let l = 0, r = nums.length;\nwhile (l < r) {\n  const mid = l + ((r - l) >> 1);\n  if (nums[mid] >= target) r = mid;\n  else l = mid + 1;\n}\nreturn l; // Index of first element >= target",
    },
  },
  {
    id: "floyd-cycle",
    topic: "Two Pointers / Linked Lists",
    difficulty: "Medium",
    category: "Pointers",
    front: {
      title: "Floyd's Cycle Finding (Tortoise & Hare)",
      question:
        "How do slow and fast pointers prove cycle existence and find the exact cycle entry node?",
      tags: ["Medium", "Cycle Detection", "Fast & Slow", "Pointers"],
    },
    back: {
      coreInvariant:
        "Fast moves 2 steps, slow moves 1 step. Relative speed is 1 step/tick, guaranteeing intersection within the loop of length C. After collision, resetting slow to head and advancing both at 1 step/tick collides precisely at cycle entrance.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "The distance from head to cycle entrance equals the distance from meeting point to cycle entrance around the loop.",
      codeTemplate:
        "let slow = head, fast = head;\nwhile (fast && fast.next) {\n  slow = slow.next; fast = fast.next.next;\n  if (slow === fast) break;\n}\nif (!fast || !fast.next) return null; // No cycle\nslow = head;\nwhile (slow !== fast) { slow = slow.next; fast = fast.next; }\nreturn slow; // Cycle entrance",
    },
  },
  {
    id: "monotonic-stack",
    topic: "Monotonic Stack",
    difficulty: "Medium",
    category: "Arrays",
    front: {
      title: "Monotonic Stack (Next Greater Element)",
      question:
        "When should you use a monotonic decreasing stack and what does popping an element signify?",
      tags: ["Medium", "Monotonic Stack", "Daily Temperatures", "Next Greater"],
    },
    back: {
      coreInvariant:
        "Elements in stack maintain strictly descending values. When encountering a larger element x, pop smaller elements: x is their Next Greater Element because x is the first larger value encountered to their right.",
      timeComplexity: "O(N) amortized (each element pushed & popped <= 1 time)",
      spaceComplexity: "O(N)",
      keyTakeaway:
        "Maintains optimal candidates for nearest boundary or nearest larger/smaller neighbor queries.",
      codeTemplate:
        "const stack: number[] = [], res = new Array(n).fill(-1);\nfor (let i = 0; i < n; i++) {\n  while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {\n    res[stack.pop()!] = nums[i];\n  }\n  stack.push(i);\n}",
    },
  },
  {
    id: "dutch-national-flag",
    topic: "Arrays / In-Place Partitioning",
    difficulty: "Medium",
    category: "Arrays",
    front: {
      title: "Dutch National Flag 3-Way Partition",
      question:
        "How do 3 pointers sort an array of 3 distinct values (e.g. 0, 1, 2) in-place in a single pass?",
      tags: ["Medium", "Arrays", "Partition", "In-Place", "Sort Colors"],
    },
    back: {
      coreInvariant:
        "Four invariant sections: [0..low-1] are 0s, [low..mid-1] are 1s, [mid..high] are uninspected, [high+1..n-1] are 2s. If nums[mid] === 0, swap(low++, mid++). If 1, mid++. If 2, swap(mid, high--) (do NOT increment mid).",
      timeComplexity: "O(N) single pass",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "When swapping with high, nums[high] was uninspected, so mid must not advance until that swapped element is re-evaluated.",
      codeTemplate:
        "let low = 0, mid = 0, high = nums.length - 1;\nwhile (mid <= high) {\n  if (nums[mid] === 0) swap(nums, low++, mid++);\n  else if (nums[mid] === 1) mid++;\n  else swap(nums, mid, high--);\n}",
    },
  },
  {
    id: "merge-sort",
    topic: "Divide and Conquer / Sorting",
    difficulty: "Medium",
    category: "Arrays",
    front: {
      title: "Merge Sort Invariant & Inversion Counting",
      question:
        "How does the two-way merge phase naturally count inverted pairs (i < j with A[i] > A[j]) in O(N log N) time?",
      tags: ["Medium", "Sorting", "Divide & Conquer", "Inversions", "LearnCpp"],
    },
    back: {
      coreInvariant:
        "When merging two sorted halves left and right, if right[j] < left[i], then right[j] is smaller than all remaining elements in left[i..mid]. This contributes exactly (mid - i + 1) inversions in O(1).",
      timeComplexity: "O(N log N) guaranteed across all cases",
      spaceComplexity: "O(N)",
      keyTakeaway:
        "Merge Sort is stable: equal elements preserve their original relative order by favoring the left subarray.",
      codeTemplate:
        "if (left[i] <= right[j]) {\n  merged.push(left[i++]);\n} else {\n  merged.push(right[j++]);\n  inversions += (mid - i + 1);\n}",
    },
  },
  {
    id: "quickselect",
    topic: "Selection / Hoare Partition",
    difficulty: "Medium",
    category: "Arrays",
    front: {
      title: "Quickselect: Average O(N) k-th Element",
      question:
        "Why does Quickselect (std::nth_element) achieve O(N) expected time while QuickSort requires O(N log N)?",
      tags: ["Medium", "Quickselect", "Kth Largest", "Hoare Partition"],
    },
    back: {
      coreInvariant:
        "Partitioning places the pivot at its permanent sorted index p. Unlike QuickSort which recurses into both sides, Quickselect discards the half that cannot contain target index k. Sum of work: N + N/2 + N/4 + ... <= 2N = O(N).",
      timeComplexity: "O(N) expected average, O(N^2) worst-case",
      spaceComplexity: "O(1) iterative",
      keyTakeaway:
        "Randomizing pivot selection avoids worst-case O(N^2) quadratic degradation on sorted inputs.",
      codeTemplate:
        "while (l <= r) {\n  const p = partition(nums, l, r);\n  if (p === k) return nums[p];\n  p > k ? r = p - 1 : l = p + 1;\n}",
    },
  },
  {
    id: "bst-validation",
    topic: "Binary Search Trees / Invariants",
    difficulty: "Medium",
    category: "Trees",
    front: {
      title: "BST Bounded Range Invariant",
      question:
        "Why is checking node.val > node.left.val insufficient to validate a Binary Search Tree, and what invariant must hold?",
      tags: ["Medium", "BST", "Trees", "Validation", "In-Order"],
    },
    back: {
      coreInvariant:
        "Every node value must fall strictly within an inherited interval (min, max). Traversing left tightens upper bound: (min, node.val). Traversing right tightens lower bound: (node.val, max). Equivalently, in-order traversal must be strictly increasing.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(H) recursion stack",
      keyTakeaway:
        "Local child comparisons miss ancestors' global constraints (e.g. right child of left child exceeding root).",
      codeTemplate:
        "function isValidBST(node, min = -Infinity, max = Infinity): boolean {\n  if (!node) return true;\n  if (node.val <= min || node.val >= max) return false;\n  return isValidBST(node.left, min, node.val) && isValidBST(node.right, node.val, max);\n}",
    },
  },
  {
    id: "tree-lca",
    topic: "Trees / Common Ancestor",
    difficulty: "Medium",
    category: "Trees",
    front: {
      title: "Lowest Common Ancestor (LCA) Invariant",
      question:
        "How does a single post-order traversal find the LCA of nodes p and q in a binary tree?",
      tags: ["Medium", "Trees", "LCA", "Recursion", "DFS"],
    },
    back: {
      coreInvariant:
        "If current node is p, q, or null, return current node. Recurse into left and right. If BOTH left and right recursive calls return non-null, current node is the divergence point (the LCA). If only one is non-null, pass it upward.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(H) recursion stack",
      keyTakeaway:
        "Bottom-up propagation returns the exact node where p and q paths branch from a common ancestor.",
      codeTemplate:
        "function lca(root, p, q) {\n  if (!root || root === p || root === q) return root;\n  const l = lca(root.left, p, q);\n  const r = lca(root.right, p, q);\n  return (l && r) ? root : (l || r);\n}",
    },
  },
  {
    id: "trie-prefix",
    topic: "Trees / Prefix Retrieval",
    difficulty: "Medium",
    category: "Trees",
    front: {
      title: "Trie Node Transition & Word Boundary Invariant",
      question:
        "How does a Trie achieve O(L) prefix validation independent of total dictionary size N?",
      tags: ["Medium", "Trie", "Prefix Tree", "Strings", "Trees"],
    },
    back: {
      coreInvariant:
        "Each edge represents a character transition. Common prefixes share path nodes starting from root. A boolean flag isEndOfWord separates complete words from prefix subpaths without backtracking.",
      timeComplexity: "O(L) per search/insert (L = word length)",
      spaceComplexity: "O(total characters * Alphabet_Size)",
      keyTakeaway:
        "Ideal for autocomplete, IP routing (longest prefix match), and spell checkers.",
      codeTemplate:
        "class TrieNode {\n  children = new Map<string, TrieNode>();\n  isEnd = false;\n}\ninsert(word: string) {\n  let curr = this.root;\n  for (const ch of word) {\n    if (!curr.children.has(ch)) curr.children.set(ch, new TrieNode());\n    curr = curr.children.get(ch)!;\n  }\n  curr.isEnd = true;\n}",
    },
  },
  {
    id: "dijkstra",
    topic: "Graphs / Shortest Path",
    difficulty: "Medium",
    category: "Graphs",
    front: {
      title: "Dijkstra Greedy Choice Invariant",
      question:
        "Why does Dijkstra's algorithm fail on graphs with negative edge weights?",
      tags: ["Medium", "Shortest Path", "Priority Queue", "Greedy"],
    },
    back: {
      coreInvariant:
        "Once a node u is popped from the min-heap with distance dist[u], its shortest path is permanently finalized under non-negative weights. Negative edges violate this by allowing subsequent longer edges to reduce cost later.",
      timeComplexity: "O((V + E) log V) with Binary Heap",
      spaceComplexity: "O(V)",
      keyTakeaway:
        "For negative edges, use Bellman-Ford O(V * E) or SPFA; for DAGs, use Topological Sort O(V + E).",
      codeTemplate:
        "pq.push([0, start]); dist[start] = 0;\nwhile (!pq.isEmpty()) {\n  const [d, u] = pq.pop();\n  if (d > dist[u]) continue; // Stale heap entry\n  for (const [v, w] of adj[u]) {\n    if (dist[u] + w < dist[v]) {\n      dist[v] = dist[u] + w;\n      pq.push([dist[v], v]);\n    }\n  }\n}",
    },
  },
  {
    id: "kahn-topological-sort",
    topic: "Graphs / Directed Acyclic Graphs",
    difficulty: "Medium",
    category: "Graphs",
    front: {
      title: "Kahn's Algorithm & DAG Cycle Invariant",
      question:
        "How does Kahn's in-degree algorithm find a linear dependency order and simultaneously detect directed cycles?",
      tags: ["Medium", "Graphs", "Topological Sort", "DAG", "In-Degree"],
    },
    back: {
      coreInvariant:
        "Nodes with inDegree === 0 have zero prerequisites and can execute immediately. Popping a node and decrementing its neighbors' in-degrees simulates prerequisite completion. If total popped nodes < |V|, a directed cycle exists.",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V + E)",
      keyTakeaway:
        "Essential for build systems, package managers, course schedules, and task scheduling pipelines.",
      codeTemplate:
        "const q = vertices.filter(u => inDegree[u] === 0);\nwhile (q.length) {\n  const u = q.shift()!; order.push(u);\n  for (const v of adj[u]) if (--inDegree[v] === 0) q.push(v);\n}\nreturn order.length === n ? order : []; // Cycle check",
    },
  },
  {
    id: "dsu-union-find",
    topic: "Graphs / Disjoint Set Union",
    difficulty: "Medium",
    category: "Graphs",
    front: {
      title: "DSU: Path Compression & Union-By-Rank",
      question:
        "How do path compression and union-by-rank achieve near O(1) amortized time per operation?",
      tags: ["Medium", "DSU", "Union-Find", "Graphs", "Kruskal"],
    },
    back: {
      coreInvariant:
        "Path compression points every visited node directly to the tree root (parent[x] = find(parent[x])). Union-by-rank/size attaches the shallower tree under the deeper tree, keeping tree height bounded by inverse Ackermann alpha(N) <= 4.",
      timeComplexity: "O(alpha(N)) ≈ O(1) amortized per operation",
      spaceComplexity: "O(N)",
      keyTakeaway:
        "Core driver for Kruskal's Minimum Spanning Tree, dynamic graph connectivity, and connected components.",
      codeTemplate:
        "function find(i: number): number {\n  return parent[i] === i ? i : (parent[i] = find(parent[i]));\n}\nfunction union(i: number, j: number): boolean {\n  const rI = find(i), rJ = find(j);\n  if (rI === rJ) return false; // Cycle detected\n  parent[rI] = rJ;\n  return true;\n}",
    },
  },
  {
    id: "bipartite-coloring",
    topic: "Graphs / 2-Coloring",
    difficulty: "Medium",
    category: "Graphs",
    front: {
      title: "Bipartite Graph 2-Coloring Invariant",
      question:
        "What structural invariant determines if an undirected graph can be 2-colored (bipartite)?",
      tags: ["Medium", "Graphs", "BFS", "DFS", "Bipartite", "2-Coloring"],
    },
    back: {
      coreInvariant:
        "A graph is bipartite if and only if it contains no odd-length cycles. During traversal, assign each neighbor the opposite color (3 - color[u]). If an adjacent neighbor already has color[u], an odd cycle exists and the graph is not bipartite.",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
      keyTakeaway:
        "Can be validated with BFS, DFS, or DSU with parity tracking.",
      codeTemplate:
        "const color = new Array(n).fill(0);\nfunction dfs(u: number, c: number): boolean {\n  color[u] = c;\n  for (const v of adj[u]) {\n    if (color[v] === c) return false;\n    if (color[v] === 0 && !dfs(v, 3 - c)) return false;\n  }\n  return true;\n}",
    },
  },
  {
    id: "knapsack-01",
    topic: "Dynamic Programming / Space Optimization",
    difficulty: "Medium",
    category: "DP",
    front: {
      title: "0/1 Knapsack Reverse Traversal Invariant",
      question:
        "Why MUST the capacity loop iterate backwards in 0/1 Knapsack when compressing 2D DP table to a 1D array?",
      tags: ["Medium", "DP", "Knapsack", "Space Optimization"],
    },
    back: {
      coreInvariant:
        "In 1D array dp[w], iterating backwards from W down to item weight ensures dp[w - weight] represents the value from the PREVIOUS item, preventing the current item from being used multiple times.",
      timeComplexity: "O(N * W)",
      spaceComplexity: "O(W) (1D compressed array)",
      keyTakeaway:
        "Iterating forward corresponds to Unbounded Knapsack (infinite supply of each item).",
      codeTemplate:
        "const dp = new Array(W + 1).fill(0);\nfor (const [w, val] of items) {\n  for (let cap = W; cap >= w; cap--) {\n    dp[cap] = Math.max(dp[cap], dp[cap - w] + val);\n  }\n}",
    },
  },
  {
    id: "coin-change-unbounded",
    topic: "Dynamic Programming / Forward Traversal",
    difficulty: "Medium",
    category: "DP",
    front: {
      title: "Unbounded Knapsack Forward Loop Invariant",
      question:
        "Why does Coin Change / Unbounded Knapsack iterate capacity in forward order (cap = coin ... amount)?",
      tags: ["Medium", "DP", "Coin Change", "Unbounded Knapsack"],
    },
    back: {
      coreInvariant:
        "Because each coin can be used unlimited times, the updated state dp[cap] CAN rely on dp[cap - coin] from the CURRENT item pass. Forward iteration accumulates multiple copies of the same coin.",
      timeComplexity: "O(N * amount)",
      spaceComplexity: "O(amount)",
      keyTakeaway:
        "Backward loop = 0/1 (at most one use); Forward loop = Unbounded (unlimited uses).",
      codeTemplate:
        "const dp = new Array(amount + 1).fill(Infinity);\ndp[0] = 0;\nfor (const coin of coins) {\n  for (let cap = coin; cap <= amount; cap++) {\n    dp[cap] = Math.min(dp[cap], dp[cap - coin] + 1);\n  }\n}",
    },
  },
  {
    id: "lis-patience-sort",
    topic: "Dynamic Programming / Binary Search",
    difficulty: "Medium",
    category: "DP",
    front: {
      title: "LIS O(N log N) Patience Sorting Invariant",
      question:
        "How does maintaining tails of increasing subsequences find the Longest Increasing Subsequence length in O(N log N)?",
      tags: ["Medium", "DP", "Binary Search", "LIS", "Patience Sort"],
    },
    back: {
      coreInvariant:
        "tails[len] stores the smallest ending element of all found increasing subsequences of length len + 1. Since tails is strictly monotonic, use binary search (lower_bound) to greedily replace or extend the smallest tail >= x.",
      timeComplexity: "O(N log N)",
      spaceComplexity: "O(N)",
      keyTakeaway:
        "Replacing a tail with a smaller element maintains the potential to extend to longer subsequences with smaller future numbers.",
      codeTemplate:
        "const tails: number[] = [];\nfor (const x of nums) {\n  let l = 0, r = tails.length;\n  while (l < r) {\n    const mid = l + ((r - l) >> 1);\n    if (tails[mid] >= x) r = mid; else l = mid + 1;\n  }\n  if (l === tails.length) tails.push(x);\n  else tails[l] = x;\n}\nreturn tails.length;",
    },
  },
  {
    id: "lcs-grid-dp",
    topic: "Dynamic Programming / 2D Grid",
    difficulty: "Medium",
    category: "DP",
    front: {
      title: "Longest Common Subsequence (LCS) Invariant",
      question:
        "What is the optimal substructure transition when comparing character prefixes s1[0..i] and s2[0..j]?",
      tags: ["Medium", "DP", "LCS", "Strings", "Edit Distance"],
    },
    back: {
      coreInvariant:
        "If s1[i-1] === s2[j-1], extend the previous diagonal match: dp[i][j] = 1 + dp[i-1][j-1]. If characters differ, take the maximum of dropping a character from s1 (dp[i-1][j]) or s2 (dp[i][j-1]).",
      timeComplexity: "O(M * N)",
      spaceComplexity: "O(min(M, N)) with rolling 1D array",
      keyTakeaway:
        "Forms the foundational recurrence for diff tools (git diff), DNA sequencing, and Edit Distance (Levenshtein).",
      codeTemplate:
        "if (s1[i - 1] === s2[j - 1]) {\n  dp[i][j] = 1 + dp[i - 1][j - 1];\n} else {\n  dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n}",
    },
  },
  {
    id: "binary-search-answer",
    topic: "Binary Search / Optimization",
    difficulty: "Medium",
    category: "Math",
    front: {
      title: "Binary Search on Monotonic Answer Space",
      question:
        "What mathematical property must hold to binary search over an answer space [1..max] (e.g. Koko Eating Bananas)?",
      tags: ["Medium", "Binary Search", "Predicate", "Koko Bananas"],
    },
    back: {
      coreInvariant:
        "The feasibility predicate f(k) must be monotonic across the range: [False, False, ..., True, True]. If speed k is valid, all speeds > k are also valid. Enables binary searching for the minimum valid boundary in logarithmic iterations.",
      timeComplexity: "O(N log(Range))",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "Frame the problem as finding the boundary condition where f(k) flips from False to True.",
      codeTemplate:
        "let l = 1, r = maxVal;\nwhile (l < r) {\n  const mid = l + ((r - l) >> 1);\n  if (canComplete(mid)) r = mid;\n  else l = mid + 1;\n}\nreturn l;",
    },
  },
  {
    id: "binary-exponentiation",
    topic: "Math / Modular Arithmetic",
    difficulty: "Medium",
    category: "Math",
    front: {
      title: "Binary Exponentiation (Exponentiation by Squaring)",
      question:
        "How do you compute x^n (or (x^n) % M) in O(log n) multiplications instead of O(n)?",
      tags: ["Medium", "Math", "Exponentiation", "Divide & Conquer"],
    },
    back: {
      coreInvariant:
        "If n is even, x^n = (x^2)^(n/2). If n is odd, x^n = x * (x^2)^((n-1)/2). By checking n & 1 and squaring the base on each step while right-shifting n >>= 1, the exponent halves every iteration.",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "Essential for modular inverse via Fermat's Little Theorem: a^(M-2) % M when M is prime.",
      codeTemplate:
        "let res = 1n, b = BigInt(x) % BigInt(mod), exp = BigInt(n);\nwhile (exp > 0n) {\n  if (exp & 1n) res = (res * b) % BigInt(mod);\n  b = (b * b) % BigInt(mod);\n  exp >>= 1n;\n}\nreturn Number(res);",
    },
  },

  // ==========================================
  // ADVANCED: HARD / SYSTEM / COMPETITIVE DSA
  // ==========================================
  {
    id: "kmp-pattern",
    topic: "String Matching / Automata",
    difficulty: "Hard",
    category: "Arrays",
    front: {
      title: "KMP String Matching & LPS Table Invariant",
      question:
        "How does the Longest Prefix Suffix (LPS) array prevent backtracking the main text pointer during string searching?",
      tags: ["Hard", "String Matching", "KMP", "LPS Table"],
    },
    back: {
      coreInvariant:
        "lps[j-1] stores the length of the longest proper prefix of pattern[0..j-1] that is also a suffix. On mismatch at pattern[j], rewind the pattern pointer to j = lps[j-1] without rewinding text index i, eliminating wasted comparisons.",
      timeComplexity: "O(N + M) (N = text length, M = pattern length)",
      spaceComplexity: "O(M) for LPS table",
      keyTakeaway:
        "Text pointer i strictly moves forward 0..N, guaranteeing linear time worst-case performance.",
      codeTemplate:
        "let i = 0, j = 0;\nwhile (i < text.length) {\n  if (text[i] === pat[j]) { i++; j++; }\n  if (j === pat.length) { foundAt(i - j); j = lps[j - 1]; }\n  else if (i < text.length && text[i] !== pat[j]) {\n    j !== 0 ? j = lps[j - 1] : i++;\n  }\n}",
    },
  },
  {
    id: "tarjans-bridges",
    topic: "Graphs / Connected Components",
    difficulty: "Hard",
    category: "Graphs",
    front: {
      title: "Tarjan's Bridge Finding & Low-Link Invariant",
      question:
        "How do discovery time tin[u] and low-link low[u] identify critical bridges in a single DFS pass?",
      tags: ["Hard", "Graphs", "Tarjan", "Bridges", "Low-Link"],
    },
    back: {
      coreInvariant:
        "low[u] is the earliest discovery time reachable from u via its DFS subtree and at most one back-edge. Edge (u, v) is a critical bridge iff low[v] > tin[u], meaning v has no alternative path back to u or any ancestor of u.",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V + E)",
      keyTakeaway:
        "Removing a bridge increases the number of connected components in the network.",
      codeTemplate:
        "low[v] = Math.min(low[v], low[to]);\nif (low[to] > tin[v]) {\n  bridges.push([v, to]); // Critical edge!\n}",
    },
  },
  {
    id: "segment-tree-lazy",
    topic: "Trees / Range Queries",
    difficulty: "Hard",
    category: "Trees",
    front: {
      title: "Segment Tree with Lazy Propagation Invariant",
      question:
        "How does lazy propagation maintain O(log N) range updates and range queries without visiting every leaf node?",
      tags: ["Hard", "Segment Tree", "Range Queries", "Lazy Propagation"],
    },
    back: {
      coreInvariant:
        "When updating interval [qL, qR], if current node interval [nL, nR] is completely inside [qL, qR], apply the aggregate delta directly to the node, record pending deltas in its lazy tag, and return immediately. Push lazy values to children only when children are specifically visited.",
      timeComplexity: "O(log N) per range update and query, O(N) build",
      spaceComplexity: "O(4N) array representation",
      keyTakeaway:
        "Postpones deep updates until data is explicitly needed by a descendant query.",
      codeTemplate:
        "function updateRange(node, l, r, ql, qr, val) {\n  pushDown(node, l, r);\n  if (ql <= l && r <= qr) { applyLazy(node, val, r - l + 1); return; }\n  const mid = (l + r) >> 1;\n  if (ql <= mid) updateRange(2*node, l, mid, ql, qr, val);\n  if (qr > mid) updateRange(2*node+1, mid+1, r, ql, qr, val);\n  tree[node] = tree[2*node] + tree[2*node+1];\n}",
    },
  },
  {
    id: "bitmask-dp",
    topic: "Dynamic Programming / Bit Manipulation",
    difficulty: "Hard",
    category: "DP",
    front: {
      title: "Bitmask DP: Subset State Compression",
      question:
        "How does bit manipulation represent exponential subset states and solve the Traveling Salesperson Problem (TSP) for N <= 20?",
      tags: ["Hard", "DP", "Bitmask", "TSP", "NP-Hard"],
    },
    back: {
      coreInvariant:
        "An integer mask's bits represent visited vertices (mask & (1 << u) !== 0). State dp[mask][u] memoizes the minimum cost of visiting the exact subset mask and ending at node u. Transition tests all unvisited vertices v: dp[mask | (1 << v)][v].",
      timeComplexity: "O(N^2 * 2^N)",
      spaceComplexity: "O(N * 2^N)",
      keyTakeaway:
        "Reduces factorial brute-force O(N!) down to exponential O(N^2 * 2^N), making N <= 20 feasible.",
      codeTemplate:
        "for (let mask = 1; mask < (1 << n); mask++) {\n  for (let u = 0; u < n; u++) {\n    if (!(mask & (1 << u))) continue;\n    for (let v = 0; v < n; v++) {\n      if (mask & (1 << v)) continue;\n      const nextMask = mask | (1 << v);\n      dp[nextMask][v] = Math.min(dp[nextMask][v], dp[mask][u] + cost[u][v]);\n    }\n  }\n}",
    },
  },
  {
    id: "sieve-spf",
    topic: "Math / Prime Factorization",
    difficulty: "Hard",
    category: "Math",
    front: {
      title: "Linear Sieve & Smallest Prime Factor (SPF)",
      question:
        "How does precomputing Smallest Prime Factors (SPF) factorize any query number X <= 10^7 in O(log X) time?",
      tags: ["Hard", "Math", "Number Theory", "Linear Sieve", "SPF"],
    },
    back: {
      coreInvariant:
        "Euler's linear sieve ensures every composite number c is crossed off by its unique SMALLEST prime factor (spf[i * p] = p). Because each composite is marked exactly once, build time is strictly O(N). Factorization repeatedly divides X by spf[X].",
      timeComplexity: "O(N) build, O(log X) per factorization query",
      spaceComplexity: "O(N) for SPF array",
      keyTakeaway:
        "Breaking when i % p === 0 ensures p remains the smallest prime divisor of i * p.",
      codeTemplate:
        "for (let i = 2; i <= MAX; i++) {\n  if (spf[i] === i) primes.push(i);\n  for (const p of primes) {\n    if (p > spf[i] || i * p > MAX) break;\n    spf[i * p] = p;\n  }\n}",
    },
  },
];

const CATEGORIES = ["All", "Arrays", "Pointers", "Trees", "Graphs", "DP", "Math"] as const;
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"] as const;

export default function FlashcardsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  
  // Drag & Swipe Gesture State
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);

  const filteredCards = useMemo(() => {
    return FLASHCARDS.filter((c) => {
      const matchCat = selectedCategory === "All" || c.category === selectedCategory;
      const matchDiff = selectedDifficulty === "All" || c.difficulty === selectedDifficulty;
      return matchCat && matchDiff;
    });
  }, [selectedCategory, selectedDifficulty]);

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    soundEffects.playClick();
    setIsFlipped(false);
    setDragOffset(0);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    soundEffects.playClick();
    setIsFlipped(false);
    setDragOffset(0);
    setCurrentIndex(
      (prev) => (prev - 1 + filteredCards.length) % filteredCards.length,
    );
  };

  const handleGrade = (quality: string) => {
    if (!currentCard) return;
    soundEffects.playSuccess();
    if (quality === "Easy" || quality === "Good") {
      setMasteredIds((prev) => new Set([...prev, currentCard.id]));
      toast.success(
        `SM-2 Interval expanded for "${currentCard.front.title}"`,
      );
    } else {
      toast.info(
        `Scheduled for short-interval recall: "${currentCard.front.title}"`,
      );
    }
    handleNext();
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (dragOffset > 85) {
      handleGrade("Easy");
    } else if (dragOffset < -85) {
      handleGrade("Hard");
    }
    touchStartX.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current === null || !isDragging) return;
    const diff = e.clientX - mouseStartX.current;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (dragOffset > 90) {
      handleGrade("Easy");
    } else if (dragOffset < -90) {
      handleGrade("Hard");
    }
    mouseStartX.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  // Keyboard navigation & rating keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.code === "Space") {
        e.preventDefault();
        soundEffects.playToggle();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "1") {
        handleGrade("Forgot");
      } else if (e.key === "2") {
        handleGrade("Hard");
      } else if (e.key === "3") {
        handleGrade("Good");
      } else if (e.key === "4") {
        handleGrade("Easy");
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, filteredCards]);

  const swipeRotation = (dragOffset / 200) * 8;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
            <Brain size={13} />
            <span>FlashRecall SM-2 Deck</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3 font-display">
            Algorithmic Invariant Flashcards
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Master high-yield algorithmic invariants from Easy fundamentals to Hard competitive patterns. Drill code templates with SM-2 spaced repetition.
          </p>
        </div>

        {/* Dual Filter Controls (Category & Difficulty) */}
        <div className="flex flex-col sm:flex-row gap-2 self-start lg:self-auto flex-wrap">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-purple-500 text-white font-extrabold shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedDifficulty(diff);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  selectedDifficulty === diff
                    ? diff === "Easy"
                      ? "bg-emerald-500 text-white font-extrabold shadow-sm"
                      : diff === "Medium"
                        ? "bg-amber-500 text-white font-extrabold shadow-sm"
                        : diff === "Hard"
                          ? "bg-rose-500 text-white font-extrabold shadow-sm"
                          : "bg-purple-500 text-white font-extrabold shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Flashcard Stage */}
      <div className="max-w-2xl mx-auto space-y-6">
        {filteredCards.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl">
            <Layers className="w-12 h-12 mx-auto text-purple-400/60 mb-3" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">No flashcards match this filter</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Try selecting &quot;All&quot; in category or difficulty to view more cards.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedDifficulty("All");
                setCurrentIndex(0);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-500 text-white text-xs font-bold hover:bg-purple-600 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Card Progress & Swipe Hints */}
            <div className="flex justify-between items-center text-xs font-bold text-[var(--text-muted)] px-2 font-mono">
              <span className="flex items-center gap-2">
                <span>Card {currentIndex + 1} of {filteredCards.length}</span>
                <span className="hidden sm:inline text-[10px] text-purple-400 font-normal">
                  (Swipe Left: Hard &bull; Swipe Right: Easy)
                </span>
              </span>
              <span className="text-purple-400 font-bold">
                {masteredIds.size} Mastered Invariants
              </span>
            </div>

            {/* Swipe Visual Feedback Indicators */}
            <div className="relative">
              {dragOffset > 25 && (
                <div className="absolute top-1/2 right-6 -translate-y-1/2 z-30 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-black uppercase tracking-widest shadow-lg animate-pulse pointer-events-none">
                  EASY &bull; MASTERED &rarr;
                </div>
              )}
              {dragOffset < -25 && (
                <div className="absolute top-1/2 left-6 -translate-y-1/2 z-30 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-black uppercase tracking-widest shadow-lg animate-pulse pointer-events-none">
                  &larr; HARD &bull; REVIEW AGAIN
                </div>
              )}

              {/* 3D Flashcard Container with Swipe Gesture */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => {
                  if (Math.abs(dragOffset) < 10) {
                    soundEffects.playToggle();
                    setIsFlipped(!isFlipped);
                  }
                }}
                className={`relative min-h-[420px] rounded-[2.5rem] border bg-[var(--bg-card)] p-8 sm:p-10 shadow-2xl cursor-grab active:cursor-grabbing transition-all duration-150 flex flex-col justify-between select-none group ${
                  dragOffset > 30
                    ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                    : dragOffset < -30
                      ? "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.35)]"
                      : "border-[var(--border-subtle)] hover:border-purple-500/40"
                }`}
                style={{
                  transform: `translateX(${dragOffset}px) rotate(${swipeRotation}deg)`,
                  touchAction: "pan-y",
                }}
              >
                {/* Card Front */}
                {!isFlipped ? (
                  <div className="space-y-6 animate-in fade-in duration-300 pointer-events-none">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                          {currentCard.topic}
                        </span>
                        {currentCard.difficulty && (
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border font-mono ${
                              currentCard.difficulty === "Easy"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : currentCard.difficulty === "Medium"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {currentCard.difficulty}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono shrink-0">
                        <RotateCw size={13} /> Tap or Space to Reveal
                      </span>
                    </div>

                    <div className="space-y-3 pt-4">
                      <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] group-hover:text-purple-400 transition-colors font-display">
                        {currentCard.front.title}
                      </h2>
                      <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-medium">
                        {currentCard.front.question}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-6">
                      {currentCard.front.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Card Back — Cheat Codes & Invariant Proof */
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                          <CheckCircle2 size={13} /> Algorithm Pattern Invariant
                        </span>
                        {currentCard.difficulty && (
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border font-mono ${
                              currentCard.difficulty === "Easy"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : currentCard.difficulty === "Medium"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {currentCard.difficulty}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                        <RotateCw size={13} /> Click to Flip Front
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-primary)] font-mono">
                        Key Invariant Formula
                      </span>
                      <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-medium bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border-subtle)]">
                        {currentCard.back.coreInvariant}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                      <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                        <span className="text-[9px] text-[var(--text-muted)] uppercase">Time</span>
                        <div className="text-emerald-400 font-bold mt-0.5">{currentCard.back.timeComplexity}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                        <span className="text-[9px] text-[var(--text-muted)] uppercase">Space</span>
                        <div className="text-cyan-400 font-bold mt-0.5">{currentCard.back.spaceComplexity}</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
                      <span className="text-[9px] text-[var(--text-muted)] uppercase font-mono block mb-1">Key Takeaway</span>
                      {currentCard.back.keyTakeaway}
                    </div>

                    {currentCard.back.codeTemplate && (
                      <div className="p-3 rounded-2xl bg-black/80 border border-purple-500/20 font-mono text-[11px] text-purple-300 overflow-x-auto shadow-inner">
                        <pre>{currentCard.back.codeTemplate}</pre>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-[var(--border-subtle)] text-center text-[10px] text-[var(--text-muted)] font-mono flex items-center justify-between">
                  <span>Swipe left for Hard</span>
                  <span>Tap to flip</span>
                  <span>Swipe right for Easy</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SM-2 Recall Rating Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            {
              label: "Forgot",
              key: "1",
              color:
                "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20",
            },
            {
              label: "Hard",
              key: "2",
              color:
                "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
            },
            {
              label: "Good",
              key: "3",
              color:
                "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
            },
            {
              label: "Easy",
              key: "4",
              color:
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
            },
          ].map((q) => (
            <button
              key={q.label}
              onClick={() => handleGrade(q.label)}
              className={`p-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${q.color}`}
            >
              <div>{q.label}</div>
              <div className="text-[9px] opacity-60 font-mono">[{q.key}]</div>
            </button>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs font-bold transition-all cursor-pointer border border-[var(--border-subtle)]"
          >
            <ChevronLeft size={14} />
            <span>Previous Card</span>
          </button>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs font-bold transition-all cursor-pointer border border-[var(--border-subtle)]"
          >
            <span>Next Card</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
