/**
 * Problem: 448. Find All Numbers Disappeared in an Array
 * Difficulty: Easy
 * Topic: Arrays & Hashing (In-place Sign Inversion)
 * LeetCode Link: https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) extra space
 */

#include <vector>
#include <cmath>

using namespace std;

class Solution {
public:
    vector<int> findDisappearedNumbers(vector<int>& nums) {
        for (int i = 0; i < nums.size(); ++i) {
            int idx = abs(nums[i]) - 1;
            if (nums[idx] > 0) nums[idx] = -nums[idx];
        }
        vector<int> res;
        for (int i = 0; i < nums.size(); ++i) {
            if (nums[i] > 0) res.push_back(i + 1);
        }
        return res;
    }
};
