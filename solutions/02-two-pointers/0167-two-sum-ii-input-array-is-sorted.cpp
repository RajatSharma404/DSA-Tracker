/**
 * Problem: 167. Two Sum II - Input Array Is Sorted
 * Difficulty: Medium
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int left = 0, right = numbers.size() - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) {
                return {left + 1, right + 1};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return {};
    }
};
