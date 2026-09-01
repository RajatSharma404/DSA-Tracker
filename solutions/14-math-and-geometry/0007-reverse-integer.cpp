/**
 * Problem: 7. Reverse Integer
 * Difficulty: Medium
 * Topic: Math & Number Theory
 * LeetCode Link: https://leetcode.com/problems/reverse-integer/
 * 
 * Complexity:
 * - Time: O(log10(x))
 * - Space: O(1)
 */

#include <climits>

class Solution {
public:
    int reverse(int x) {
        int result = 0;
        while (x != 0) {
            int pop = x % 10;
            x /= 10;

            if (result > INT_MAX / 10 || (result == INT_MAX / 10 && pop > 7)) return 0;
            if (result < INT_MIN / 10 || (result == INT_MIN / 10 && pop < -8)) return 0;

            result = result * 10 + pop;
        }
        return result;
    }
};
