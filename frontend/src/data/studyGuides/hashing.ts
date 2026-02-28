import { StudyGuide } from './types';

export const hashingGuide: StudyGuide = {
  topicName: 'Hashing',
  emoji: '#️⃣',
  tagline: 'The art of O(1) lookup — turns brute force into elegant solutions',
  prerequisite: 'Arrays',
  sections: [
    { title: 'What Is Hashing?', icon: '🧠', content: `Hashing is a technique that maps data to a fixed-size value (hash) for near-instant lookup. Think of it as a magical dictionary — given any key, you get the value in O(1).

How it works internally:
  Key "apple" → hash("apple") → 42 → store at index 42

  Bucket 0:  
  Bucket 1:  
  ...
  Bucket 42: ("apple", 5) → ("grape", 3)  ← collision chain
  ...

Collisions happen when two keys hash to the same index. Handled by chaining (linked lists) or open addressing.` },
    { title: 'HashMap vs HashSet', icon: '🔧', content: `HashMap (Map in JS) — stores KEY → VALUE pairs
  const map = new Map();
  map.set("name", "Alice");  // Store
  map.get("name");           // "Alice" — O(1)
  map.has("name");           // true — O(1)

HashSet (Set in JS) — stores only KEYS (unique values)
  const set = new Set();
  set.add(5);   // Store
  set.has(5);   // true — O(1)
  set.size;     // 1

When to use which:
• Need to COUNT things → HashMap (frequency counter)
• Need UNIQUENESS check → HashSet
• Need to find COMPLEMENT/PAIR → HashMap (store value → index)` },
    { title: 'The 4 Hashing Patterns', icon: '🔑', content: `1. FREQUENCY COUNTER — Count occurrences of each element
   Problems: anagram check, top K frequent, majority element
   const freq = new Map();
   for (const x of arr) freq.set(x, (freq.get(x) || 0) + 1);

2. TWO-SUM PATTERN — Store complement for O(1) lookup
   Problems: two sum, pair with given sum, subarray sum = K

3. SEEN BEFORE — Track what you've visited
   Problems: contains duplicate, first repeating, cycle detection

4. GROUP BY — Group elements sharing a property
   Problems: group anagrams, group by frequency` },
    { title: 'Subarray Sum = K (Advanced)', icon: '🧩', content: `One of the most important hashing patterns. Combines prefix sum + hashmap.

Problem: Count subarrays with sum = K

Insight: If prefix[j] - prefix[i] = K, then subarray i..j has sum K
So we store prefix sums in a map and check if (currentPrefix - K) exists.

  function subarraySum(nums, k) {
    const map = new Map([[0, 1]]); // prefix 0 seen once
    let prefix = 0, count = 0;
    for (const num of nums) {
      prefix += num;
      count += map.get(prefix - k) || 0;
      map.set(prefix, (map.get(prefix) || 0) + 1);
    }
    return count;
  }

This turns an O(N²) brute force into O(N). Appears in MANY interview problems.` }
  ],
  patternTriggers: [
    { trigger: '"Find duplicates" or "contains duplicate"', pattern: 'HashSet — add and check in O(1)' },
    { trigger: '"Two sum" or "find pair with sum K"', pattern: 'HashMap — store complement' },
    { trigger: '"Count frequency" or "most common"', pattern: 'HashMap frequency counter' },
    { trigger: '"Anagram" or "permutation check"', pattern: 'Frequency counter on both strings' },
    { trigger: '"Subarray with sum K"', pattern: 'Prefix sum + HashMap' },
  ],
  complexityTable: [
    { operation: 'Insert (Map.set/Set.add)', time: 'O(1) avg', space: 'O(1)' },
    { operation: 'Lookup (Map.get/Set.has)', time: 'O(1) avg', space: 'O(1)' },
    { operation: 'Delete', time: 'O(1) avg', space: 'O(1)' },
    { operation: 'Iterate all entries', time: 'O(N)', space: 'O(1)' },
    { operation: 'Worst case (many collisions)', time: 'O(N)', space: 'O(N)' },
  ],
  codeExample: {
    title: 'Group Anagrams',
    code: `function groupAnagrams(strs) {
  const map = new Map();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return Array.from(map.values());
}`,
    walkthrough: `Input: ["eat", "tea", "tan", "ate", "nat", "bat"]

"eat" → sorted "aet" → map: {"aet": ["eat"]}
"tea" → sorted "aet" → map: {"aet": ["eat","tea"]}
"tan" → sorted "ant" → map: {"aet": [...], "ant": ["tan"]}
"ate" → sorted "aet" → map: {"aet": ["eat","tea","ate"], ...}
"nat" → sorted "ant" → map: {..., "ant": ["tan","nat"]}
"bat" → sorted "abt" → map: {..., "abt": ["bat"]}

Result: [["eat","tea","ate"], ["tan","nat"], ["bat"]]
Key: Anagrams share the same sorted string — use it as map key.`
  },
  keyTakeaways: [
    'HashMap gives O(1) lookup — use it to avoid nested loops',
    'Frequency counter pattern solves 30%+ of hashing problems',
    'Prefix sum + HashMap = O(N) subarray sum problems',
    'Sorted string as key = anagram grouping trick',
    'Always consider: "Can I trade space for time with a hash?"'
  ]
};
