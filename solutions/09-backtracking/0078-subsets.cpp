/**
 * Problem: 78. Subsets
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/subsets/
 * 
 * Complexity:
 * - Time: O(n * 2^n)
 * - Space: O(n)
 */

#include <vector>

using namespace std;

class Solution {
private:
    void backtrack(int index, vector<int>& nums, vector<int>& current, vector<vector<int>>& result) {
        result.push_back(current);
        
        for (int i = index; i < nums.size(); ++i) {
            current.push_back(nums[i]);
            backtrack(i + 1, nums, current, result);
            current.pop_back();
        }
    }
    
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> current;
        backtrack(0, nums, current, result);
        return result;
    }
};
