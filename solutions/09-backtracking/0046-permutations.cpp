/**
 * Problem: 46. Permutations
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/permutations/
 * 
 * Complexity:
 * - Time: O(n! * n)
 * - Space: O(n) recursion stack
 */

#include <vector>

using namespace std;

class Solution {
private:
    void backtrack(int first, vector<int>& nums, vector<vector<int>>& result) {
        if (first == nums.size()) {
            result.push_back(nums);
            return;
        }

        for (int i = first; i < nums.size(); ++i) {
            swap(nums[first], nums[i]);
            backtrack(first + 1, nums, result);
            swap(nums[first], nums[i]); // backtrack
        }
    }

public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> result;
        backtrack(0, nums, result);
        return result;
    }
};
