/**
 * Problem: 714. Best Time to Buy and Sell Stock with Transaction Fee
 * Difficulty: Medium
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/
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
    int maxProfit(vector<int>& prices, int fee) {
        int hold = -prices[0];
        int cash = 0;

        for (int i = 1; i < prices.size(); ++i) {
            cash = max(cash, hold + prices[i] - fee);
            hold = max(hold, cash - prices[i]);
        }

        return cash;
    }
};
