/**
 * Problem: 120. Triangle
 * Difficulty: Medium
 * Topic: Dynamic Programming / Bottom-Up Grid DP
 * LeetCode Link: https://leetcode.com/problems/triangle/
 * 
 * Complexity:
 * - Time: O(n^2) where n is number of rows
 * - Space: O(n) auxiliary 1D DP array
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minimumTotal(vector<vector<int>>& triangle) {
        int n = triangle.size();
        vector<int> dp = triangle.back();

        for (int i = n - 2; i >= 0; i--) {
            for (int j = 0; j <= i; j++) {
                dp[j] = triangle[i][j] + min(dp[j], dp[j + 1]);
            }
        }

        return dp[0];
    }
};
