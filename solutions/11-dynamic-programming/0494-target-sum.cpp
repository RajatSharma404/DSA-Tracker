/**
 * Problem: 494. Target Sum
 * Difficulty: Medium
 * Topic: Dynamic Programming (Subset Sum Reduction)
 * LeetCode Link: https://leetcode.com/problems/target-sum/
 * 
 * Complexity:
 * - Time: O(N * S) where S is (sum + target) / 2
 * - Space: O(S)
 */

#include <vector>
#include <numeric>
#include <cmath>

using namespace std;

class Solution {
public:
    int findTargetSumWays(vector<int>& nums, int target) {
        int sum = accumulate(nums.begin(), nums.end(), 0);
        if (abs(target) > sum || (sum + target) % 2 != 0) return 0;

        int s1 = (sum + target) / 2;
        vector<int> dp(s1 + 1, 0);
        dp[0] = 1;

        for (int num : nums) {
            for (int i = s1; i >= num; --i) {
                dp[i] += dp[i - num];
            }
        }

        return dp[s1];
    }
};
