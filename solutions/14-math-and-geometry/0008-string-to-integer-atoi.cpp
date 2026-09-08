/**
 * Problem: 8. String to Integer (atoi)
 * Difficulty: Medium
 * Topic: Math & Geometry / String Parsing
 * LeetCode Link: https://leetcode.com/problems/string-to-integer-atoi/
 * 
 * Complexity:
 * - Time: O(n) single pass
 * - Space: O(1)
 */

#include <string>
#include <climits>

using namespace std;

class Solution {
public:
    int myAtoi(string s) {
        int i = 0;
        int n = s.length();

        // 1. Skip leading whitespaces
        while (i < n && s[i] == ' ') {
            i++;
        }
        if (i == n) return 0;

        // 2. Check sign
        int sign = 1;
        if (s[i] == '+' || s[i] == '-') {
            sign = (s[i] == '-') ? -1 : 1;
            i++;
        }

        // 3. Convert digits and clamp overflow
        long long result = 0;
        while (i < n && isdigit(s[i])) {
            int digit = s[i] - '0';

            // Check overflow before multiplying
            if (result > (INT_MAX - digit) / 10) {
                return (sign == 1) ? INT_MAX : INT_MIN;
            }

            result = result * 10 + digit;
            i++;
        }

        return sign * result;
    }
};
