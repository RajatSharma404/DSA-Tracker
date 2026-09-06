/**
 * Problem: 252. Meeting Rooms
 * Difficulty: Easy
 * Topic: Arrays & Intervals / Sorting
 * LeetCode Link: https://leetcode.com/problems/meeting-rooms/
 * 
 * Complexity:
 * - Time: O(n log n) for sorting
 * - Space: O(1) auxiliary
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    bool canAttendMeetings(vector<vector<int>>& intervals) {
        if (intervals.empty()) return true;

        sort(intervals.begin(), intervals.end());

        for (int i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] < intervals[i - 1][1]) {
                return false;
            }
        }

        return true;
    }
};
