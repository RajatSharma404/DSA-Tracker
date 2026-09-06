/**
 * Problem: 787. Cheapest Flights Within K Stops
 * Difficulty: Medium
 * Topic: Graphs / Bellman-Ford (BFS with Step Bound)
 * LeetCode Link: https://leetcode.com/problems/cheapest-flights-within-k-stops/
 * 
 * Complexity:
 * - Time: O(K * E)
 * - Space: O(V)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        const int INF = 1e9;
        vector<int> prices(n, INF);
        prices[src] = 0;

        for (int i = 0; i <= k; i++) {
            vector<int> tempPrices = prices;
            for (const auto& flight : flights) {
                int u = flight[0];
                int v = flight[1];
                int w = flight[2];

                if (prices[u] != INF && prices[u] + w < tempPrices[v]) {
                    tempPrices[v] = prices[u] + w;
                }
            }
            prices = tempPrices;
        }

        return prices[dst] == INF ? -1 : prices[dst];
    }
};
