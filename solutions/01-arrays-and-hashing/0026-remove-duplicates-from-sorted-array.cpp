/**
 * Problem: 26. Remove Duplicates from Sorted Array
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Two Pointers
 * LeetCode Link: https://leetcode.com/problems/remove-duplicates-from-sorted-array/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.empty()) return 0;
        int k = 1;
        for (int i = 1; i < nums.size(); ++i) {
            if (nums[i] != nums[i - 1]) {
                nums[k++] = nums[i];
            }
        }
        return k;
    }
};
