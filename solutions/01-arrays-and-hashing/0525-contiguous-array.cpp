/**
 * Problem: 525. Contiguous Array
 * Difficulty: Medium
 * Topic: Arrays & Hashing / Prefix Sum
 * LeetCode Link: https://leetcode.com/problems/contiguous-array/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

class Solution {
public:
    int findMaxLength(vector<int>& nums) {
        unordered_map<int, int> mp;
        mp[0] = -1;
        int sum = 0, maxLen = 0;
        for (int i = 0; i < nums.size(); ++i) {
            sum += (nums[i] == 1 ? 1 : -1);
            if (mp.count(sum)) {
                maxLen = max(maxLen, i - mp[sum]);
            } else {
                mp[sum] = i;
            }
        }
        return maxLen;
    }
};
