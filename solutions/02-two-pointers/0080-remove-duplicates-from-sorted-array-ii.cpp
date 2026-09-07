/**
 * Problem: 80. Remove Duplicates from Sorted Array II
 * Difficulty: Medium
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) in-place
 */

#include <vector>

using namespace std;

class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.size() <= 2) return nums.size();

        int k = 2;
        for (size_t i = 2; i < nums.size(); i++) {
            if (nums[i] != nums[k - 2]) {
                nums[k++] = nums[i];
            }
        }

        return k;
    }
};
