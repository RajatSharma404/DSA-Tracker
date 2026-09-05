/**
 * Problem: 724. Find Pivot Index
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Prefix Sum
 * LeetCode Link: https://leetcode.com/problems/find-pivot-index/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <numeric>

using namespace std;

class Solution {
public:
    int pivotIndex(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        int leftSum = 0;
        for (int i = 0; i < nums.size(); ++i) {
            if (leftSum == total - leftSum - nums[i]) return i;
            leftSum += nums[i];
        }
        return -1;
    }
};
