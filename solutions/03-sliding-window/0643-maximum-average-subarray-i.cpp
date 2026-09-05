/**
 * Problem: 643. Maximum Average Subarray I
 * Difficulty: Easy
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/maximum-average-subarray-i/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        double sum = 0;
        for (int i = 0; i < k; ++i) sum += nums[i];
        double maxSum = sum;
        for (int i = k; i < nums.size(); ++i) {
            sum += nums[i] - nums[i - k];
            maxSum = max(maxSum, sum);
        }
        return maxSum / k;
    }
};
