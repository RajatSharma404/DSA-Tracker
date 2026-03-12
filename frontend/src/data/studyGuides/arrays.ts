import { StudyGuide } from "./types";

export const arraysGuide: StudyGuide = {
  topicName: "Arrays",
  emoji: "📊",
  tagline:
    "The foundation of everything — master arrays and 60% of DSA is done",
  prerequisite: "C++ Basics",
  sections: [
    {
      title: "What Are Arrays & Why They Matter",
      icon: "🧠",
      content: `An array is a contiguous block of memory storing elements in indexed positions. It's the most fundamental data structure and appears in 60%+ of interview problems.

  Index:  0   1   2   3   4
  Value: [10, 20, 30, 40, 50]
         ↑                 ↑
       arr[0]=10        arr[4]=50

Why contiguous memory matters:
• Random access in O(1) — jump directly to any index
• Cache-friendly — elements stored next to each other in RAM
• But insertion/deletion in the middle is O(N) — everything shifts`,
    },
    {
      title: "Core Operations & Their Cost",
      icon: "⚙️",
      content: `▸ Access by index: arr[i]        → O(1) ✅
▸ Search (unsorted): arr.indexOf(x) → O(N)
▸ Search (sorted): binary search   → O(log N) ✅
▸ Insert at end: arr.push(x)      → O(1) amortized
▸ Insert at index i:               → O(N) — shifts elements right
▸ Delete at end: arr.pop()        → O(1)
▸ Delete at index i:               → O(N) — shifts elements left

The golden rule: If you need frequent insertions/deletions in the middle, consider a Linked List instead.`,
    },
    {
      title: "The 5 Array Patterns You MUST Know",
      icon: "🔑",
      content: `1. TWO POINTERS — Use two indices moving toward/away from each other
   When: sorted arrays, pair problems, palindromes
   
2. SLIDING WINDOW — Maintain a window and slide it across
   When: subarray/substring problems, "maximum of size K"

3. PREFIX SUM — Precompute cumulative sums for range queries
   prefix[i] = arr[0] + arr[1] + ... + arr[i-1]
   Sum from i to j = prefix[j+1] - prefix[i]

4. IN-PLACE MODIFICATION — Solve without extra space
   When: "do it in O(1) space", remove duplicates, move zeros

5. SORTING + GREEDY — Sort first, then make greedy choices
   When: "find pairs", "merge intervals", "meeting rooms"`,
    },
    {
      title: "Prefix Sum Deep Dive",
      icon: "📐",
      content: `Prefix sum is one of the most powerful array techniques. It converts O(N) range-sum queries into O(1).

Build phase — O(N):
  arr    = [2, 4, 1, 3, 5]
  prefix = [0, 2, 6, 7, 10, 15]
           ↑  ↑
        prefix[0]=0 always    prefix[5] = sum of all

Query phase — O(1):
  Sum of arr[1..3] = prefix[4] - prefix[1] = 10 - 2 = 8
  (which is 4 + 1 + 3 = 8 ✅)

This pattern appears in: subarray sum equals K, range sum queries, product of array except self.`,
    },
  ],
  patternTriggers: [
    { trigger: "Sorted array + find pair/triplet", pattern: "Two Pointers" },
    {
      trigger: 'Subarray of size K or "contiguous"',
      pattern: "Sliding Window",
    },
    { trigger: 'Range sum query or "subarray sum"', pattern: "Prefix Sum" },
    {
      trigger: '"In-place" or "O(1) space"',
      pattern: "In-place modification with pointers",
    },
    {
      trigger: '"Find duplicates" in sorted array',
      pattern: "Two pointers or Set",
    },
    {
      trigger: '"Rotate array"',
      pattern: "Reverse trick: reverse all → reverse parts",
    },
  ],
  complexityTable: [
    { operation: "Access arr[i]", time: "O(1)", space: "O(1)" },
    { operation: "Linear search", time: "O(N)", space: "O(1)" },
    { operation: "Binary search (sorted)", time: "O(log N)", space: "O(1)" },
    { operation: "Push / Pop (end)", time: "O(1)", space: "O(1)" },
    { operation: "Insert / Delete (middle)", time: "O(N)", space: "O(1)" },
    { operation: "Sort", time: "O(N log N)", space: "O(N)" },
  ],
  codeExample: {
    title: "Maximum Subarray Sum (Kadane's Algorithm)",
    code: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    // Either extend the current subarray or start fresh
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}`,
    walkthrough: `Input: [-2, 1, -3, 4, -1, 2, 1, -5, 4]

i=1: curr = max(1, -2+1) = 1,   maxSum = 1
i=2: curr = max(-3, 1-3) = -2,  maxSum = 1
i=3: curr = max(4, -2+4) = 4,   maxSum = 4
i=4: curr = max(-1, 4-1) = 3,   maxSum = 4
i=5: curr = max(2, 3+2) = 5,    maxSum = 5
i=6: curr = max(1, 5+1) = 6,    maxSum = 6 ✅
i=7: curr = max(-5, 6-5) = 1,   maxSum = 6
i=8: curr = max(4, 1+4) = 5,    maxSum = 6

Answer: 6 (subarray [4, -1, 2, 1])
Key insight: At each element, decide — is it better to extend or restart?`,
  },
  keyTakeaways: [
    "Arrays are O(1) access but O(N) insert/delete in the middle",
    "Prefix sum converts O(N) range queries to O(1)",
    "Kadane's algorithm is the go-to for max subarray problems",
    'When you see "sorted array" — immediately think Two Pointers or Binary Search',
    "The reverse trick solves rotation: reverse whole → reverse parts",
  ],
};
