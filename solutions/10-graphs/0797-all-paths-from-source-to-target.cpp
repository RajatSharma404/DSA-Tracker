/**
 * Problem: 797. All Paths From Source to Target
 * Difficulty: Medium
 * Topic: Graphs / Backtracking
 * LeetCode Link: https://leetcode.com/problems/all-paths-from-source-to-target/
 *
 * Complexity:
 * - Time: O(2^n * n)
 * - Space: O(n)
 */

#include <vector>

using namespace std;

class Solution {
private:
    void dfs(int curr, int target, const vector<vector<int>>& graph, vector<int>& path, vector<vector<int>>& res) {
        path.push_back(curr);
        if (curr == target) {
            res.push_back(path);
        } else {
            for (int nextNode : graph[curr]) {
                dfs(nextNode, target, graph, path, res);
            }
        }
        path.pop_back();
    }

public:
    vector<vector<int>> allPathsSourceTarget(vector<vector<int>>& graph) {
        vector<vector<int>> res;
        vector<int> path;
        dfs(0, graph.size() - 1, graph, path, res);
        return res;
    }
};
