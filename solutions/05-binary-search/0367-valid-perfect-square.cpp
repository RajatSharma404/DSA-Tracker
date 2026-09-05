/**
 * Problem: 367. Valid Perfect Square
 * Difficulty: Easy
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/valid-perfect-square/
 *
 * Complexity:
 * - Time: O(log num)
 * - Space: O(1)
 */

class Solution {
public:
    bool isPerfectSquare(int num) {
        if (num < 1) return false;
        long long l = 1, r = num;
        while (l <= r) {
            long long mid = l + (r - l) / 2;
            long long sq = mid * mid;
            if (sq == num) return true;
            else if (sq < num) l = mid + 1;
            else r = mid - 1;
        }
        return false;
    }
};
