import { StudyGuide } from './types';

export const dpGuide: StudyGuide = {
  topicName: 'Dynamic Programming',
  emoji: '🧩',
  tagline: 'Break it down, store sub-results, build up — the hardest pattern made simple',
  prerequisite: 'Arrays, Recursion (Trees)',
  sections: [
    { title: 'What Is DP?', icon: '🧠', content: `Dynamic Programming solves problems by breaking them into overlapping sub-problems, solving each ONCE, and storing results.

Two key properties:
1. OPTIMAL SUBSTRUCTURE — optimal solution uses optimal sub-solutions
2. OVERLAPPING SUBPROBLEMS — same sub-problem appears multiple times

Example: Fibonacci
  fib(5) = fib(4) + fib(3)
           fib(3)+fib(2)  fib(2)+fib(1)
           ↑ computed twice without DP!

Without DP: O(2^N) — exponential
With DP:   O(N) — store each result once` },
    { title: 'Top-Down vs Bottom-Up', icon: '🔧', content: `TOP-DOWN (Memoization) — recursive + cache
  const memo = {};
  function fib(n) {
    if (n <= 1) return n;
    if (memo[n] !== undefined) return memo[n];
    return memo[n] = fib(n-1) + fib(n-2);
  }

BOTTOM-UP (Tabulation) — iterative + table
  function fib(n) {
    const dp = [0, 1];
    for (let i = 2; i <= n; i++) {
      dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
  }

Space optimization — only keep what you need:
  function fib(n) {
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }` },
    { title: 'The 5 DP Patterns', icon: '🔑', content: `1. LINEAR DP — dp[i] depends on previous elements
   Examples: climbing stairs, house robber, longest increasing subsequence

2. KNAPSACK — include or exclude each item
   Examples: 0/1 knapsack, subset sum, coin change
   dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])

3. STRING DP — two strings, 2D table
   Examples: edit distance, LCS, regex matching
   dp[i][j] = f(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])

4. GRID DP — paths in a 2D grid
   Examples: unique paths, minimum path sum
   dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])

5. INTERVAL DP — dp on subarrays/substrings
   Examples: burst balloons, palindrome partitioning` },
    { title: 'How to Identify DP Problems', icon: '💡', content: `Ask yourself these questions:
1. Can I express the answer recursively? (substructure)
2. Will the recursion compute the same thing multiple times? (overlap)
3. Does the problem ask for min/max/count of ways?

Red-flag keywords: "minimum cost", "number of ways", "maximum profit", "can you reach", "longest/shortest"

The 4-step approach:
  Step 1: Define state — what does dp[i] represent?
  Step 2: Find transition — how does dp[i] relate to dp[i-1]?
  Step 3: Base case — what is dp[0]?
  Step 4: Answer — where is the final answer? dp[n]? max of dp?` }
  ],
  patternTriggers: [
    { trigger: '"Climbing stairs" or "number of ways to reach"', pattern: 'Linear DP — dp[i] = dp[i-1] + dp[i-2]' },
    { trigger: '"Coin change" or "minimum coins"', pattern: 'Unbounded knapsack' },
    { trigger: '"Longest common subsequence"', pattern: 'String DP — 2D table on two strings' },
    { trigger: '"Unique paths in grid"', pattern: 'Grid DP' },
    { trigger: '"House robber" or "can\'t pick adjacent"', pattern: 'Linear DP — dp[i] = max(dp[i-1], dp[i-2] + val)' },
    { trigger: '"Subset sum" or "partition equal"', pattern: '0/1 Knapsack' },
  ],
  complexityTable: [
    { operation: 'Linear DP (1D)', time: 'O(N)', space: 'O(N) or O(1)' },
    { operation: 'Knapsack (2D)', time: 'O(N × W)', space: 'O(N × W)' },
    { operation: 'String DP (LCS)', time: 'O(M × N)', space: 'O(M × N)' },
    { operation: 'Grid DP', time: 'O(M × N)', space: 'O(M × N)' },
  ],
  codeExample: {
    title: 'Coin Change — Minimum Coins',
    code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    walkthrough: `Input: coins=[1,3,4], amount=6

dp[0]=0
dp[1]=min(∞, dp[0]+1)=1          → 1 coin (1)
dp[2]=min(∞, dp[1]+1)=2          → 2 coins (1+1)
dp[3]=min(dp[2]+1, dp[0]+1)=1    → 1 coin (3) ✅
dp[4]=min(dp[3]+1, dp[1]+1, dp[0]+1)=1 → 1 coin (4) ✅
dp[5]=min(dp[4]+1, dp[2]+1)=2    → 2 coins (1+4)
dp[6]=min(dp[5]+1, dp[3]+1, dp[2]+1)=2 → 2 coins (3+3) ✅

Answer: dp[6] = 2`
  },
  keyTakeaways: [
    'DP = recursion + memoization. Start recursive, then optimize.',
    'Define what dp[i] MEANS before writing code',
    'Bottom-up is usually faster (no recursion overhead)',
    'Space optimization: if dp[i] only uses dp[i-1], keep 2 variables',
    'Practice the 5 patterns — most DP problems are variations'
  ]
};
