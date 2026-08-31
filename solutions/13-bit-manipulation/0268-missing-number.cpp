/**
 * Problem: 268. Missing Number
 * Difficulty: Easy
 * Topic: Bit Manipulation (XOR)
 * LeetCode Link: https://leetcode.com/problems/missing-number/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int n = nums.size();
        int missing = n;
        for (int i = 0; i < n; ++i) {
            missing ^= i ^ nums[i];
        }
        return missing;
    }
};
