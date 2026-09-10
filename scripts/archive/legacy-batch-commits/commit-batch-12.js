const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 309,
    title: 'Best Time to Buy and Sell Stock with Cooldown',
    folder: '11-dynamic-programming',
    fileName: '0309-best-time-to-buy-and-sell-stock-with-cooldown.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 309. Best Time to Buy and Sell Stock with Cooldown
 * Difficulty: Medium
 * Topic: Dynamic Programming (State Machine DP)
 * LeetCode Link: https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int sold = 0;
        int held = -1e9;
        int reset = 0;

        for (int price : prices) {
            int preSold = sold;
            sold = held + price;
            held = max(held, reset - price);
            reset = max(reset, preSold);
        }

        return max(sold, reset);
    }
};
`
  },
  {
    id: 714,
    title: 'Best Time to Buy and Sell Stock with Transaction Fee',
    folder: '11-dynamic-programming',
    fileName: '0714-best-time-to-buy-and-sell-stock-with-transaction-fee.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 714. Best Time to Buy and Sell Stock with Transaction Fee
 * Difficulty: Medium
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices, int fee) {
        int hold = -prices[0];
        int cash = 0;

        for (int i = 1; i < prices.size(); ++i) {
            cash = max(cash, hold + prices[i] - fee);
            hold = max(hold, cash - prices[i]);
        }

        return cash;
    }
};
`
  },
  {
    id: 583,
    title: 'Delete Operation for Two Strings',
    folder: '11-dynamic-programming',
    fileName: '0583-delete-operation-for-two-strings.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(m * n)',
    space: 'O(n)',
    code: `/**
 * Problem: 583. Delete Operation for Two Strings
 * Difficulty: Medium
 * Topic: Dynamic Programming (LCS Reduction)
 * LeetCode Link: https://leetcode.com/problems/delete-operation-for-two-strings/
 * 
 * Complexity:
 * - Time: O(m * n)
 * - Space: O(n) space optimized
 */

#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<int> dp(n + 1, 0);

        for (int i = 1; i <= m; ++i) {
            int prev = 0;
            for (int j = 1; j <= n; ++j) {
                int temp = dp[j];
                if (word1[i - 1] == word2[j - 1]) {
                    dp[j] = 1 + prev;
                } else {
                    dp[j] = max(dp[j], dp[j - 1]);
                }
                prev = temp;
            }
        }

        int lcs = dp[n];
        return (m - lcs) + (n - lcs);
    }
};
`
  },
  {
    id: 72,
    title: 'Edit Distance',
    folder: '11-dynamic-programming',
    fileName: '0072-edit-distance.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(m * n)',
    space: 'O(n)',
    code: `/**
 * Problem: 72. Edit Distance
 * Difficulty: Medium
 * Topic: Dynamic Programming (Levenshtein Distance)
 * LeetCode Link: https://leetcode.com/problems/edit-distance/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(N) space optimized
 */

#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<int> dp(n + 1);

        for (int j = 0; j <= n; ++j) dp[j] = j;

        for (int i = 1; i <= m; ++i) {
            int prev = dp[0];
            dp[0] = i;
            for (int j = 1; j <= n; ++j) {
                int temp = dp[j];
                if (word1[i - 1] == word2[j - 1]) {
                    dp[j] = prev;
                } else {
                    dp[j] = 1 + min({prev, dp[j - 1], dp[j]});
                }
                prev = temp;
            }
        }

        return dp[n];
    }
};
`
  },
  {
    id: 312,
    title: 'Burst Balloons',
    folder: '11-dynamic-programming',
    fileName: '0312-burst-balloons.cpp',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    time: 'O(n^3)',
    space: 'O(n^2)',
    code: `/**
 * Problem: 312. Burst Balloons
 * Difficulty: Hard
 * Topic: Dynamic Programming (Interval / Matrix Chain Multiplication)
 * LeetCode Link: https://leetcode.com/problems/burst-balloons/
 * 
 * Complexity:
 * - Time: O(n^3)
 * - Space: O(n^2)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int maxCoins(vector<int>& nums) {
        vector<int> extended = {1};
        extended.insert(extended.end(), nums.begin(), nums.end());
        extended.push_back(1);

        int n = extended.size();
        vector<vector<int>> dp(n, vector<int>(n, 0));

        for (int len = 2; len < n; ++len) {
            for (int left = 0; left < n - len; ++left) {
                int right = left + len;
                for (int k = left + 1; k < right; ++k) {
                    int coins = extended[left] * extended[k] * extended[right] + dp[left][k] + dp[k][right];
                    dp[left][right] = max(dp[left][right], coins);
                }
            }
        }

        return dp[0][n - 1];
    }
};
`
  },
  {
    id: 10,
    title: 'Regular Expression Matching',
    folder: '11-dynamic-programming',
    fileName: '0010-regular-expression-matching.cpp',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    time: 'O(m * n)',
    space: 'O(m * n)',
    code: `/**
 * Problem: 10. Regular Expression Matching
 * Difficulty: Hard
 * Topic: Dynamic Programming (2D Grid)
 * LeetCode Link: https://leetcode.com/problems/regular-expression-matching/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M * N)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    bool isMatch(string s, string p) {
        int m = s.length(), n = p.length();
        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
        dp[0][0] = true;

        for (int j = 2; j <= n; j += 2) {
            if (p[j - 1] == '*') {
                dp[0][j] = dp[0][j - 2];
            }
        }

        for (int i = 1; i <= m; ++i) {
            for (int j = 1; j <= n; ++j) {
                if (p[j - 1] == '*') {
                    dp[i][j] = dp[i][j - 2]; // 0 occurrences
                    if (p[j - 2] == '.' || p[j - 2] == s[i - 1]) {
                        dp[i][j] = dp[i][j] || dp[i - 1][j]; // 1+ occurrences
                    }
                } else if (p[j - 1] == '.' || p[j - 1] == s[i - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                }
            }
        }

        return dp[m][n];
    }
};
`
  },
  {
    id: 17,
    title: 'Letter Combinations of a Phone Number',
    folder: '09-backtracking',
    fileName: '0017-letter-combinations-of-a-phone-number.cpp',
    difficulty: 'Medium',
    topic: 'Recursion & Backtracking',
    time: 'O(4^n * n)',
    space: 'O(n)',
    code: `/**
 * Problem: 17. Letter Combinations of a Phone Number
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/letter-combinations-of-a-phone-number/
 * 
 * Complexity:
 * - Time: O(4^N * N)
 * - Space: O(N) recursion stack
 */

#include <vector>
#include <string>

using namespace std;

class Solution {
private:
    const vector<string> mapping = {
        "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"
    };

    void backtrack(const string& digits, int index, string& current, vector<string>& result) {
        if (index == digits.length()) {
            result.push_back(current);
            return;
        }

        string letters = mapping[digits[index] - '0'];
        for (char c : letters) {
            current.push_back(c);
            backtrack(digits, index + 1, current, result);
            current.pop_back();
        }
    }

public:
    vector<string> letterCombinations(string digits) {
        if (digits.empty()) return {};
        vector<string> result;
        string current = "";
        backtrack(digits, 0, current, result);
        return result;
    }
};
`
  },
  {
    id: 77,
    title: 'Combinations',
    folder: '09-backtracking',
    fileName: '0077-combinations.cpp',
    difficulty: 'Medium',
    topic: 'Recursion & Backtracking',
    time: 'O(k * C(n, k))',
    space: 'O(k)',
    code: `/**
 * Problem: 77. Combinations
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/combinations/
 * 
 * Complexity:
 * - Time: O(k * C(n, k))
 * - Space: O(k)
 */

#include <vector>

using namespace std;

class Solution {
private:
    void backtrack(int start, int n, int k, vector<int>& current, vector<vector<int>>& result) {
        if (current.size() == k) {
            result.push_back(current);
            return;
        }

        // Optimization: pruning impossible branches
        for (int i = start; i <= n - (k - current.size()) + 1; ++i) {
            current.push_back(i);
            backtrack(i + 1, n, k, current, result);
            current.pop_back();
        }
    }

public:
    vector<vector<int>> combine(int n, int k) {
        vector<vector<int>> result;
        vector<int> current;
        backtrack(1, n, k, current, result);
        return result;
    }
};
`
  },
  {
    id: 51,
    title: 'N-Queens',
    folder: '09-backtracking',
    fileName: '0051-n-queens.cpp',
    difficulty: 'Hard',
    topic: 'Recursion & Backtracking',
    time: 'O(n!)',
    space: 'O(n)',
    code: `/**
 * Problem: 51. N-Queens
 * Difficulty: Hard
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/n-queens/
 * 
 * Complexity:
 * - Time: O(N!)
 * - Space: O(N) hash sets + board
 */

#include <vector>
#include <string>
#include <unordered_set>

using namespace std;

class Solution {
private:
    unordered_set<int> cols;
    unordered_set<int> posDiag; // r + c
    unordered_set<int> negDiag; // r - c

    void backtrack(int r, int n, vector<string>& board, vector<vector<string>>& result) {
        if (r == n) {
            result.push_back(board);
            return;
        }

        for (int c = 0; c < n; ++c) {
            if (cols.count(c) || posDiag.count(r + c) || negDiag.count(r - c)) {
                continue;
            }

            cols.insert(c);
            posDiag.insert(r + c);
            negDiag.insert(r - c);
            board[r][c] = 'Q';

            backtrack(r + 1, n, board, result);

            cols.erase(c);
            posDiag.erase(r + c);
            negDiag.erase(r - c);
            board[r][c] = '.';
        }
    }

public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> result;
        vector<string> board(n, string(n, '.'));
        backtrack(0, n, board, result);
        return result;
    }
};
`
  },
  {
    id: 37,
    title: 'Sudoku Solver',
    folder: '09-backtracking',
    fileName: '0037-sudoku-solver.cpp',
    difficulty: 'Hard',
    topic: 'Recursion & Backtracking',
    time: 'O(9^(empty_cells))',
    space: 'O(1)',
    code: `/**
 * Problem: 37. Sudoku Solver
 * Difficulty: Hard
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/sudoku-solver/
 * 
 * Complexity:
 * - Time: O(9^E) where E is number of empty cells
 * - Space: O(1) in-place board state
 */

#include <vector>

using namespace std;

class Solution {
private:
    bool isValid(vector<vector<char>>& board, int row, int col, char c) {
        for (int i = 0; i < 9; ++i) {
            if (board[row][i] == c) return false;
            if (board[i][col] == c) return false;
            if (board[3 * (row / 3) + i / 3][3 * (col / 3) + i % 3] == c) return false;
        }
        return true;
    }

    bool solve(vector<vector<char>>& board) {
        for (int r = 0; r < 9; ++r) {
            for (int c = 0; c < 9; ++c) {
                if (board[r][c] == '.') {
                    for (char ch = '1'; ch <= '9'; ++ch) {
                        if (isValid(board, r, c, ch)) {
                            board[r][c] = ch;
                            if (solve(board)) return true;
                            board[r][c] = '.';
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

public:
    void solveSudoku(vector<vector<char>>& board) {
        solve(board);
    }
};
`
  }
];

const rootDir = path.join(__dirname, '..');
const solutionsDir = path.join(rootDir, 'solutions');

for (let i = 0; i < problems.length; i++) {
  const p = problems[i];
  const targetDir = path.join(solutionsDir, p.folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, p.fileName);
  fs.writeFileSync(filePath, p.code, 'utf8');

  sync();

  const relFilePath = path.join('solutions', p.folder, p.fileName);
  const commitMsg = `feat(solutions): add ${p.id}. ${p.title} (${p.difficulty})`;

  // Strictly stage only this solution file, solutions/README.md, and this batch script
  execSync(`git add "${relFilePath}" solutions/README.md scripts/commit-batch-12.js`, { cwd: rootDir });
  execSync(`git commit -m "${commitMsg}"`, { cwd: rootDir });
  console.log(`[${i + 1}/10] Committed: "${commitMsg}"`);
}

console.log('\n🚀 Pushing all 10 commits to GitHub...');
try {
  const pushOutput = execSync('git push origin main', { cwd: rootDir }).toString();
  console.log(pushOutput);
  console.log('\n🎉 Successfully committed and pushed 10 questions to GitHub!');
} catch (err) {
  console.error('Push error:', err.message);
}
