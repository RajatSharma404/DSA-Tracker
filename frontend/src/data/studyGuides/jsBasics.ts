import { StudyGuide } from './types';

export const jsBasicsGuide: StudyGuide = {
  topicName: 'JavaScript Basics for DSA',
  emoji: '⚡',
  tagline: 'Master the JS fundamentals that power every algorithm',
  prerequisite: 'Basic programming knowledge',
  sections: [
    {
      title: 'Why JS for DSA?',
      icon: '🎯',
      content: `JavaScript is one of the most popular languages for coding interviews at top companies. Its dynamic typing, built-in data structures (Map, Set, Array), and concise syntax make it excellent for expressing algorithms quickly.

Key advantages:
• Arrays with built-in sort, filter, map, reduce
• Map and Set with O(1) lookup
• Destructuring and spread operators for clean code
• No need for explicit type declarations during interviews`
    },
    {
      title: 'Essential Data Structures in JS',
      icon: '🧱',
      content: `▸ Array — ordered, indexed, dynamic sizing
  const arr = [1, 2, 3];
  arr.push(4);      // O(1) — add to end
  arr.pop();        // O(1) — remove from end
  arr.unshift(0);   // O(N) — add to front (shifts everything!)
  arr.shift();      // O(N) — remove from front

▸ Map — key-value pairs with O(1) access
  const map = new Map();
  map.set('key', 'value');
  map.get('key');   // O(1)
  map.has('key');   // O(1)
  map.delete('key');

▸ Set — unique values with O(1) lookup
  const set = new Set([1, 2, 3]);
  set.add(4);      // O(1)
  set.has(3);      // O(1)
  set.delete(2);

▸ Object — similar to Map but keys are always strings
  Use Map when keys can be any type. Use Object for simple string keys.`
    },
    {
      title: 'Critical Gotchas for Interviews',
      icon: '⚠️',
      content: `1. Sorting: Array.sort() sorts LEXICOGRAPHICALLY by default!
   [10, 2, 1].sort()  → [1, 10, 2] ❌
   [10, 2, 1].sort((a, b) => a - b)  → [1, 2, 10] ✅

2. Equality: === vs ==
   Always use === (strict equality) in interviews.

3. Integer overflow: JS uses 64-bit floats. For very large numbers, use BigInt.
   Number.MAX_SAFE_INTEGER = 2^53 - 1

4. Pass by reference: Arrays and objects are passed by reference.
   const copy = [...arr];        // Shallow copy
   const copy = arr.slice();     // Also shallow copy
   const deep = JSON.parse(JSON.stringify(obj)); // Deep copy

5. String immutability: Strings are immutable in JS.
   s[0] = 'X';  // Does nothing! Use s.split('').join('') to modify.`
    },
    {
      title: 'Useful Patterns & Idioms',
      icon: '💡',
      content: `▸ Swapping values:
  [a, b] = [b, a];

▸ Creating 2D arrays:
  const grid = Array.from({length: m}, () => new Array(n).fill(0));

▸ Frequency counter:
  const freq = new Map();
  for (const ch of str) freq.set(ch, (freq.get(ch) || 0) + 1);

▸ Stack (use array):
  const stack = []; stack.push(x); stack.pop();

▸ Queue (careful — shift is O(N)):
  For performance-critical queues, implement with linked list or use index pointer.

▸ Math shortcuts:
  Math.floor(a / 2)  or  a >> 1  (bitwise right shift)
  Math.ceil(a / b)   →  Math.floor((a + b - 1) / b)
  Math.max(...arr)   →  max of array`
    }
  ],
  patternTriggers: [
    { trigger: 'Need to count occurrences', pattern: 'Use a Map as a frequency counter' },
    { trigger: 'Need unique elements', pattern: 'Use a Set' },
    { trigger: 'Need fast key-value lookup', pattern: 'Use a Map (not Object for non-string keys)' },
    { trigger: 'Need to sort numbers', pattern: 'Always pass a comparator: (a, b) => a - b' },
  ],
  complexityTable: [
    { operation: 'Array.push / pop', time: 'O(1)', space: 'O(1)' },
    { operation: 'Array.shift / unshift', time: 'O(N)', space: 'O(1)' },
    { operation: 'Array.sort', time: 'O(N log N)', space: 'O(N)' },
    { operation: 'Map.get / set / has', time: 'O(1)', space: 'O(1)' },
    { operation: 'Set.add / has / delete', time: 'O(1)', space: 'O(1)' },
    { operation: 'Array.includes', time: 'O(N)', space: 'O(1)' },
  ],
  codeExample: {
    title: 'Two Sum using HashMap',
    code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    walkthrough: `Input: nums = [2, 7, 11, 15], target = 9

Step 1: i=0, nums[0]=2, complement=7, map={} → 7 not in map → store {2:0}
Step 2: i=1, nums[1]=7, complement=2, map={2:0} → 2 IS in map! → return [0, 1] ✅

Key insight: Instead of checking every pair O(N²), we store seen numbers in a Map for O(1) lookup, making the entire solution O(N).`
  },
  keyTakeaways: [
    'Always use (a, b) => a - b when sorting numbers',
    'Map > Object for non-string keys and dynamic key-value pairs',
    'Set gives you O(1) uniqueness checking',
    'Arrays are your stack. For queues, be mindful of O(N) shift.',
    'Strings are immutable — convert to array to modify'
  ]
};
