/**
 * Problem: 162. Find Peak Element
 * Difficulty: Medium
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/find-peak-element/
 *
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int findPeakElement(vector<int>& nums) {
        int l = 0, r = nums.size() - 1;
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] > nums[mid + 1]) {
                r = mid;
            } else {
                l = mid + 1;
            }
        }
        return l;
    }
};
