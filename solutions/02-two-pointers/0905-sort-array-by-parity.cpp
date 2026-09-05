/**
 * Problem: 905. Sort Array By Parity
 * Difficulty: Easy
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/sort-array-by-parity/
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
    vector<int> sortArrayByParity(vector<int>& nums) {
        int l = 0, r = nums.size() - 1;
        while (l < r) {
            if (nums[l] % 2 > nums[r] % 2) {
                swap(nums[l], nums[r]);
            }
            if (nums[l] % 2 == 0) l++;
            if (nums[r] % 2 == 1) r--;
        }
        return nums;
    }
};
