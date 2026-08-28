/**
 * Problem: 213. House Robber II
 * Difficulty: Medium
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/house-robber-ii/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
private:
    int robHelper(vector<int>& nums, int start, int end) {
        int rob1 = 0, rob2 = 0;
        for (int i = start; i <= end; ++i) {
            int temp = max(nums[i] + rob1, rob2);
            rob1 = rob2;
            rob2 = temp;
        }
        return rob2;
    }

public:
    int rob(vector<int>& nums) {
        int n = nums.size();
        if (n == 1) return nums[0];
        return max(robHelper(nums, 0, n - 2), robHelper(nums, 1, n - 1));
    }
};
