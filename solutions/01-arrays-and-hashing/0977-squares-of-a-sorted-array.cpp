/**
 * Problem: 977. Squares of a Sorted Array
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Two Pointers
 * LeetCode Link: https://leetcode.com/problems/squares-of-a-sorted-array/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) extra space excluding output
 */

#include <vector>
#include <cmath>

using namespace std;

class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        int n = nums.size();
        vector<int> res(n);
        int l = 0, r = n - 1, idx = n - 1;
        while (l <= r) {
            int leftSq = nums[l] * nums[l];
            int rightSq = nums[r] * nums[r];
            if (leftSq > rightSq) {
                res[idx--] = leftSq;
                l++;
            } else {
                res[idx--] = rightSq;
                r--;
            }
        }
        return res;
    }
};
