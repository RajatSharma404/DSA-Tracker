/**
 * Problem: 371. Sum of Two Integers
 * Difficulty: Medium
 * Topic: Bit Manipulation (Half Adder Logic)
 * LeetCode Link: https://leetcode.com/problems/sum-of-two-integers/
 * 
 * Complexity:
 * - Time: O(1) (at most 32 bits)
 * - Space: O(1)
 */

class Solution {
public:
    int getSum(int a, int b) {
        while (b != 0) {
            unsigned int carry = (unsigned int)(a & b) << 1;
            a = a ^ b;
            b = carry;
        }
        return a;
    }
};
