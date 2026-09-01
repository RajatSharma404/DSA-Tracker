/**
 * Problem: 50. Pow(x, n)
 * Difficulty: Medium
 * Topic: Math & Number Theory (Binary Exponentiation)
 * LeetCode Link: https://leetcode.com/problems/powx-n/
 * 
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

class Solution {
public:
    double myPow(double x, int n) {
        long long N = n;
        if (N < 0) {
            x = 1 / x;
            N = -N;
        }

        double result = 1.0;
        double currentProduct = x;

        while (N > 0) {
            if (N % 2 == 1) {
                result *= currentProduct;
            }
            currentProduct *= currentProduct;
            N /= 2;
        }

        return result;
    }
};
