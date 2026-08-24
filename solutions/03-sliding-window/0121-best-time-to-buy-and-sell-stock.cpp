/**
 * Problem: 121. Best Time to Buy and Sell Stock
 * Difficulty: Easy
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/best-time-to-buy-and-sell-stock/
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
        int minPrice = 1e9;
        int maxProfit = 0;
        for (int price : prices) {
            minPrice = min(minPrice, price);
            maxProfit = max(maxProfit, price - minPrice);
        }
        return maxProfit;
    }
};
