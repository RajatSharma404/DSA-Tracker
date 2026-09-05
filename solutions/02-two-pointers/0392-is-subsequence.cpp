/**
 * Problem: 392. Is Subsequence
 * Difficulty: Easy
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/is-subsequence/
 *
 * Complexity:
 * - Time: O(t) where t is length of target string
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
public:
    bool isSubsequence(string s, string t) {
        int i = 0, j = 0;
        while (i < s.size() && j < t.size()) {
            if (s[i] == t[j]) ++i;
            ++j;
        }
        return i == s.size();
    }
};
