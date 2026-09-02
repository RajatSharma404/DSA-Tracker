/**
 * Problem: 287. Find the Duplicate Number
 * Difficulty: Medium
 * Topic: Linked List (Floyd's Tortoise and Hare)
 * LeetCode Link: https://leetcode.com/problems/find-the-duplicate-number/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int slow = nums[0];
        int fast = nums[0];

        // 1. Detect cycle
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);

        // 2. Find entrance to the cycle
        slow = nums[0];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }

        return slow;
    }
};
