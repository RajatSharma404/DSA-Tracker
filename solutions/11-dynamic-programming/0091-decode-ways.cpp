/**
 * Problem: 91. Decode Ways
 * Difficulty: Medium
 * Topic: Dynamic Programming (Fibonacci-Style Linear DP)
 * LeetCode Link: https://leetcode.com/problems/decode-ways/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
public:
    int numDecodings(string s) {
        if (s.empty() || s[0] == '0') return 0;

        int prev2 = 1, prev1 = 1;

        for (int i = 1; i < s.length(); ++i) {
            int current = 0;
            if (s[i] != '0') {
                current += prev1;
            }

            int twoDigit = stoi(s.substr(i - 1, 2));
            if (twoDigit >= 10 && twoDigit <= 26) {
                current += prev2;
            }

            prev2 = prev1;
            prev1 = current;
        }

        return prev1;
    }
};
