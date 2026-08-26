/**
 * Problem: 128. Longest Consecutive Sequence
 * Difficulty: Medium
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/longest-consecutive-sequence/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <unordered_set>
#include <algorithm>

using namespace std;

class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> numSet(nums.begin(), nums.end());
        int longestStreak = 0;
        
        for (int num : numSet) {
            // Check if it's the start of a sequence
            if (!numSet.count(num - 1)) {
                int currentNum = num;
                int currentStreak = 1;
                
                while (numSet.count(currentNum + 1)) {
                    currentNum++;
                    currentStreak++;
                }
                longestStreak = max(longestStreak, currentStreak);
            }
        }
        return longestStreak;
    }
};
