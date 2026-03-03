import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const problemsData = [
  // JavaScript Basics for DSA
  {
    topicName: 'JavaScript Basics for DSA', problems: [
      { title: 'Array.prototype.map() Implementation', link: 'https://leetcode.com/problems/array-prototype-map/', difficulty: 'EASY', orderIndex: 1 },
      { title: 'Array.prototype.filter() Implementation', link: 'https://leetcode.com/problems/array-prototype-filter/', difficulty: 'EASY', orderIndex: 2 },
      { title: 'Array.prototype.reduce() Implementation', link: 'https://leetcode.com/problems/array-prototype-reduce/', difficulty: 'EASY', orderIndex: 3 },
      { title: 'Memoize', link: 'https://leetcode.com/problems/memoize/', difficulty: 'MEDIUM', orderIndex: 4 },
      { title: 'Debounce', link: 'https://leetcode.com/problems/debounce/', difficulty: 'MEDIUM', orderIndex: 5 },
    ]
  },
  // Hashing
  {
    topicName: 'Hashing', problems: [
      { title: 'Two Sum', link: 'https://leetcode.com/problems/two-sum/', difficulty: 'EASY', orderIndex: 1 },
      { title: 'Isomorphic Strings', link: 'https://leetcode.com/problems/isomorphic-strings/', difficulty: 'EASY', orderIndex: 2 },
      { title: 'Word Pattern', link: 'https://leetcode.com/problems/word-pattern/', difficulty: 'EASY', orderIndex: 3 },
      { title: 'Happy Number', link: 'https://leetcode.com/problems/happy-number/', difficulty: 'EASY', orderIndex: 4 },
      { title: 'Contains Duplicate II', link: 'https://leetcode.com/problems/contains-duplicate-ii/', difficulty: 'EASY', orderIndex: 5 },
    ]
  },
  // Arrays
  {
    topicName: 'Arrays', problems: [
      { title: 'Contains Duplicate', link: 'https://leetcode.com/problems/contains-duplicate/', difficulty: 'EASY', orderIndex: 1 },
      { title: 'Valid Anagram', link: 'https://leetcode.com/problems/valid-anagram/', difficulty: 'EASY', orderIndex: 2 },
      { title: 'Group Anagrams', link: 'https://leetcode.com/problems/group-anagrams/', difficulty: 'MEDIUM', orderIndex: 3 },
      { title: 'Top K Frequent Elements', link: 'https://leetcode.com/problems/top-k-frequent-elements/', difficulty: 'MEDIUM', orderIndex: 4 },
      { title: 'Product of Array Except Self', link: 'https://leetcode.com/problems/product-of-array-except-self/', difficulty: 'MEDIUM', orderIndex: 5 },
      { title: 'Valid Sudoku', link: 'https://leetcode.com/problems/valid-sudoku/', difficulty: 'MEDIUM', orderIndex: 6 },
      { title: 'Longest Consecutive Sequence', link: 'https://leetcode.com/problems/longest-consecutive-sequence/', difficulty: 'MEDIUM', orderIndex: 7 },
    ]
  },
  // Two Pointers
  {
    topicName: 'Two Pointers', problems: [
      { title: 'Valid Palindrome', link: 'https://leetcode.com/problems/valid-palindrome/', difficulty: 'EASY', orderIndex: 1 },
      { title: 'Two Sum II - Input Array Is Sorted', link: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', difficulty: 'MEDIUM', orderIndex: 2 },
      { title: '3Sum', link: 'https://leetcode.com/problems/3sum/', difficulty: 'MEDIUM', orderIndex: 3 },
      { title: 'Container With Most Water', link: 'https://leetcode.com/problems/container-with-most-water/', difficulty: 'MEDIUM', orderIndex: 4 },
      { title: 'Trapping Rain Water', link: 'https://leetcode.com/problems/trapping-rain-water/', difficulty: 'HARD', orderIndex: 5 },
    ]
  },
  // Sliding Window
  {
    topicName: 'Sliding Window', problems: [
      { title: 'Best Time to Buy and Sell Stock', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', difficulty: 'EASY', orderIndex: 1 },
      { title: 'Longest Substring Without Repeating Characters', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', difficulty: 'MEDIUM', orderIndex: 2 },
      { title: 'Longest Repeating Character Replacement', link: 'https://leetcode.com/problems/longest-repeating-character-replacement/', difficulty: 'MEDIUM', orderIndex: 3 },
      { title: 'Permutation in String', link: 'https://leetcode.com/problems/permutation-in-string/', difficulty: 'MEDIUM', orderIndex: 4 },
      { title: 'Minimum Window Substring', link: 'https://leetcode.com/problems/minimum-window-substring/', difficulty: 'HARD', orderIndex: 5 },
    ]
  },
  // Stack
  {
    topicName: 'Stack', problems: [
      { title: 'Valid Parentheses', link: 'https://leetcode.com/problems/valid-parentheses/', difficulty: 'EASY', orderIndex: 1 },
      { title: 'Min Stack', link: 'https://leetcode.com/problems/min-stack/', difficulty: 'MEDIUM', orderIndex: 2 },
      { title: 'Evaluate Reverse Polish Notation', link: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', difficulty: 'MEDIUM', orderIndex: 3 },
      { title: 'Generate Parentheses', link: 'https://leetcode.com/problems/generate-parentheses/', difficulty: 'MEDIUM', orderIndex: 4 },
      { title: 'Daily Temperatures', link: 'https://leetcode.com/problems/daily-temperatures/', difficulty: 'MEDIUM', orderIndex: 5 },
      { title: 'Car Fleet', link: 'https://leetcode.com/problems/car-fleet/', difficulty: 'MEDIUM', orderIndex: 6 },
      { title: 'Largest Rectangle in Histogram', link: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', difficulty: 'HARD', orderIndex: 7 },
    ]
  },
  // Binary Search
  {
    topicName: 'Binary Search', problems: [
      { title: 'Binary Search', link: 'https://leetcode.com/problems/binary-search/', difficulty: 'EASY', orderIndex: 1 },
      { title: 'Search a 2D Matrix', link: 'https://leetcode.com/problems/search-a-2d-matrix/', difficulty: 'MEDIUM', orderIndex: 2 },
      { title: 'Koko Eating Bananas', link: 'https://leetcode.com/problems/koko-eating-bananas/', difficulty: 'MEDIUM', orderIndex: 3 },
      { title: 'Find Minimum in Rotated Sorted Array', link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', difficulty: 'MEDIUM', orderIndex: 4 },
      { title: 'Search in Rotated Sorted Array', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', difficulty: 'MEDIUM', orderIndex: 5 },
      { title: 'Time Based Key-Value Store', link: 'https://leetcode.com/problems/time-based-key-value-store/', difficulty: 'MEDIUM', orderIndex: 6 },
    ]
  },
  // Linked List
  {
    topicName: 'Linked List', problems: [
      { title: 'Reverse Linked List', link: 'https://leetcode.com/problems/reverse-linked-list/', difficulty: 'EASY', orderIndex: 1 },
      { title: 'Merge Two Sorted Lists', link: 'https://leetcode.com/problems/merge-two-sorted-lists/', difficulty: 'EASY', orderIndex: 2 },
      { title: 'Reorder List', link: 'https://leetcode.com/problems/reorder-list/', difficulty: 'MEDIUM', orderIndex: 3 },
      { title: 'Remove Nth Node From End of List', link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', difficulty: 'MEDIUM', orderIndex: 4 },
      { title: 'Copy List with Random Pointer', link: 'https://leetcode.com/problems/copy-list-with-random-pointer/', difficulty: 'MEDIUM', orderIndex: 5 },
      { title: 'Add Two Numbers', link: 'https://leetcode.com/problems/add-two-numbers/', difficulty: 'MEDIUM', orderIndex: 6 },
      { title: 'Linked List Cycle', link: 'https://leetcode.com/problems/linked-list-cycle/', difficulty: 'EASY', orderIndex: 7 },
      { title: 'Find the Duplicate Number', link: 'https://leetcode.com/problems/find-the-duplicate-number/', difficulty: 'MEDIUM', orderIndex: 8 },
      { title: 'LRU Cache', link: 'https://leetcode.com/problems/lru-cache/', difficulty: 'MEDIUM', orderIndex: 9 },
      { title: 'Merge K Sorted Lists', link: 'https://leetcode.com/problems/merge-k-sorted-lists/', difficulty: 'HARD', orderIndex: 10 },
    ]
  },
  // Trees
  {
    topicName: 'Trees', problems: [
      { title: 'Invert Binary Tree', link: 'https://leetcode.com/problems/invert-binary-tree/', difficulty: 'EASY', orderIndex: 1 },
      { title: 'Maximum Depth of Binary Tree', link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', difficulty: 'EASY', orderIndex: 2 },
      { title: 'Diameter of Binary Tree', link: 'https://leetcode.com/problems/diameter-of-binary-tree/', difficulty: 'EASY', orderIndex: 3 },
      { title: 'Balanced Binary Tree', link: 'https://leetcode.com/problems/balanced-binary-tree/', difficulty: 'EASY', orderIndex: 4 },
      { title: 'Same Tree', link: 'https://leetcode.com/problems/same-tree/', difficulty: 'EASY', orderIndex: 5 },
      { title: 'Subtree of Another Tree', link: 'https://leetcode.com/problems/subtree-of-another-tree/', difficulty: 'EASY', orderIndex: 6 },
      { title: 'Lowest Common Ancestor of a Binary Search Tree', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', difficulty: 'EASY', orderIndex: 7 },
      { title: 'Binary Tree Level Order Traversal', link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', difficulty: 'MEDIUM', orderIndex: 8 },
      { title: 'Binary Tree Right Side View', link: 'https://leetcode.com/problems/binary-tree-right-side-view/', difficulty: 'MEDIUM', orderIndex: 9 },
      { title: 'Count Good Nodes in Binary Tree', link: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/', difficulty: 'MEDIUM', orderIndex: 10 },
      { title: 'Validate Binary Search Tree', link: 'https://leetcode.com/problems/validate-binary-search-tree/', difficulty: 'MEDIUM', orderIndex: 11 },
      { title: 'Kth Smallest Element in a BST', link: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', difficulty: 'MEDIUM', orderIndex: 12 },
      { title: 'Construct Binary Tree from Preorder and Inorder Traversal', link: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', difficulty: 'MEDIUM', orderIndex: 13 },
      { title: 'Binary Tree Maximum Path Sum', link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', difficulty: 'HARD', orderIndex: 14 },
      { title: 'Serialize and Deserialize Binary Tree', link: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', difficulty: 'HARD', orderIndex: 15 },
    ]
  },
  // Graphs
  {
    topicName: 'Graphs', problems: [
      { title: 'Number of Islands', link: 'https://leetcode.com/problems/number-of-islands/', difficulty: 'MEDIUM', orderIndex: 1 },
      { title: 'Clone Graph', link: 'https://leetcode.com/problems/clone-graph/', difficulty: 'MEDIUM', orderIndex: 2 },
      { title: 'Max Area of Island', link: 'https://leetcode.com/problems/max-area-of-island/', difficulty: 'MEDIUM', orderIndex: 3 },
      { title: 'Pacific Atlantic Water Flow', link: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', difficulty: 'MEDIUM', orderIndex: 4 },
      { title: 'Surrounded Regions', link: 'https://leetcode.com/problems/surrounded-regions/', difficulty: 'MEDIUM', orderIndex: 5 },
      { title: 'Rotting Oranges', link: 'https://leetcode.com/problems/rotting-oranges/', difficulty: 'MEDIUM', orderIndex: 6 },
      { title: 'Walls and Gates', link: 'https://leetcode.com/problems/walls-and-gates/', difficulty: 'MEDIUM', orderIndex: 7 },
      { title: 'Course Schedule', link: 'https://leetcode.com/problems/course-schedule/', difficulty: 'MEDIUM', orderIndex: 8 },
      { title: 'Course Schedule II', link: 'https://leetcode.com/problems/course-schedule-ii/', difficulty: 'MEDIUM', orderIndex: 9 },
      { title: 'Redundant Connection', link: 'https://leetcode.com/problems/redundant-connection/', difficulty: 'MEDIUM', orderIndex: 10 },
      { title: 'Word Ladder', link: 'https://leetcode.com/problems/word-ladder/', difficulty: 'HARD', orderIndex: 11 },
    ]
  },
  // Dynamic Programming
  {
    topicName: 'Dynamic Programming', problems: [
      { title: 'Climbing Stairs', link: 'https://leetcode.com/problems/climbing-stairs/', difficulty: 'EASY', orderIndex: 1 },
      { title: 'Min Cost Climbing Stairs', link: 'https://leetcode.com/problems/min-cost-climbing-stairs/', difficulty: 'EASY', orderIndex: 2 },
      { title: 'House Robber', link: 'https://leetcode.com/problems/house-robber/', difficulty: 'MEDIUM', orderIndex: 3 },
      { title: 'House Robber II', link: 'https://leetcode.com/problems/house-robber-ii/', difficulty: 'MEDIUM', orderIndex: 4 },
      { title: 'Longest Palindromic Substring', link: 'https://leetcode.com/problems/longest-palindromic-substring/', difficulty: 'MEDIUM', orderIndex: 5 },
      { title: 'Palindromic Substrings', link: 'https://leetcode.com/problems/palindromic-substrings/', difficulty: 'MEDIUM', orderIndex: 6 },
      { title: 'Decode Ways', link: 'https://leetcode.com/problems/decode-ways/', difficulty: 'MEDIUM', orderIndex: 7 },
      { title: 'Coin Change', link: 'https://leetcode.com/problems/coin-change/', difficulty: 'MEDIUM', orderIndex: 8 },
      { title: 'Maximum Product Subarray', link: 'https://leetcode.com/problems/maximum-product-subarray/', difficulty: 'MEDIUM', orderIndex: 9 },
      { title: 'Word Break', link: 'https://leetcode.com/problems/word-break/', difficulty: 'MEDIUM', orderIndex: 10 },
      { title: 'Longest Increasing Subsequence', link: 'https://leetcode.com/problems/longest-increasing-subsequence/', difficulty: 'MEDIUM', orderIndex: 11 },
    ]
  },
  // Backtracking
  {
    topicName: 'Backtracking', problems: [
      { title: 'Subsets', link: 'https://leetcode.com/problems/subsets/', difficulty: 'MEDIUM', orderIndex: 1 },
      { title: 'Combination Sum', link: 'https://leetcode.com/problems/combination-sum/', difficulty: 'MEDIUM', orderIndex: 2 },
      { title: 'Permutations', link: 'https://leetcode.com/problems/permutations/', difficulty: 'MEDIUM', orderIndex: 3 },
      { title: 'Subsets II', link: 'https://leetcode.com/problems/subsets-ii/', difficulty: 'MEDIUM', orderIndex: 4 },
      { title: 'Word Search', link: 'https://leetcode.com/problems/word-search/', difficulty: 'MEDIUM', orderIndex: 5 },
      { title: 'Palindrome Partitioning', link: 'https://leetcode.com/problems/palindrome-partitioning/', difficulty: 'MEDIUM', orderIndex: 6 },
      { title: 'Letter Combinations of a Phone Number', link: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', difficulty: 'MEDIUM', orderIndex: 7 },
      { title: 'N-Queens', link: 'https://leetcode.com/problems/n-queens/', difficulty: 'HARD', orderIndex: 8 },
    ]
  },
  // Heaps
  {
    topicName: 'Heaps', problems: [
      { title: 'Kth Largest Element in a Stream', link: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/', difficulty: 'EASY', orderIndex: 1 },
      { title: 'Last Stone Weight', link: 'https://leetcode.com/problems/last-stone-weight/', difficulty: 'EASY', orderIndex: 2 },
      { title: 'K Closest Points to Origin', link: 'https://leetcode.com/problems/k-closest-points-to-origin/', difficulty: 'MEDIUM', orderIndex: 3 },
      { title: 'Kth Largest Element in an Array', link: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', difficulty: 'MEDIUM', orderIndex: 4 },
      { title: 'Task Scheduler', link: 'https://leetcode.com/problems/task-scheduler/', difficulty: 'MEDIUM', orderIndex: 5 },
      { title: 'Design Twitter', link: 'https://leetcode.com/problems/design-twitter/', difficulty: 'MEDIUM', orderIndex: 6 },
      { title: 'Find Median from Data Stream', link: 'https://leetcode.com/problems/find-median-from-data-stream/', difficulty: 'HARD', orderIndex: 7 },
    ]
  },
  // Tries
  {
    topicName: 'Tries', problems: [
      { title: 'Implement Trie (Prefix Tree)', link: 'https://leetcode.com/problems/implement-trie-prefix-tree/', difficulty: 'MEDIUM', orderIndex: 1 },
      { title: 'Design Add and Search Words Data Structure', link: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', difficulty: 'MEDIUM', orderIndex: 2 },
      { title: 'Word Search II', link: 'https://leetcode.com/problems/word-search-ii/', difficulty: 'HARD', orderIndex: 3 },
    ]
  },
  // Bit Manipulation
  {
    topicName: 'Bit Manipulation', problems: [
      { title: 'Single Number', link: 'https://leetcode.com/problems/single-number/', difficulty: 'EASY', orderIndex: 1 },
      { title: 'Number of 1 Bits', link: 'https://leetcode.com/problems/number-of-1-bits/', difficulty: 'EASY', orderIndex: 2 },
      { title: 'Counting Bits', link: 'https://leetcode.com/problems/counting-bits/', difficulty: 'EASY', orderIndex: 3 },
      { title: 'Reverse Bits', link: 'https://leetcode.com/problems/reverse-bits/', difficulty: 'EASY', orderIndex: 4 },
      { title: 'Missing Number', link: 'https://leetcode.com/problems/missing-number/', difficulty: 'EASY', orderIndex: 5 },
      { title: 'Sum of Two Integers', link: 'https://leetcode.com/problems/sum-of-two-integers/', difficulty: 'MEDIUM', orderIndex: 6 },
      { title: 'Reverse Integer', link: 'https://leetcode.com/problems/reverse-integer/', difficulty: 'MEDIUM', orderIndex: 7 },
    ]
  }
];

async function seed() {
  console.log('Starting comprehensive seeding...');

  for (const group of problemsData) {
    // Upsert the topic first
    const topic = await prisma.topic.upsert({
      where: { name: group.topicName },
      update: {},
      create: {
        name: group.topicName,
        orderIndex: problemsData.indexOf(group) + 1,
        description: `Problems related to ${group.topicName}`
      }
    });

    console.log(`Processing problems for topic: ${topic.name}`);

    for (const prob of group.problems) {
      // Use upsert for problems to avoid duplicates and update existing ones
      // Since we don't have a natural unique key, we match by title + topicId
      const existing = await prisma.problem.findFirst({
        where: { title: prob.title, topicId: topic.id }
      });

      if (existing) {
        await prisma.problem.update({
          where: { id: existing.id },
          data: {
            link: prob.link,
            difficulty: prob.difficulty as any,
            orderIndex: prob.orderIndex
          }
        });
      } else {
        await prisma.problem.create({
          data: {
            title: prob.title,
            link: prob.link,
            difficulty: prob.difficulty as any,
            orderIndex: prob.orderIndex,
            topicId: topic.id
          }
        });
      }
    }
  }

  console.log('Seeding finished!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
