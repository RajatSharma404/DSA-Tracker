/**
 * Problem: 55. Jump Game
 * Difficulty: Medium
 * Topic: Greedy
 * LeetCode Link: https://leetcode.com/problems/jump-game/
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
    bool canJump(vector<int>& nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.size(); ++i) {
            if (i > maxReach) return false;
            maxReach = max(maxReach, i + nums[i]);
        }
        return true;
    }
};
