/**
 * Problem: 518. Coin Change II
 * Difficulty: Medium
 * Topic: Dynamic Programming (Unbounded Knapsack)
 * LeetCode Link: https://leetcode.com/problems/coin-change-ii/
 * 
 * Complexity:
 * - Time: O(N * amount)
 * - Space: O(amount)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int change(int amount, vector<int>& coins) {
        vector<unsigned long long> dp(amount + 1, 0);
        dp[0] = 1;

        for (int coin : coins) {
            for (int i = coin; i <= amount; ++i) {
                dp[i] += dp[i - coin];
            }
        }

        return dp[amount];
    }
};
