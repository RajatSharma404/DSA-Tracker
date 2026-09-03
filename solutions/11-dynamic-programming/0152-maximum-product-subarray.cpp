/**
 * Problem: 152. Maximum Product Subarray
 * Difficulty: Medium
 * Topic: Dynamic Programming (Min/Max Tracking)
 * LeetCode Link: https://leetcode.com/problems/maximum-product-subarray/
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
    int maxProduct(vector<int>& nums) {
        int res = *max_element(nums.begin(), nums.end());
        int curMin = 1, curMax = 1;

        for (int n : nums) {
            if (n == 0) {
                curMin = 1;
                curMax = 1;
                continue;
            }
            int temp = curMax * n;
            curMax = max({n * curMax, n * curMin, n});
            curMin = min({temp, n * curMin, n});

            res = max(res, curMax);
        }

        return res;
    }
};
