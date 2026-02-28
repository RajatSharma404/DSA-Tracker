import { StudyGuide } from './types';

export const twoPointersGuide: StudyGuide = {
  topicName: 'Two Pointers',
  emoji: '👆👆',
  tagline: 'Two indices, one array — eliminate the inner loop',
  prerequisite: 'Arrays, Hashing',
  sections: [
    { title: 'The Core Idea', icon: '🧠', content: `Two Pointers uses two index variables that move through the data structure based on conditions. This replaces a nested O(N²) loop with a single O(N) pass.

Three variations:
1. OPPOSITE ENDS — left=0, right=N-1, move toward center
   → Sorted array pair sum, container with most water
   
2. SAME DIRECTION — slow & fast pointers
   → Remove duplicates, linked list cycle detection
   
3. TWO ARRAYS — one pointer per array
   → Merge sorted arrays, intersection of arrays

  [1, 2, 3, 4, 5, 6, 7]
   ↑                 ↑
  left              right
  → moves right    ← moves left` },
    { title: 'Opposite-End Pattern', icon: '🔄', content: `Start from both ends, shrink inward based on comparison.

Classic: Two Sum on SORTED array
  left=0, right=N-1
  sum = arr[left] + arr[right]
  if sum == target: found!
  if sum < target: left++   (need bigger number)
  if sum > target: right--  (need smaller number)

Why it works: Sorted order guarantees that moving left++ increases sum and right-- decreases sum. We never miss a valid pair.

Works for: Pair sum, 3Sum (fix one + two pointers), trapping rain water, container with most water.` },
    { title: 'Same-Direction (Fast/Slow)', icon: '🏃', content: `Two pointers moving in the same direction at different speeds.

Classic: Remove Duplicates from Sorted Array
  slow = 0 (write pointer)
  fast = 1 (read pointer)

  [1, 1, 2, 2, 3]
   s  f              → arr[f]=1, same as arr[s], skip
   s     f           → arr[f]=2, different! s++, arr[s]=arr[f]
      s     f        → arr[f]=2, same as arr[s], skip  
      s        f     → arr[f]=3, different! s++, arr[s]=arr[f]
  Result: [1, 2, 3, _, _], length = s+1 = 3

Also used for: Move zeros, remove element, partition array.` },
    { title: 'When NOT to Use Two Pointers', icon: '⚠️', content: `Two pointers require ORDER or STRUCTURE to work:
• Array must be SORTED for opposite-end pair finding
• For unsorted arrays, use a HashMap instead
• For non-linear data (trees, graphs), different techniques apply

Common mistake: Trying to use two pointers on unsorted data for pair-sum. Use a HashMap for unsorted two-sum.` }
  ],
  patternTriggers: [
    { trigger: 'Sorted array + find pair/triplet', pattern: 'Opposite-end two pointers' },
    { trigger: '"Remove duplicates in-place"', pattern: 'Slow/fast same-direction pointers' },
    { trigger: '"Move zeros" or "partition"', pattern: 'Same-direction read/write pointers' },
    { trigger: '"Container with most water"', pattern: 'Opposite-end with greedy shrink' },
    { trigger: '"3Sum" or "closest sum"', pattern: 'Fix one element + two pointers on rest' },
  ],
  complexityTable: [
    { operation: 'Opposite-end traversal', time: 'O(N)', space: 'O(1)' },
    { operation: 'Same-direction traversal', time: 'O(N)', space: 'O(1)' },
    { operation: '3Sum (sort + two pointers)', time: 'O(N²)', space: 'O(1)' },
  ],
  codeExample: {
    title: '3Sum — Find All Triplets That Sum to Zero',
    code: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // skip dupes
    
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++; right--;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return result;
}`,
    walkthrough: `Input: [-1, 0, 1, 2, -1, -4] → sorted: [-4, -1, -1, 0, 1, 2]

i=0, nums[i]=-4: left=1(-1), right=5(2) → -4-1+2=-3<0 → left++
  → Eventually no valid pair with -4

i=1, nums[i]=-1: left=2(-1), right=5(2) → -1-1+2=0 ✅ → [-1,-1,2]
  → left=3(0), right=4(1) → -1+0+1=0 ✅ → [-1,0,1]

i=2, nums[i]=-1: Skip! Same as nums[1] (duplicate)

Result: [[-1,-1,2], [-1,0,1]]`
  },
  keyTakeaways: [
    'Two pointers only works on SORTED or STRUCTURED data',
    'Opposite-end: shrink toward center based on sum comparison',
    'Same-direction: slow=write pointer, fast=read pointer',
    '3Sum = fix one + apply two pointers → O(N²)',
    'Always handle duplicate skipping to avoid redundant results'
  ]
};
