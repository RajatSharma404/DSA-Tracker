/**
 * Problem: 695. Max Area of Island
 * Difficulty: Medium
 * Topic: Graphs (DFS)
 * LeetCode Link: https://leetcode.com/problems/max-area-of-island/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M * N) recursion stack
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
private:
    int dfs(vector<vector<int>>& grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.size() || c >= grid[0].size() || grid[r][c] == 0) {
            return 0;
        }

        grid[r][c] = 0; // mark visited
        return 1 + dfs(grid, r + 1, c) + dfs(grid, r - 1, c) + dfs(grid, r, c + 1) + dfs(grid, r, c - 1);
    }

public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int maxArea = 0;
        for (int r = 0; r < grid.size(); ++r) {
            for (int c = 0; c < grid[0].size(); ++c) {
                if (grid[r][c] == 1) {
                    maxArea = max(maxArea, dfs(grid, r, c));
                }
            }
        }
        return maxArea;
    }
};
