/**
 * Problem: 509. Fibonacci Number
 * Difficulty: Easy
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/fibonacci-number/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

class Solution {
public:
    int fib(int n) {
        if (n <= 1) return n;
        int a = 0, b = 1;
        for (int i = 2; i <= n; ++i) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};
