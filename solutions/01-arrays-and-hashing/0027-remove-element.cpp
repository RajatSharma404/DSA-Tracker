/**
 * Problem: 27. Remove Element
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Two Pointers
 * LeetCode Link: https://leetcode.com/problems/remove-element/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int removeElement(vector<int>& nums, int val) {
        int k = 0;
        for (int i = 0; i < nums.size(); ++i) {
            if (nums[i] != val) {
                nums[k++] = nums[i];
            }
        }
        return k;
    }
};
