/**
 * Problem: 88. Merge Sorted Array
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Two Pointers
 * LeetCode Link: https://leetcode.com/problems/merge-sorted-array/
 *
 * Complexity:
 * - Time: O(m + n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        int p1 = m - 1, p2 = n - 1, p = m + n - 1;
        while (p1 >= 0 && p2 >= 0) {
            if (nums1[p1] > nums2[p2]) {
                nums1[p--] = nums1[p1--];
            } else {
                nums1[p--] = nums2[p2--];
            }
        }
        while (p2 >= 0) {
            nums1[p--] = nums2[p2--];
        }
    }
};
