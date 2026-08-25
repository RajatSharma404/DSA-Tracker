/**
 * Problem: 33. Search in Rotated Sorted Array
 * Difficulty: Medium
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/search-in-rotated-sorted-array/
 * 
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            
            if (nums[left] <= nums[mid]) {
                if (target >= nums[left] && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (target > nums[mid] && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
};
