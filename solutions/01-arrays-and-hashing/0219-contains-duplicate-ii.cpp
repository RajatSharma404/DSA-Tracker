/**
 * Problem: 219. Contains Duplicate II
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Hash Map
 * LeetCode Link: https://leetcode.com/problems/contains-duplicate-ii/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(min(n, k))
 */

#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    bool containsNearbyDuplicate(vector<int>& nums, int k) {
        unordered_map<int, int> pos;
        for (int i = 0; i < nums.size(); ++i) {
            if (pos.count(nums[i]) && i - pos[nums[i]] <= k) {
                return true;
            }
            pos[nums[i]] = i;
        }
        return false;
    }
};
