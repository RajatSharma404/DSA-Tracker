/**
 * Problem: 399. Evaluate Division
 * Difficulty: Medium
 * Topic: Graphs / DFS on Weighted Directed Graph
 * LeetCode Link: https://leetcode.com/problems/evaluate-division/
 * 
 * Complexity:
 * - Time: O((V + E) * Q) where Q is the number of queries
 * - Space: O(V + E) for graph adjacency list
 */

#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>

using namespace std;

class Solution {
private:
    bool dfs(const string& src, const string& dst, unordered_map<string, unordered_map<string, double>>& graph,
             unordered_set<string>& visited, double& ans, double currentProd) {
        if (src == dst) {
            ans = currentProd;
            return true;
        }

        visited.insert(src);

        for (const auto& [neighbor, weight] : graph[src]) {
            if (!visited.count(neighbor)) {
                if (dfs(neighbor, dst, graph, visited, ans, currentProd * weight)) {
                    return true;
                }
            }
        }

        return false;
    }

public:
    vector<double> calcEquation(vector<vector<string>>& equations, vector<double>& values, vector<vector<string>>& queries) {
        unordered_map<string, unordered_map<string, double>> graph;

        for (size_t i = 0; i < equations.size(); i++) {
            const string& u = equations[i][0];
            const string& v = equations[i][1];
            double val = values[i];

            graph[u][v] = val;
            graph[v][u] = 1.0 / val;
        }

        vector<double> results;

        for (const auto& q : queries) {
            const string& src = q[0];
            const string& dst = q[1];

            if (!graph.count(src) || !graph.count(dst)) {
                results.push_back(-1.0);
            } else if (src == dst) {
                results.push_back(1.0);
            } else {
                unordered_set<string> visited;
                double ans = -1.0;
                dfs(src, dst, graph, visited, ans, 1.0);
                results.push_back(ans);
            }
        }

        return results;
    }
};
