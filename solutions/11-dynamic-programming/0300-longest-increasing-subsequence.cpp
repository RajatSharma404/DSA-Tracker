/**
 * Problem: 300. Longest Increasing Subsequence
 * Difficulty: Medium
 * Topic: Dynamic Programming / Patience Sorting (Binary Search)
 * LeetCode Link: https://leetcode.com/problems/longest-increasing-subsequence/
 * 
 * Complexity:
 * - Time: O(n log n)
 * - Space: O(n)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;
        for (int x : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) {
                tails.push_back(x);
            } else {
                *it = x;
            }
        }
        return tails.size();
    }
};
