/**
 * Problem: 3. Longest Substring Without Repeating Characters
 * Difficulty: Medium
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/longest-substring-without-repeating-characters/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(min(n, m))
 */

#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> lastIndex(128, -1);
        int maxLen = 0, start = 0;
        
        for (int end = 0; end < s.length(); ++end) {
            if (lastIndex[s[end]] >= start) {
                start = lastIndex[s[end]] + 1;
            }
            lastIndex[s[end]] = end;
            maxLen = max(maxLen, end - start + 1);
        }
        return maxLen;
    }
};
