/**
 * Problem: 189. Rotate Array
 * Difficulty: Medium
 * Topic: Arrays & Hashing / In-Place Reversal
 * LeetCode Link: https://leetcode.com/problems/rotate-array/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
    }
};
