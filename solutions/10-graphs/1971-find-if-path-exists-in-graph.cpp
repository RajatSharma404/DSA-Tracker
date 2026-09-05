/**
 * Problem: 1971. Find if Path Exists in Graph
 * Difficulty: Easy
 * Topic: Graphs / BFS
 * LeetCode Link: https://leetcode.com/problems/find-if-path-exists-in-graph/
 *
 * Complexity:
 * - Time: O(v + e)
 * - Space: O(v + e)
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    bool validPath(int n, vector<vector<int>>& edges, int source, int destination) {
        if (source == destination) return true;
        vector<vector<int>> adj(n);
        for (const auto& e : edges) {
            adj[e[0]].push_back(e[1]);
            adj[e[1]].push_back(e[0]);
        }
        vector<bool> visited(n, false);
        visited[source] = true;
        queue<int> q;
        q.push(source);
        
        while (!q.empty()) {
            int node = q.front(); q.pop();
            if (node == destination) return true;
            for (int nextNode : adj[node]) {
                if (!visited[nextNode]) {
                    visited[nextNode] = true;
                    q.push(nextNode);
                }
            }
        }
        return false;
    }
};
