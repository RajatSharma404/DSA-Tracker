import { StudyGuide } from './types';

export const backtrackingGuide: StudyGuide = {
  topicName: 'Backtracking',
  emoji: '🔙',
  tagline: 'Try all possibilities systematically — the recursive brute-force with pruning',
  prerequisite: 'Recursion (Trees), Arrays',
  sections: [
    { title: 'The Core Idea', icon: '🧠', content: `Backtracking explores ALL possible solutions by building candidates incrementally and abandoning ("backtracking") paths that can't lead to valid solutions.

  Think of it as a decision tree:
                  []
           /       |       \\
         [1]      [2]      [3]
        /   \\      |
     [1,2] [1,3]  [2,3]
       |
    [1,2,3]

Template:
  function backtrack(path, choices) {
    if (isComplete(path)) { results.push([...path]); return; }
    for (const choice of choices) {
      if (!isValid(choice)) continue;  // PRUNE
      path.push(choice);               // CHOOSE
      backtrack(path, nextChoices);     // EXPLORE
      path.pop();                      // UN-CHOOSE (backtrack)
    }
  }` },
    { title: 'Subsets vs Permutations vs Combinations', icon: '🔑', content: `THREE fundamental backtracking problems:

SUBSETS: all possible subsets of [1,2,3]
  → [], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]
  Use start index, include/exclude each element

PERMUTATIONS: all orderings of [1,2,3]
  → [1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]
  Use a "used" boolean array, no start index

COMBINATIONS: choose K from N
  → C(4,2) = [1,2], [1,3], [1,4], [2,3], [2,4], [3,4]
  Like subsets but stop when size == K` },
    { title: 'Pruning — The Key to Performance', icon: '✂️', content: `Without pruning, backtracking is just brute force. Pruning skips branches early.

Example — N-Queens pruning:
  Before placing a queen, check:
  ✓ No queen in same row (guaranteed by design)
  ✓ No queen in same column → columnsUsed set
  ✓ No queen on same diagonal → diag1 set (row-col)
  ✓ No queen on same anti-diagonal → diag2 set (row+col)

  If any check fails → skip this position entirely (prune!)
  This reduces factorial to manageable time.` }
  ],
  patternTriggers: [
    { trigger: '"All subsets" or "power set"', pattern: 'Backtracking with start index, include/exclude' },
    { trigger: '"All permutations"', pattern: 'Backtracking with used[] array' },
    { trigger: '"N-Queens" or "place items with constraints"', pattern: 'Backtracking + constraint pruning' },
    { trigger: '"Word search" in grid', pattern: 'Grid DFS with backtracking (unmark visited)' },
    { trigger: '"Generate all valid parentheses"', pattern: 'Backtracking with open/close count' },
  ],
  complexityTable: [
    { operation: 'Subsets', time: 'O(2^N)', space: 'O(N)' },
    { operation: 'Permutations', time: 'O(N!)', space: 'O(N)' },
    { operation: 'N-Queens', time: 'O(N!)', space: 'O(N)' },
  ],
  codeExample: {
    title: 'Subsets',
    code: `function subsets(nums) {
  const result = [];
  function backtrack(start, current) {
    result.push([...current]);
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return result;
}`,
    walkthrough: `Input: [1, 2, 3]

backtrack(0, []) → add []
  i=0: [1] → backtrack(1, [1]) → add [1]
    i=1: [1,2] → backtrack(2, [1,2]) → add [1,2]
      i=2: [1,2,3] → add [1,2,3] → pop → [1,2]
    pop → [1]
    i=2: [1,3] → add [1,3] → pop → [1]
  pop → []
  i=1: [2] → add [2], then [2,3]
  i=2: [3] → add [3]

Result: [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]`
  },
  keyTakeaways: [
    'Template: choose → explore → un-choose',
    'Subsets = start index. Permutations = used array.',
    'Always push a COPY ([...path]) to results, not the reference',
    'Prune early to avoid exploring dead-end branches',
    'Most backtracking is O(2^N) or O(N!) — can\'t do better'
  ]
};
