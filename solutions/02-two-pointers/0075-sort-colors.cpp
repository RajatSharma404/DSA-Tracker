/**
 * Problem: 75. Sort Colors
 * Difficulty: Medium
 * Topic: Two Pointers / Dutch National Flag
 * LeetCode Link: https://leetcode.com/problems/sort-colors/
 * 
 * Complexity:
 * - Time: O(n) single pass
 * - Space: O(1) in-place
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    void sortColors(vector<int>& nums) {
        int low = 0;
        int mid = 0;
        int high = nums.size() - 1;

        while (mid <= high) {
            if (nums[mid] == 0) {
                swap(nums[low], nums[mid]);
                low++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                swap(nums[mid], nums[high]);
                high--;
            }
        }
    }
};
