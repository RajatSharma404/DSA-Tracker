/**
 * Problem: 77. Combinations
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/combinations/
 * 
 * Complexity:
 * - Time: O(k * C(n, k))
 * - Space: O(k)
 */

#include <vector>

using namespace std;

class Solution {
private:
    void backtrack(int start, int n, int k, vector<int>& current, vector<vector<int>>& result) {
        if (current.size() == k) {
            result.push_back(current);
            return;
        }

        // Optimization: pruning impossible branches
        for (int i = start; i <= n - (k - current.size()) + 1; ++i) {
            current.push_back(i);
            backtrack(i + 1, n, k, current, result);
            current.pop_back();
        }
    }

public:
    vector<vector<int>> combine(int n, int k) {
        vector<vector<int>> result;
        vector<int> current;
        backtrack(1, n, k, current, result);
        return result;
    }
};
