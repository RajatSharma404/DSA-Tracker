/**
 * Problem: 322. Coin Change
 * Difficulty: Medium
 * Topic: Dynamic Programming (Bottom-Up)
 * LeetCode Link: https://leetcode.com/problems/coin-change/
 * 
 * Complexity:
 * - Time: O(amount * coins.size())
 * - Space: O(amount)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;

        for (int a = 1; a <= amount; ++a) {
            for (int c : coins) {
                if (a - c >= 0) {
                    dp[a] = min(dp[a], 1 + dp[a - c]);
                }
            }
        }

        return dp[amount] > amount ? -1 : dp[amount];
    }
};
