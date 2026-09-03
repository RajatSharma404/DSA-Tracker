/**
 * Problem: 97. Interleaving String
 * Difficulty: Medium
 * Topic: Dynamic Programming (2D Grid / Space Optimized)
 * LeetCode Link: https://leetcode.com/problems/interleaving-string/
 * 
 * Complexity:
 * - Time: O(m * n)
 * - Space: O(n)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        if (s1.length() + s2.length() != s3.length()) return false;

        int m = s1.length(), n = s2.length();
        vector<bool> dp(n + 1, false);

        for (int i = 0; i <= m; ++i) {
            for (int j = 0; j <= n; ++j) {
                if (i == 0 && j == 0) {
                    dp[j] = true;
                } else if (i == 0) {
                    dp[j] = dp[j - 1] && (s2[j - 1] == s3[i + j - 1]);
                } else if (j == 0) {
                    dp[j] = dp[j] && (s1[i - 1] == s3[i + j - 1]);
                } else {
                    dp[j] = (dp[j] && s1[i - 1] == s3[i + j - 1]) ||
                            (dp[j - 1] && s2[j - 1] == s3[i + j - 1]);
                }
            }
        }

        return dp[n];
    }
};
