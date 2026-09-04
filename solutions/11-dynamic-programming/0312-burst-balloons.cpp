/**
 * Problem: 312. Burst Balloons
 * Difficulty: Hard
 * Topic: Dynamic Programming (Interval / Matrix Chain Multiplication)
 * LeetCode Link: https://leetcode.com/problems/burst-balloons/
 * 
 * Complexity:
 * - Time: O(n^3)
 * - Space: O(n^2)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int maxCoins(vector<int>& nums) {
        vector<int> extended = {1};
        extended.insert(extended.end(), nums.begin(), nums.end());
        extended.push_back(1);

        int n = extended.size();
        vector<vector<int>> dp(n, vector<int>(n, 0));

        for (int len = 2; len < n; ++len) {
            for (int left = 0; left < n - len; ++left) {
                int right = left + len;
                for (int k = left + 1; k < right; ++k) {
                    int coins = extended[left] * extended[k] * extended[right] + dp[left][k] + dp[k][right];
                    dp[left][right] = max(dp[left][right], coins);
                }
            }
        }

        return dp[0][n - 1];
    }
};
