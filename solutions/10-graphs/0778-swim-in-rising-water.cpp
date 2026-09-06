/**
 * Problem: 778. Swim in Rising Water
 * Difficulty: Hard
 * Topic: Graphs / Dijkstra's Algorithm / Priority Queue
 * LeetCode Link: https://leetcode.com/problems/swim-in-rising-water/
 * 
 * Complexity:
 * - Time: O(N^2 log N) where N x N is the grid dimension
 * - Space: O(N^2) for distance matrix and priority queue
 */

#include <vector>
#include <queue>
#include <tuple>
#include <climits>
#include <algorithm>

using namespace std;

class Solution {
public:
    int swimInWater(vector<vector<int>>& grid) {
        int n = grid.size();
        vector<vector<int>> dist(n, vector<int>(n, INT_MAX));
        priority_queue<tuple<int, int, int>, vector<tuple<int, int, int>>, greater<tuple<int, int, int>>> pq;

        dist[0][0] = grid[0][0];
        pq.push({grid[0][0], 0, 0});

        int dirs[4][2] = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};

        while (!pq.empty()) {
            auto [t, r, c] = pq.top();
            pq.pop();

            if (r == n - 1 && c == n - 1) return t;
            if (t > dist[r][c]) continue;

            for (auto& d : dirs) {
                int nr = r + d[0];
                int nc = c + d[1];

                if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
                    int newT = max(t, grid[nr][nc]);
                    if (newT < dist[nr][nc]) {
                        dist[nr][nc] = newT;
                        pq.push({newT, nr, nc});
                    }
                }
            }
        }

        return 0;
    }
};
