/**
 * Problem: 190. Reverse Bits
 * Difficulty: Easy
 * Topic: Bit Manipulation
 * LeetCode Link: https://leetcode.com/problems/reverse-bits/
 * 
 * Complexity:
 * - Time: O(1) (32 bits)
 * - Space: O(1)
 */

#include <cstdint>

using namespace std;

class Solution {
public:
    uint32_t reverseBits(uint32_t n) {
        uint32_t result = 0;
        for (int i = 0; i < 32; ++i) {
            result = (result << 1) | (n & 1);
            n >>= 1;
        }
        return result;
    }
};
