/**
 * Problem: 39. Combination Sum
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/combination-sum/
 * 
 * Complexity:
 * - Time: O(2^t) where t is target value
 * - Space: O(t)
 */

#include <vector>

using namespace std;

class Solution {
private:
    void backtrack(int index, int target, vector<int>& candidates, vector<int>& current, vector<vector<int>>& result) {
        if (target == 0) {
            result.push_back(current);
            return;
        }
        if (target < 0 || index >= candidates.size()) return;
        
        // Option 1: Include candidate[index]
        current.push_back(candidates[index]);
        backtrack(index, target - candidates[index], candidates, current, result);
        current.pop_back();
        
        // Option 2: Skip candidate[index]
        backtrack(index + 1, target, candidates, current, result);
    }
    
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        vector<vector<int>> result;
        vector<int> current;
        backtrack(0, target, candidates, current, result);
        return result;
    }
};
