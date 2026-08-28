/**
 * Problem: 5. Longest Palindromic Substring
 * Difficulty: Medium
 * Topic: Dynamic Programming / Expand Around Center
 * LeetCode Link: https://leetcode.com/problems/longest-palindromic-substring/
 * 
 * Complexity:
 * - Time: O(n^2)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
private:
    int expandAroundCenter(const string& s, int left, int right) {
        while (left >= 0 && right < s.length() && s[left] == s[right]) {
            left--;
            right++;
        }
        return right - left - 1;
    }

public:
    string longestPalindrome(string s) {
        if (s.empty()) return "";
        int start = 0, maxLen = 0;

        for (int i = 0; i < s.length(); ++i) {
            int len1 = expandAroundCenter(s, i, i);
            int len2 = expandAroundCenter(s, i, i + 1);
            int len = max(len1, len2);

            if (len > maxLen) {
                maxLen = len;
                start = i - (len - 1) / 2;
            }
        }
        return s.substr(start, maxLen);
    }
};
