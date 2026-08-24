/**
 * Problem: 70. Climbing Stairs
 * Difficulty: Easy
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/climbing-stairs/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; ++i) {
            int current = prev1 + prev2;
            prev2 = prev1;
            prev1 = current;
        }
        return prev1;
    }
};
