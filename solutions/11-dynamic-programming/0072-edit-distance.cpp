/**
 * Problem: 72. Edit Distance
 * Difficulty: Medium
 * Topic: Dynamic Programming (Levenshtein Distance)
 * LeetCode Link: https://leetcode.com/problems/edit-distance/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(N) space optimized
 */

#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<int> dp(n + 1);

        for (int j = 0; j <= n; ++j) dp[j] = j;

        for (int i = 1; i <= m; ++i) {
            int prev = dp[0];
            dp[0] = i;
            for (int j = 1; j <= n; ++j) {
                int temp = dp[j];
                if (word1[i - 1] == word2[j - 1]) {
                    dp[j] = prev;
                } else {
                    dp[j] = 1 + min({prev, dp[j - 1], dp[j]});
                }
                prev = temp;
            }
        }

        return dp[n];
    }
};
