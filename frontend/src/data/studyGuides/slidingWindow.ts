import { StudyGuide } from './types';

export const slidingWindowGuide: StudyGuide = {
  topicName: 'Sliding Window',
  emoji: '🪟',
  tagline: 'Maintain a window, slide it across — O(N) magic for subarray problems',
  prerequisite: 'Arrays, Two Pointers',
  sections: [
    { title: 'The Core Idea', icon: '🧠', content: `Sliding Window maintains a "window" (subarray/substring) that slides across the input. Instead of recalculating from scratch, you ADD the new element and REMOVE the old one.

Fixed window:
  [1, 3, 2, 6, -1, 4, 1, 8]   K=3
  [1, 3, 2]                    sum=6
     [3, 2, 6]                 sum=11 (remove 1, add 6)
        [2, 6, -1]             sum=7  (remove 3, add -1)

Variable window:
  Start with left=0, expand right, shrink left when condition breaks.` },
    { title: 'Fixed-Size Window', icon: '📏', content: `When the problem says "subarray of size K":

Template:
  function maxSumOfSizeK(arr, k) {
    let windowSum = 0;
    // Build first window
    for (let i = 0; i < k; i++) windowSum += arr[i];
    let maxSum = windowSum;
    // Slide: add right, remove left
    for (let i = k; i < arr.length; i++) {
      windowSum += arr[i] - arr[i - k];
      maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
  }

Time: O(N) instead of O(N×K) brute force.` },
    { title: 'Variable-Size Window', icon: '📐', content: `When the problem says "smallest/longest subarray with condition X":

Template:
  let left = 0;
  for (let right = 0; right < arr.length; right++) {
    // EXPAND: add arr[right] to window state
    
    while (/* window is invalid */) {
      // SHRINK: remove arr[left] from window state
      left++;
    }
    // UPDATE answer (window is valid here)
  }

The key insight: left only moves forward (never backward), so total work is O(N), not O(N²).

Examples:
• Minimum size subarray sum ≥ target
• Longest substring without repeating chars
• Longest substring with at most K distinct chars` },
    { title: 'Sliding Window + HashMap', icon: '🔗', content: `Many sliding window problems use a HashMap to track window state:

Longest Substring Without Repeating Characters:
  const map = new Map(); // char → last index
  let left = 0, maxLen = 0;
  
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right]) && map.get(s[right]) >= left) {
      left = map.get(s[right]) + 1; // jump left past duplicate
    }
    map.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

This pattern: window + hashmap for tracking, appears VERY frequently.` }
  ],
  patternTriggers: [
    { trigger: '"Subarray of size K" or "window of size K"', pattern: 'Fixed sliding window' },
    { trigger: '"Smallest subarray with sum ≥"', pattern: 'Variable window — shrink when sum enough' },
    { trigger: '"Longest substring without repeating"', pattern: 'Variable window + HashMap' },
    { trigger: '"At most K distinct characters"', pattern: 'Variable window + frequency map' },
    { trigger: '"Maximum of all subarrays of size K"', pattern: 'Sliding window + deque (monotonic)' },
  ],
  complexityTable: [
    { operation: 'Fixed window pass', time: 'O(N)', space: 'O(1)' },
    { operation: 'Variable window pass', time: 'O(N)', space: 'O(1)' },
    { operation: 'Window + HashMap', time: 'O(N)', space: 'O(K)' },
  ],
  codeExample: {
    title: 'Minimum Window Substring',
    code: `function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c)||0) + 1);
  
  let have = 0, required = need.size;
  let left = 0, minLen = Infinity, result = "";
  const window = new Map();
  
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    window.set(c, (window.get(c)||0) + 1);
    if (need.has(c) && window.get(c) === need.get(c)) have++;
    
    while (have === required) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        result = s.substring(left, right + 1);
      }
      const d = s[left]; left++;
      window.set(d, window.get(d) - 1);
      if (need.has(d) && window.get(d) < need.get(d)) have--;
    }
  }
  return result;
}`,
    walkthrough: `Input: s="ADOBECODEBANC", t="ABC"

We need: A=1, B=1, C=1 (3 unique chars)
Expand right until all chars found → "ADOBEC" (have=3)
Shrink left → "DOBEC" (lost A, have=2) → expand again
Keep going → eventually find "BANC" = length 4 (minimum!) ✅

Pattern: Expand right until valid, then shrink left to minimize.`
  },
  keyTakeaways: [
    'Fixed window: build first window, then slide (add right, remove left)',
    'Variable window: expand right always, shrink left when invalid',
    'Left pointer only moves forward → total O(N) work',
    'HashMap tracks window state for string/character problems',
    'Always ask: "Can I express this as a window sliding across?"'
  ]
};
