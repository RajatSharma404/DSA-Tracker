import { StudyGuide } from './types';

export const binarySearchGuide: StudyGuide = {
  topicName: 'Binary Search',
  emoji: '🔍',
  tagline: 'Halve the search space every step — O(log N) is your superpower',
  prerequisite: 'Arrays',
  sections: [
    { title: 'The Core Idea', icon: '🧠', content: `Binary Search eliminates HALF the possibilities each step. Requires sorted data.

  [1, 3, 5, 7, 9, 11, 13]  target = 7
   L           M          R
   
  arr[M]=7 == target → FOUND!

  If target < arr[M] → search left half (R = M-1)
  If target > arr[M] → search right half (L = M+1)

Each step halves the array → O(log N). For N=1,000,000 that's just 20 steps!` },
    { title: 'The Two Templates', icon: '📝', content: `TEMPLATE 1: Find exact target
  function binarySearch(arr, target) {
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2); // avoid overflow
      if (arr[mid] === target) return mid;
      else if (arr[mid] < target) lo = mid + 1;
      else hi = mid - 1;
    }
    return -1; // not found
  }

TEMPLATE 2: Find first/last position (boundary search)
  function lowerBound(arr, target) {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (arr[mid] < target) lo = mid + 1;
      else hi = mid; // don't skip mid — it might be the answer
    }
    return lo; // first index where arr[i] >= target
  }

Key difference: lo <= hi vs lo < hi. Template 2 finds boundaries.` },
    { title: 'Binary Search on Answer', icon: '💡', content: `The most powerful variation: binary search on the ANSWER, not the array.

Pattern: "Find the minimum/maximum value that satisfies condition C"

  let lo = minPossible, hi = maxPossible;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (isValid(mid)) hi = mid;     // mid works, try smaller
    else lo = mid + 1;              // mid doesn't work, try bigger
  }
  return lo;

Examples:
• Koko eating bananas: minimum speed to finish in H hours
• Split array largest sum: minimize the maximum sum
• Capacity to ship packages within D days` },
    { title: 'Rotated Array Search', icon: '🔄', content: `Search in a rotated sorted array — the interview favorite.

  [4, 5, 6, 7, 0, 1, 2]  target = 0
  
Key insight: One half is ALWAYS sorted.
  If arr[lo] <= arr[mid] → left half is sorted
  If arr[mid] <= arr[hi] → right half is sorted

Check if target is in the sorted half:
  If yes → search that half
  If no → search the other half` }
  ],
  patternTriggers: [
    { trigger: '"Sorted array" + find element', pattern: 'Standard binary search' },
    { trigger: '"First/last occurrence"', pattern: 'Boundary binary search (lower/upper bound)' },
    { trigger: '"Minimum speed/capacity that satisfies"', pattern: 'Binary search on answer' },
    { trigger: '"Rotated sorted array"', pattern: 'Modified BS — check which half is sorted' },
    { trigger: '"Peak element" or "mountain array"', pattern: 'Binary search on condition' },
  ],
  complexityTable: [
    { operation: 'Standard binary search', time: 'O(log N)', space: 'O(1)' },
    { operation: 'Binary search on answer', time: 'O(N log M)', space: 'O(1)' },
    { operation: 'Search in 2D matrix', time: 'O(log(M×N))', space: 'O(1)' },
  ],
  codeExample: {
    title: 'Koko Eating Bananas — Binary Search on Answer',
    code: `function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const hours = piles.reduce((sum, p) => sum + Math.ceil(p / mid), 0);
    if (hours <= h) hi = mid;    // can finish, try slower
    else lo = mid + 1;          // too slow, eat faster
  }
  return lo;
}`,
    walkthrough: `Input: piles=[3,6,7,11], h=8

Binary search on speed: lo=1, hi=11
mid=6: hours = ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6) = 1+1+2+2 = 6 ≤ 8 → hi=6
mid=3: hours = 1+2+3+4 = 10 > 8 → lo=4
mid=5: hours = 1+2+2+3 = 8 ≤ 8 → hi=5
mid=4: hours = 1+2+2+3 = 8 ≤ 8 → hi=4
lo==hi==4 → Answer: 4 ✅`
  },
  keyTakeaways: [
    'Binary search = O(log N). Always use lo + (hi-lo)/2 to avoid overflow.',
    'Two templates: exact match (lo<=hi) vs boundary (lo<hi)',
    'Binary search on ANSWER is extremely powerful for optimization problems',
    'Rotated array: one half is always sorted — use that to decide',
    'Ask: "Does this problem have a monotonic yes/no boundary?" → Binary search'
  ]
};
