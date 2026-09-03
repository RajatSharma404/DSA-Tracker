/**
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
