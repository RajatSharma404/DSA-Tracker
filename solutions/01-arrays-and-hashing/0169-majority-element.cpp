/**
 * Problem: 169. Majority Element
 * Difficulty: Easy
 * Topic: Arrays & Hashing (Boyer-Moore Voting Algorithm)
 * LeetCode Link: https://leetcode.com/problems/majority-element/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int candidate = nums[0], count = 0;
        for (int num : nums) {
            if (count == 0) candidate = num;
            count += (num == candidate) ? 1 : -1;
        }
        return candidate;
    }
};
