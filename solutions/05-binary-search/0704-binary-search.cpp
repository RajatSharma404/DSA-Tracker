/**
 * Problem: 704. Binary Search
 * Difficulty: Easy
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/binary-search/
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
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};
