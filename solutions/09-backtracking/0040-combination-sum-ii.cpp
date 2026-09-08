/**
 * Problem: 40. Combination Sum II
 * Difficulty: Medium
 * Topic: Recursion & Backtracking (Duplicates Handling)
 * LeetCode Link: https://leetcode.com/problems/combination-sum-ii/
 * 
 * Complexity:
 * - Time: O(2^n)
 * - Space: O(n) recursion stack
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
private:
    void backtrack(const vector<int>& candidates, int target, int start, vector<int>& current, vector<vector<int>>& result) {
        if (target == 0) {
            result.push_back(current);
            return;
        }

        for (size_t i = start; i < candidates.size(); i++) {
            if (candidates[i] > target) break; // Prune branch

            // Skip duplicate elements at the same recursion depth
            if (i > (size_t)start && candidates[i] == candidates[i - 1]) continue;

            current.push_back(candidates[i]);
            backtrack(candidates, target - candidates[i], i + 1, current, result);
            current.pop_back();
        }
    }

public:
    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<vector<int>> result;
        vector<int> current;
        backtrack(candidates, target, 0, current, result);
        return result;
    }
};
