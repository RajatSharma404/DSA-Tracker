/**
 * Problem: 547. Number of Provinces
 * Difficulty: Medium
 * Topic: Graphs / Disjoint Set Union (DSU) / DFS
 * LeetCode Link: https://leetcode.com/problems/number-of-provinces/
 *
 * Complexity:
 * - Time: O(n^2)
 * - Space: O(n)
 */

#include <vector>

using namespace std;

class Solution {
private:
    void dfs(int node, const vector<vector<int>>& isConnected, vector<bool>& visited) {
        visited[node] = true;
        for (int neighbor = 0; neighbor < isConnected.size(); ++neighbor) {
            if (isConnected[node][neighbor] == 1 && !visited[neighbor]) {
                dfs(neighbor, isConnected, visited);
            }
        }
    }

public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size(), provinces = 0;
        vector<bool> visited(n, false);
        for (int i = 0; i < n; ++i) {
            if (!visited[i]) {
                provinces++;
                dfs(i, isConnected, visited);
            }
        }
        return provinces;
    }
};
