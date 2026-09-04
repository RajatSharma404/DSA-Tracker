/**
 * Problem: 309. Best Time to Buy and Sell Stock with Cooldown
 * Difficulty: Medium
 * Topic: Dynamic Programming (State Machine DP)
 * LeetCode Link: https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/
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
    int maxProfit(vector<int>& prices) {
        int sold = 0;
        int held = -1e9;
        int reset = 0;

        for (int price : prices) {
            int preSold = sold;
            sold = held + price;
            held = max(held, reset - price);
            reset = max(reset, preSold);
        }

        return max(sold, reset);
    }
};
