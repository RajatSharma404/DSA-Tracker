/**
 * Problem: 684. Redundant Connection
 * Difficulty: Medium
 * Topic: Graphs (Union-Find / Disjoint Set)
 * LeetCode Link: https://leetcode.com/problems/redundant-connection/
 * 
 * Complexity:
 * - Time: O(N * alpha(N))
 * - Space: O(N)
 */

#include <vector>

using namespace std;

class Solution {
private:
    int find(vector<int>& parent, int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent, parent[i]);
    }

    bool unite(vector<int>& parent, vector<int>& rank, int u, int v) {
        int rootU = find(parent, u);
        int rootV = find(parent, v);
        if (rootU == rootV) return false;

        if (rank[rootU] < rank[rootV]) {
            parent[rootU] = rootV;
        } else if (rank[rootU] > rank[rootV]) {
            parent[rootV] = rootU;
        } else {
            parent[rootV] = rootU;
            rank[rootU]++;
        }
        return true;
    }

public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        int n = edges.size();
        vector<int> parent(n + 1), rank(n + 1, 0);
        for (int i = 1; i <= n; ++i) parent[i] = i;

        for (const auto& edge : edges) {
            if (!unite(parent, rank, edge[0], edge[1])) {
                return edge;
            }
        }
        return {};
    }
};
