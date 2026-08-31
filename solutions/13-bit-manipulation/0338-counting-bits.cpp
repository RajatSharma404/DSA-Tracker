/**
 * Problem: 338. Counting Bits
 * Difficulty: Easy
 * Topic: Bit Manipulation / DP
 * LeetCode Link: https://leetcode.com/problems/counting-bits/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) auxiliary
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<int> countBits(int n) {
        vector<int> dp(n + 1, 0);
        for (int i = 1; i <= n; ++i) {
            dp[i] = dp[i >> 1] + (i & 1);
        }
        return dp;
    }
};
