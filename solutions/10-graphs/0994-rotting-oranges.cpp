/**
 * Problem: 994. Rotting Oranges
 * Difficulty: Medium
 * Topic: Graphs (Multi-Source BFS)
 * LeetCode Link: https://leetcode.com/problems/rotting-oranges/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M * N) queue space
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        queue<pair<int, int>> q;
        int fresh = 0;

        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                if (grid[r][c] == 2) q.push({r, c});
                else if (grid[r][c] == 1) fresh++;
            }
        }

        if (fresh == 0) return 0;

        int minutes = 0;
        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        while (!q.empty() && fresh > 0) {
            int sz = q.size();
            minutes++;

            for (int i = 0; i < sz; ++i) {
                auto [r, c] = q.front();
                q.pop();

                for (auto& d : dirs) {
                    int nr = r + d[0], nc = c + d[1];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2;
                        fresh--;
                        q.push({nr, nc});
                    }
                }
            }
        }

        return fresh == 0 ? minutes : -1;
    }
};
