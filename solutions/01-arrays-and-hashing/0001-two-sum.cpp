/**
 * Problem: 1. Two Sum
 * Difficulty: Easy
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/two-sum/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};
