/**
 * Problem: 139. Word Break
 * Difficulty: Medium
 * Topic: Dynamic Programming (Bottom-Up)
 * LeetCode Link: https://leetcode.com/problems/word-break/
 * 
 * Complexity:
 * - Time: O(n * m * k) where n is s.length(), m is wordDict.size(), k is word length
 * - Space: O(n)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        vector<bool> dp(s.length() + 1, false);
        dp[s.length()] = true; // base case

        for (int i = s.length() - 1; i >= 0; --i) {
            for (const string& w : wordDict) {
                if (i + w.length() <= s.length() && s.substr(i, w.length()) == w) {
                    dp[i] = dp[i + w.length()];
                }
                if (dp[i]) break;
            }
        }

        return dp[0];
    }
};
