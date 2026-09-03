/**
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
