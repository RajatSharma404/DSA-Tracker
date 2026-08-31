/**
 * Problem: 136. Single Number
 * Difficulty: Easy
 * Topic: Bit Manipulation (XOR)
 * LeetCode Link: https://leetcode.com/problems/single-number/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int result = 0;
        for (int num : nums) {
            result ^= num;
        }
        return result;
    }
};
