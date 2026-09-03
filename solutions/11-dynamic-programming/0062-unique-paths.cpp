/**
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
