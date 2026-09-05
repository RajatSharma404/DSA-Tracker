/**
 * Problem: 28. Find the Index of the First Occurrence in a String
 * Difficulty: Easy
 * Topic: Two Pointers / String Matching
 * LeetCode Link: https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/
 *
 * Complexity:
 * - Time: O((N - M + 1) * M)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
public:
    int strStr(string haystack, string needle) {
        int n = haystack.size(), m = needle.size();
        if (m == 0) return 0;
        for (int i = 0; i <= n - m; ++i) {
            int j = 0;
            while (j < m && haystack[i + j] == needle[j]) ++j;
            if (j == m) return i;
        }
        return -1;
    }
};
