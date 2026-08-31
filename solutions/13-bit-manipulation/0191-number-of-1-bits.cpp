/**
 * Problem: 191. Number of 1 Bits
 * Difficulty: Easy
 * Topic: Bit Manipulation (Brian Kernighan's Algorithm)
 * LeetCode Link: https://leetcode.com/problems/number-of-1-bits/
 * 
 * Complexity:
 * - Time: O(1) (at most 32 iterations)
 * - Space: O(1)
 */

#include <cstdint>

using namespace std;

class Solution {
public:
    int hammingWeight(uint32_t n) {
        int count = 0;
        while (n != 0) {
            n &= (n - 1);
            count++;
        }
        return count;
    }
};
