import { StudyGuide } from './types';

export const heapsGuide: StudyGuide = {
  topicName: 'Heaps',
  emoji: '⛰️',
  tagline: 'Always know the min or max in O(1) — priority queues for the win',
  prerequisite: 'Arrays, Trees',
  sections: [
    { title: 'What Is a Heap?', icon: '🧠', content: `A heap is a complete binary tree stored as an array where every parent is ≤ children (min-heap) or ≥ children (max-heap).

  Min-Heap as array: [1, 3, 5, 7, 9, 8]
  
  Visually:      1
              /     \\
             3       5
            / \\     /
           7   9   8

  Parent of i:      Math.floor((i-1)/2)
  Left child of i:  2*i + 1
  Right child of i: 2*i + 2

Key property: root is ALWAYS the min (or max). O(1) to peek!` },
    { title: 'Operations', icon: '⚙️', content: `INSERT (push) — O(log N):
  Add at end, then "bubble up" (swap with parent if smaller)

EXTRACT MIN/MAX (pop) — O(log N):
  Remove root, move last element to root, then "bubble down"

PEEK — O(1): just return arr[0]

JS doesn't have a built-in heap! You need to implement one or use a simple sorted approach for interviews:

  // Quick & dirty for small heaps:
  arr.push(val);
  arr.sort((a,b) => a-b);  // O(N log N) but simple

  // For production: implement MinHeap class with bubbleUp/bubbleDown` },
    { title: 'Top K Pattern', icon: '🏆', content: `The #1 heap pattern: "Find K largest/smallest/most frequent"

Approach: Maintain a heap of size K.

  Kth Largest → Min-heap of size K
  (heap top = Kth largest, anything smaller gets rejected)

  Kth Smallest → Max-heap of size K

  Top K Frequent → Frequency map + min-heap of size K

  function topKFrequent(nums, k) {
    const freq = new Map();
    for (const n of nums) freq.set(n, (freq.get(n)||0)+1);
    // Sort by frequency and take top K
    return [...freq.entries()]
      .sort((a,b) => b[1]-a[1])
      .slice(0, k)
      .map(e => e[0]);
  }` },
    { title: 'Two Heaps Pattern', icon: '⚖️', content: `Use a max-heap + min-heap to find the MEDIAN of a stream.

  maxHeap stores the smaller half
  minHeap stores the larger half
  
  Median = maxHeap.peek() (if odd) or avg of both peeks (if even)

  Add number:
  1. Add to maxHeap
  2. Move maxHeap's top to minHeap (balance)
  3. If minHeap is larger, move its top back to maxHeap

This gives O(log N) insert and O(1) median query.` }
  ],
  patternTriggers: [
    { trigger: '"Kth largest/smallest"', pattern: 'Min/max heap of size K' },
    { trigger: '"Top K frequent elements"', pattern: 'Frequency map + heap/sort' },
    { trigger: '"Median from data stream"', pattern: 'Two heaps (max + min)' },
    { trigger: '"Merge K sorted lists"', pattern: 'Min-heap with K pointers' },
    { trigger: '"Closest points to origin"', pattern: 'Max-heap of size K on distances' },
  ],
  complexityTable: [
    { operation: 'Insert (push)', time: 'O(log N)', space: 'O(1)' },
    { operation: 'Extract min/max (pop)', time: 'O(log N)', space: 'O(1)' },
    { operation: 'Peek', time: 'O(1)', space: 'O(1)' },
    { operation: 'Build heap from array', time: 'O(N)', space: 'O(1)' },
    { operation: 'Top K elements', time: 'O(N log K)', space: 'O(K)' },
  ],
  codeExample: {
    title: 'Kth Largest Element',
    code: `function findKthLargest(nums, k) {
  // Simple approach using sort
  nums.sort((a, b) => b - a);
  return nums[k - 1];
  
  // Optimal: use QuickSelect for O(N) average
  // Or maintain a min-heap of size K
}`,
    walkthrough: `Input: nums=[3,2,1,5,6,4], k=2

Sorted descending: [6, 5, 4, 3, 2, 1]
k=2 → nums[1] = 5 ✅

With min-heap of size 2:
  Process 3: heap=[3]
  Process 2: heap=[2,3]
  Process 1: 1 < heap.peek()=2, skip
  Process 5: push, remove min → heap=[3,5]
  Process 6: push, remove min → heap=[5,6]
  Process 4: 4 < heap.peek()=5, skip
  Answer: heap.peek() = 5 ✅`
  },
  keyTakeaways: [
    'Heap = complete binary tree stored as array',
    'Min-heap top = minimum, Max-heap top = maximum',
    'Top K pattern: keep a heap of size K',
    'JS has no built-in heap — sort-based approach works for interviews',
    'Two heaps pattern solves streaming median in O(log N)'
  ]
};
