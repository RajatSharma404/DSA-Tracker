const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 62,
    title: 'Unique Paths',
    folder: '11-dynamic-programming',
    fileName: '0062-unique-paths.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(m * n)',
    space: 'O(n)',
    code: `/**
 * Problem: 62. Unique Paths
 * Difficulty: Medium
 * Topic: Dynamic Programming (Grid Paths)
 * LeetCode Link: https://leetcode.com/problems/unique-paths/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(N) optimized 1D row DP
 */

#include <vector>

using namespace std;

class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<int> dp(n, 1);

        for (int r = 1; r < m; ++r) {
            for (int c = 1; c < n; ++c) {
                dp[c] += dp[c - 1];
            }
        }

        return dp[n - 1];
    }
};
`
  },
  {
    id: 63,
    title: 'Unique Paths II',
    folder: '11-dynamic-programming',
    fileName: '0063-unique-paths-ii.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(m * n)',
    space: 'O(n)',
    code: `/**
 * Problem: 63. Unique Paths II
 * Difficulty: Medium
 * Topic: Dynamic Programming (Grid with Obstacles)
 * LeetCode Link: https://leetcode.com/problems/unique-paths-ii/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(N) space optimized
 */

#include <vector>

using namespace std;

class Solution {
public:
    int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid) {
        int m = obstacleGrid.size();
        int n = obstacleGrid[0].size();
        vector<long long> dp(n, 0);

        dp[0] = (obstacleGrid[0][0] == 0) ? 1 : 0;

        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                if (obstacleGrid[r][c] == 1) {
                    dp[c] = 0;
                } else if (c > 0) {
                    dp[c] += dp[c - 1];
                }
            }
        }

        return dp[n - 1];
    }
};
`
  },
  {
    id: 64,
    title: 'Minimum Path Sum',
    folder: '11-dynamic-programming',
    fileName: '0064-minimum-path-sum.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(m * n)',
    space: 'O(1)',
    code: `/**
 * Problem: 64. Minimum Path Sum
 * Difficulty: Medium
 * Topic: Dynamic Programming (In-Place Grid DP)
 * LeetCode Link: https://leetcode.com/problems/minimum-path-sum/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(1) in-place modification
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minPathSum(vector<vector<int>>& grid) {
        int m = grid.size();
        int n = grid[0].size();

        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                if (r == 0 && c == 0) continue;
                if (r == 0) grid[r][c] += grid[r][c - 1];
                else if (c == 0) grid[r][c] += grid[r - 1][c];
                else grid[r][c] += min(grid[r - 1][c], grid[r][c - 1]);
            }
        }

        return grid[m - 1][n - 1];
    }
};
`
  },
  {
    id: 91,
    title: 'Decode Ways',
    folder: '11-dynamic-programming',
    fileName: '0091-decode-ways.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 91. Decode Ways
 * Difficulty: Medium
 * Topic: Dynamic Programming (Fibonacci-Style Linear DP)
 * LeetCode Link: https://leetcode.com/problems/decode-ways/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
public:
    int numDecodings(string s) {
        if (s.empty() || s[0] == '0') return 0;

        int prev2 = 1, prev1 = 1;

        for (int i = 1; i < s.length(); ++i) {
            int current = 0;
            if (s[i] != '0') {
                current += prev1;
            }

            int twoDigit = stoi(s.substr(i - 1, 2));
            if (twoDigit >= 10 && twoDigit <= 26) {
                current += prev2;
            }

            prev2 = prev1;
            prev1 = current;
        }

        return prev1;
    }
};
`
  },
  {
    id: 139,
    title: 'Word Break',
    folder: '11-dynamic-programming',
    fileName: '0139-word-break.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n * m * k)',
    space: 'O(n)',
    code: `/**
 * Problem: 139. Word Break
 * Difficulty: Medium
 * Topic: Dynamic Programming (Bottom-Up)
 * LeetCode Link: https://leetcode.com/problems/word-break/
 * 
 * Complexity:
 * - Time: O(n * m * k) where n is s.length(), m is wordDict.size(), k is word length
 * - Space: O(n)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        vector<bool> dp(s.length() + 1, false);
        dp[s.length()] = true; // base case

        for (int i = s.length() - 1; i >= 0; --i) {
            for (const string& w : wordDict) {
                if (i + w.length() <= s.length() && s.substr(i, w.length()) == w) {
                    dp[i] = dp[i + w.length()];
                }
                if (dp[i]) break;
            }
        }

        return dp[0];
    }
};
`
  },
  {
    id: 152,
    title: 'Maximum Product Subarray',
    folder: '11-dynamic-programming',
    fileName: '0152-maximum-product-subarray.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 152. Maximum Product Subarray
 * Difficulty: Medium
 * Topic: Dynamic Programming (Min/Max Tracking)
 * LeetCode Link: https://leetcode.com/problems/maximum-product-subarray/
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
    int maxProduct(vector<int>& nums) {
        int res = *max_element(nums.begin(), nums.end());
        int curMin = 1, curMax = 1;

        for (int n : nums) {
            if (n == 0) {
                curMin = 1;
                curMax = 1;
                continue;
            }
            int temp = curMax * n;
            curMax = max({n * curMax, n * curMin, n});
            curMin = min({temp, n * curMin, n});

            res = max(res, curMax);
        }

        return res;
    }
};
`
  },
  {
    id: 416,
    title: 'Partition Equal Subset Sum',
    folder: '11-dynamic-programming',
    fileName: '0416-partition-equal-subset-sum.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n * target)',
    space: 'O(target)',
    code: `/**
 * Problem: 416. Partition Equal Subset Sum
 * Difficulty: Medium
 * Topic: Dynamic Programming (0/1 Knapsack)
 * LeetCode Link: https://leetcode.com/problems/partition-equal-subset-sum/
 * 
 * Complexity:
 * - Time: O(n * target)
 * - Space: O(target)
 */

#include <vector>
#include <numeric>
#include <unordered_set>

using namespace std;

class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int sum = accumulate(nums.begin(), nums.end(), 0);
        if (sum % 2 != 0) return false;

        int target = sum / 2;
        vector<bool> dp(target + 1, false);
        dp[0] = true;

        for (int num : nums) {
            for (int i = target; i >= num; --i) {
                dp[i] = dp[i] || dp[i - num];
            }
        }

        return dp[target];
    }
};
`
  },
  {
    id: 518,
    title: 'Coin Change II',
    folder: '11-dynamic-programming',
    fileName: '0518-coin-change-ii.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n * amount)',
    space: 'O(amount)',
    code: `/**
 * Problem: 518. Coin Change II
 * Difficulty: Medium
 * Topic: Dynamic Programming (Unbounded Knapsack)
 * LeetCode Link: https://leetcode.com/problems/coin-change-ii/
 * 
 * Complexity:
 * - Time: O(N * amount)
 * - Space: O(amount)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int change(int amount, vector<int>& coins) {
        vector<unsigned long long> dp(amount + 1, 0);
        dp[0] = 1;

        for (int coin : coins) {
            for (int i = coin; i <= amount; ++i) {
                dp[i] += dp[i - coin];
            }
        }

        return dp[amount];
    }
};
`
  },
  {
    id: 494,
    title: 'Target Sum',
    folder: '11-dynamic-programming',
    fileName: '0494-target-sum.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n * s)',
    space: 'O(s)',
    code: `/**
 * Problem: 494. Target Sum
 * Difficulty: Medium
 * Topic: Dynamic Programming (Subset Sum Reduction)
 * LeetCode Link: https://leetcode.com/problems/target-sum/
 * 
 * Complexity:
 * - Time: O(N * S) where S is (sum + target) / 2
 * - Space: O(S)
 */

#include <vector>
#include <numeric>
#include <cmath>

using namespace std;

class Solution {
public:
    int findTargetSumWays(vector<int>& nums, int target) {
        int sum = accumulate(nums.begin(), nums.end(), 0);
        if (abs(target) > sum || (sum + target) % 2 != 0) return 0;

        int s1 = (sum + target) / 2;
        vector<int> dp(s1 + 1, 0);
        dp[0] = 1;

        for (int num : nums) {
            for (int i = s1; i >= num; --i) {
                dp[i] += dp[i - num];
            }
        }

        return dp[s1];
    }
};
`
  },
  {
    id: 97,
    title: 'Interleaving String',
    folder: '11-dynamic-programming',
    fileName: '0097-interleaving-string.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(m * n)',
    space: 'O(n)',
    code: `/**
 * Problem: 97. Interleaving String
 * Difficulty: Medium
 * Topic: Dynamic Programming (2D Grid / Space Optimized)
 * LeetCode Link: https://leetcode.com/problems/interleaving-string/
 * 
 * Complexity:
 * - Time: O(m * n)
 * - Space: O(n)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        if (s1.length() + s2.length() != s3.length()) return false;

        int m = s1.length(), n = s2.length();
        vector<bool> dp(n + 1, false);

        for (int i = 0; i <= m; ++i) {
            for (int j = 0; j <= n; ++j) {
                if (i == 0 && j == 0) {
                    dp[j] = true;
                } else if (i == 0) {
                    dp[j] = dp[j - 1] && (s2[j - 1] == s3[i + j - 1]);
                } else if (j == 0) {
                    dp[j] = dp[j] && (s1[i - 1] == s3[i + j - 1]);
                } else {
                    dp[j] = (dp[j] && s1[i - 1] == s3[i + j - 1]) ||
                            (dp[j - 1] && s2[j - 1] == s3[i + j - 1]);
                }
            }
        }

        return dp[n];
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
  execSync(`git add "${relFilePath}" solutions/README.md scripts/commit-batch-11.js`, { cwd: rootDir });
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
