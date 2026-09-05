/**
 * Problem: 209. Minimum Size Subarray Sum
 * Difficulty: Medium
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/minimum-size-subarray-sum/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>
#include <climits>

using namespace std;

class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int l = 0, sum = 0, minLen = INT_MAX;
        for (int r = 0; r < nums.size(); ++r) {
            sum += nums[r];
            while (sum >= target) {
                minLen = min(minLen, r - l + 1);
                sum -= nums[l++];
            }
        }
        return minLen == INT_MAX ? 0 : minLen;
    }
};
