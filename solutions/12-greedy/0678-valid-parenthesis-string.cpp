/**
 * Problem: 678. Valid Parenthesis String
 * Difficulty: Medium
 * Topic: Greedy
 * LeetCode Link: https://leetcode.com/problems/valid-parenthesis-string/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
    bool checkValidString(string s) {
        int cmin = 0, cmax = 0; // min and max open parentheses count

        for (char c : s) {
            if (c == '(') {
                cmin++;
                cmax++;
            } else if (c == ')') {
                cmin = max(cmin - 1, 0);
                cmax--;
            } else { // '*'
                cmin = max(cmin - 1, 0);
                cmax++;
            }

            if (cmax < 0) return false;
        }
        return cmin == 0;
    }
};
