/**
 * Problem: 560. Subarray Sum Equals K
 * Difficulty: Medium
 * Topic: Arrays & Hashing / Prefix Sum Hash Map
 * LeetCode Link: https://leetcode.com/problems/subarray-sum-equals-k/
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
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> prefixCounts;
        prefixCounts[0] = 1;
        int sum = 0, count = 0;
        for (int num : nums) {
            sum += num;
            if (prefixCounts.count(sum - k)) {
                count += prefixCounts[sum - k];
            }
            prefixCounts[sum]++;
        }
        return count;
    }
};
