/**
 * Problem: 416. Partition Equal Subset Sum
 * Difficulty: Medium
 * Topic: Dynamic Programming (0/1 Knapsack)
 * LeetCode Link: https://leetcode.com/problems/partition-equal-subset-sum/
 * 
 * Complexity:
 * - Time: O(n * target)
 * - Space: O(target)
 */

#include <vector>
#include <numeric>
#include <unordered_set>

using namespace std;

class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int sum = accumulate(nums.begin(), nums.end(), 0);
        if (sum % 2 != 0) return false;

        int target = sum / 2;
        vector<bool> dp(target + 1, false);
        dp[0] = true;

        for (int num : nums) {
            for (int i = target; i >= num; --i) {
                dp[i] = dp[i] || dp[i - num];
            }
        }

        return dp[target];
    }
};
