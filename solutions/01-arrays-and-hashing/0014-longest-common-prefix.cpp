/**
 * Problem: 14. Longest Common Prefix
 * Difficulty: Easy
 * Topic: Arrays & Hashing / String
 * LeetCode Link: https://leetcode.com/problems/longest-common-prefix/
 *
 * Complexity:
 * - Time: O(S) where S is the sum of all characters in all strings
 * - Space: O(1)
 */

#include <vector>
#include <string>

using namespace std;

class Solution {
public:
    string longestCommonPrefix(vector<string>& strs) {
        if (strs.empty()) return "";
        for (int i = 0; i < strs[0].size(); ++i) {
            char c = strs[0][i];
            for (int j = 1; j < strs.size(); ++j) {
                if (i >= strs[j].size() || strs[j][i] != c) {
                    return strs[0].substr(0, i);
                }
            }
        }
        return strs[0];
    }
};
