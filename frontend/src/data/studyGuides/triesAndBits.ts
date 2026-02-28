import { StudyGuide } from './types';

export const triesGuide: StudyGuide = {
  topicName: 'Tries',
  emoji: '🌳',
  tagline: 'Prefix trees — blazing fast string search and autocomplete',
  prerequisite: 'Trees, Hashing',
  sections: [
    { title: 'What Is a Trie?', icon: '🧠', content: `A Trie (prefix tree) stores strings character-by-character in a tree. Each path from root to a node represents a prefix.

  Words: "cat", "car", "card", "dog"

       root
      /    \\
     c      d
     |      |
     a      o
    / \\     |
   t   r    g*
   *   |
       d*
  (* = end of word)

Why Trie over HashMap?
• Prefix search in O(prefix length) — not possible with HashMap
• Autocomplete: find all words starting with "ca" → traverse to 'c'->'a' node
• Space-efficient for many words sharing prefixes` },
    { title: 'Implementation', icon: '⚙️', content: `class TrieNode {
  constructor() {
    this.children = {};  // char → TrieNode
    this.isEnd = false;
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  search(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isEnd;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return true;
  }
}` },
    { title: 'When to Use Tries', icon: '💡', content: `Use a Trie when:
• Need prefix-based operations (startsWith, autocomplete)
• Need to search among many strings efficiently
• Word search in a grid (DFS + Trie for pruning)
• Longest common prefix of a set of strings

Don't use when:
• Just need exact match → HashMap is simpler
• Small number of strings → sort + binary search works` }
  ],
  patternTriggers: [
    { trigger: '"Implement autocomplete" or "startsWith"', pattern: 'Trie with prefix traversal' },
    { trigger: '"Word search II" (find many words in grid)', pattern: 'Grid DFS + Trie for pruning' },
    { trigger: '"Longest common prefix"', pattern: 'Insert all into Trie, walk until branch' },
    { trigger: '"Design search with wildcards"', pattern: 'Trie + DFS for "." matching' },
  ],
  complexityTable: [
    { operation: 'Insert word', time: 'O(L)', space: 'O(L)' },
    { operation: 'Search word', time: 'O(L)', space: 'O(1)' },
    { operation: 'StartsWith prefix', time: 'O(P)', space: 'O(1)' },
  ],
  codeExample: {
    title: 'Implement Trie',
    code: `class Trie {
  constructor() { this.root = {}; }
  
  insert(word) {
    let node = this.root;
    for (const c of word) {
      if (!node[c]) node[c] = {};
      node = node[c];
    }
    node.isEnd = true;
  }
  
  search(word) {
    const node = this._find(word);
    return node !== null && node.isEnd === true;
  }
  
  startsWith(prefix) {
    return this._find(prefix) !== null;
  }
  
  _find(str) {
    let node = this.root;
    for (const c of str) {
      if (!node[c]) return null;
      node = node[c];
    }
    return node;
  }
}`,
    walkthrough: `trie.insert("apple")
  root → a → p → p → l → e (isEnd=true)

trie.search("apple")  → find 'a','p','p','l','e', isEnd=true → TRUE ✅
trie.search("app")    → find 'a','p','p', isEnd=undefined → FALSE
trie.startsWith("app") → find 'a','p','p', node exists → TRUE ✅`
  },
  keyTakeaways: [
    'Trie = prefix tree. Each edge is one character.',
    'O(L) for insert/search where L = word length',
    'Use when you need PREFIX operations — not for exact match only',
    'Simplified implementation: use plain objects as nodes',
    'Word search II = Trie + grid DFS — classic hard problem'
  ]
};

export const bitManipulationGuide: StudyGuide = {
  topicName: 'Bit Manipulation',
  emoji: '🔢',
  tagline: 'Think in binary — solve problems in O(1) space with bit math',
  prerequisite: 'Arrays',
  sections: [
    { title: 'Binary Basics', icon: '🧠', content: `Every number is stored as bits (0s and 1s).

  Decimal 13 = Binary 1101
  = 1×8 + 1×4 + 0×2 + 1×1

Operators:
  AND (&):   1010 & 1100 = 1000  (both 1 → 1)
  OR (|):    1010 | 1100 = 1110  (either 1 → 1)
  XOR (^):   1010 ^ 1100 = 0110  (different → 1)
  NOT (~):   ~1010 = 0101
  Left shift (<<):  1 << 3 = 1000 = 8  (multiply by 2³)
  Right shift (>>): 8 >> 2 = 10 = 2    (divide by 2²)` },
    { title: 'Essential Bit Tricks', icon: '🔑', content: `1. Check if Nth bit is set:
   (num >> n) & 1

2. Set Nth bit:
   num | (1 << n)

3. Clear Nth bit:
   num & ~(1 << n)

4. Check if power of 2:
   n > 0 && (n & (n-1)) === 0
   Why: powers of 2 have exactly one 1 bit. n-1 flips all bits below.

5. Count set bits (Hamming weight):
   while (n) { count += n & 1; n >>= 1; }

6. XOR magic:
   a ^ a = 0  (number XOR itself = 0)
   a ^ 0 = a  (number XOR 0 = itself)
   → XOR all elements: duplicates cancel, single remains!` },
    { title: 'Classic: Single Number', icon: '💡', content: `Every element appears twice except one. Find it in O(1) space.

  function singleNumber(nums) {
    let result = 0;
    for (const n of nums) result ^= n;
    return result;
  }

  [2, 1, 2, 3, 1] → 2^1^2^3^1 = (2^2)^(1^1)^3 = 0^0^3 = 3 ✅

This works because XOR is commutative and associative, and a^a=0.` }
  ],
  patternTriggers: [
    { trigger: '"Single number" or "find the unique"', pattern: 'XOR all elements' },
    { trigger: '"Power of 2"', pattern: 'n & (n-1) === 0' },
    { trigger: '"Count bits" or "Hamming weight"', pattern: 'Brian Kernighan: n &= (n-1) loop' },
    { trigger: '"Subsets using bitmask"', pattern: 'Iterate 0 to 2^N, check each bit' },
  ],
  complexityTable: [
    { operation: 'Bitwise AND/OR/XOR', time: 'O(1)', space: 'O(1)' },
    { operation: 'Count bits', time: 'O(log N)', space: 'O(1)' },
    { operation: 'Bitmask subsets', time: 'O(2^N)', space: 'O(1)' },
  ],
  codeExample: {
    title: 'Single Number',
    code: `function singleNumber(nums) {
  return nums.reduce((xor, n) => xor ^ n, 0);
}`,
    walkthrough: `Input: [4, 1, 2, 1, 2]

  0 ^ 4 = 4
  4 ^ 1 = 5
  5 ^ 2 = 7
  7 ^ 1 = 6  (1^1 cancels)
  6 ^ 2 = 4  (2^2 cancels)
  
  Result: 4 ✅ — the only number without a pair`
  },
  keyTakeaways: [
    'XOR: a^a=0, a^0=a — use to find unique elements',
    'n & (n-1) removes the lowest set bit',
    'Bit shifts: << multiply by 2, >> divide by 2',
    'Bitmask can represent subsets: bit i = include element i',
    'Bit tricks give O(1) space solutions'
  ]
};
