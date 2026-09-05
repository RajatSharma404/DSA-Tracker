/**
 * Problem: 76. Minimum Window Substring
 * Difficulty: Hard
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/minimum-window-substring/
 * 
 * Complexity:
 * - Time: O(m + n)
 * - Space: O(k) where k is size of alphabet
 */

#include <string>
#include <vector>
#include <climits>

using namespace std;

class Solution {
public:
    string minWindow(string s, string t) {
        if (s.empty() || t.empty()) return "";

        vector<int> targetCount(128, 0);
        for (char c : t) targetCount[c]++;

        int required = 0;
        for (int c : targetCount) if (c > 0) required++;

        int left = 0, right = 0, formed = 0;
        vector<int> windowCount(128, 0);

        int minLen = INT_MAX, startIdx = 0;

        while (right < s.length()) {
            char c = s[right];
            windowCount[c]++;

            if (targetCount[c] > 0 && windowCount[c] == targetCount[c]) {
                formed++;
            }

            while (left <= right && formed == required) {
                c = s[left];

                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    startIdx = left;
                }

                windowCount[c]--;
                if (targetCount[c] > 0 && windowCount[c] < targetCount[c]) {
                    formed--;
                }
                left++;
            }
            right++;
        }

        return minLen == INT_MAX ? "" : s.substr(startIdx, minLen);
    }
};
