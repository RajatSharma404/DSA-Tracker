/**
 * Problem: 1137. N-th Tribonacci Number
 * Difficulty: Easy
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/n-th-tribonacci-number/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

class Solution {
public:
    int tribonacci(int n) {
        if (n == 0) return 0;
        if (n <= 2) return 1;
        int t0 = 0, t1 = 1, t2 = 1;
        for (int i = 3; i <= n; ++i) {
            int t3 = t0 + t1 + t2;
            t0 = t1;
            t1 = t2;
            t2 = t3;
        }
        return t2;
    }
};
