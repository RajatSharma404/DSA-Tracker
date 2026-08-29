/**
 * Problem: 90. Subsets II
 * Difficulty: Medium
 * Topic: Recursion & Backtracking (Handling Duplicates)
 * LeetCode Link: https://leetcode.com/problems/subsets-ii/
 * 
 * Complexity:
 * - Time: O(n * 2^n)
 * - Space: O(n) recursion stack
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
private:
    void backtrack(int index, vector<int>& nums, vector<int>& current, vector<vector<int>>& result) {
        result.push_back(current);

        for (int i = index; i < nums.size(); ++i) {
            if (i > index && nums[i] == nums[i - 1]) continue; // skip duplicates
            current.push_back(nums[i]);
            backtrack(i + 1, nums, current, result);
            current.pop_back();
        }
    }

public:
    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> current;
        sort(nums.begin(), nums.end());
        backtrack(0, nums, current, result);
        return result;
    }
};
