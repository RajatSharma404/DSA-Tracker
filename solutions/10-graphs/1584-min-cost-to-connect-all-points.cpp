/**
 * Problem: 1584. Min Cost to Connect All Points
 * Difficulty: Medium
 * Topic: Graphs / Prim's Algorithm (Minimum Spanning Tree)
 * LeetCode Link: https://leetcode.com/problems/min-cost-to-connect-all-points/
 * 
 * Complexity:
 * - Time: O(V^2) where V is the number of points (optimal for dense complete graph)
 * - Space: O(V) for tracking minimum distances
 */

#include <vector>
#include <cmath>
#include <climits>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size();
        vector<int> minDist(n, INT_MAX);
        vector<bool> inMST(n, false);

        minDist[0] = 0;
        int totalCost = 0;

        for (int step = 0; step < n; step++) {
            int u = -1;
            for (int i = 0; i < n; i++) {
                if (!inMST[i] && (u == -1 || minDist[i] < minDist[u])) {
                    u = i;
                }
            }

            inMST[u] = true;
            totalCost += minDist[u];

            for (int v = 0; v < n; v++) {
                if (!inMST[v]) {
                    int dist = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
                    minDist[v] = min(minDist[v], dist);
                }
            }
        }

        return totalCost;
    }
};
