/**
 * Problem: 583. Delete Operation for Two Strings
 * Difficulty: Medium
 * Topic: Dynamic Programming (LCS Reduction)
 * LeetCode Link: https://leetcode.com/problems/delete-operation-for-two-strings/
 * 
 * Complexity:
 * - Time: O(m * n)
 * - Space: O(n) space optimized
 */

#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<int> dp(n + 1, 0);

        for (int i = 1; i <= m; ++i) {
            int prev = 0;
            for (int j = 1; j <= n; ++j) {
                int temp = dp[j];
                if (word1[i - 1] == word2[j - 1]) {
                    dp[j] = 1 + prev;
                } else {
                    dp[j] = max(dp[j], dp[j - 1]);
                }
                prev = temp;
            }
        }

        int lcs = dp[n];
        return (m - lcs) + (n - lcs);
    }
};
