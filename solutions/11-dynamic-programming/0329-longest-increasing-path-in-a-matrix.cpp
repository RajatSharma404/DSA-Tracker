/**
 * Problem: 329. Longest Increasing Path in a Matrix
 * Difficulty: Hard
 * Topic: Dynamic Programming / Graph DFS with Memoization
 * LeetCode Link: https://leetcode.com/problems/longest-increasing-path-in-a-matrix/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M * N) for DP memo table and recursion stack
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
private:
    int dfs(const vector<vector<int>>& matrix, int r, int c, vector<vector<int>>& memo) {
        if (memo[r][c] != 0) return memo[r][c];

        int m = matrix.size();
        int n = matrix[0].size();
        int maxLen = 1;

        int dirs[4][2] = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};

        for (auto& d : dirs) {
            int nr = r + d[0];
            int nc = c + d[1];
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] > matrix[r][c]) {
                maxLen = max(maxLen, 1 + dfs(matrix, nr, nc, memo));
            }
        }

        return memo[r][c] = maxLen;
    }

public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        if (matrix.empty() || matrix[0].empty()) return 0;

        int m = matrix.size();
        int n = matrix[0].size();
        vector<vector<int>> memo(m, vector<int>(n, 0));
        int longest = 0;

        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                longest = max(longest, dfs(matrix, r, c, memo));
            }
        }

        return longest;
    }
};
