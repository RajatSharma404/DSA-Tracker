/**
 * Problem: 1004. Max Consecutive Ones III
 * Difficulty: Medium
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/max-consecutive-ones-iii/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int l = 0, zeros = 0, maxLen = 0;
        for (int r = 0; r < nums.size(); ++r) {
            if (nums[r] == 0) zeros++;
            while (zeros > k) {
                if (nums[l++] == 0) zeros--;
            }
            maxLen = max(maxLen, r - l + 1);
        }
        return maxLen;
    }
};
