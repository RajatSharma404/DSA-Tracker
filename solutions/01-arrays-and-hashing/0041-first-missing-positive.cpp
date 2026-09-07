/**
 * Problem: 41. First Missing Positive
 * Difficulty: Hard
 * Topic: Arrays & Hashing / Cyclic Sort
 * LeetCode Link: https://leetcode.com/problems/first-missing-positive/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) auxiliary space
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();

        // Place each number at its corresponding index if 1 <= nums[i] <= n
        for (int i = 0; i < n; i++) {
            while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                swap(nums[i], nums[nums[i] - 1]);
            }
        }

        // Find the first index missing its correct number
        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1) {
                return i + 1;
            }
        }

        return n + 1;
    }
};
