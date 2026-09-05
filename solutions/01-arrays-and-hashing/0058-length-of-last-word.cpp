/**
 * Problem: 58. Length of Last Word
 * Difficulty: Easy
 * Topic: Arrays & Hashing / String
 * LeetCode Link: https://leetcode.com/problems/length-of-last-word/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
public:
    int lengthOfLastWord(string s) {
        int i = s.size() - 1;
        while (i >= 0 && s[i] == ' ') i--;
        int len = 0;
        while (i >= 0 && s[i] != ' ') {
            len++;
            i--;
        }
        return len;
    }
};
