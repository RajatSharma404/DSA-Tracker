/**
 * Problem: 134. Gas Station
 * Difficulty: Medium
 * Topic: Greedy
 * LeetCode Link: https://leetcode.com/problems/gas-station/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <numeric>

using namespace std;

class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
        int totalGas = 0, totalCost = 0;
        for (int i = 0; i < gas.size(); ++i) {
            totalGas += gas[i];
            totalCost += cost[i];
        }
        if (totalGas < totalCost) return -1;

        int startIndex = 0;
        int currentTank = 0;

        for (int i = 0; i < gas.size(); ++i) {
            currentTank += gas[i] - cost[i];
            if (currentTank < 0) {
                startIndex = i + 1;
                currentTank = 0;
            }
        }
        return startIndex;
    }
};
