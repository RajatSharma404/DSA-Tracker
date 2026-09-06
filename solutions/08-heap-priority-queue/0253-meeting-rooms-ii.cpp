/**
 * Problem: 253. Meeting Rooms II
 * Difficulty: Medium
 * Topic: Heap / Priority Queue / Intervals
 * LeetCode Link: https://leetcode.com/problems/meeting-rooms-ii/
 * 
 * Complexity:
 * - Time: O(n log n) sorting + heap operations
 * - Space: O(n) min-heap size
 */

#include <vector>
#include <queue>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        if (intervals.empty()) return 0;

        sort(intervals.begin(), intervals.end());

        priority_queue<int, vector<int>, greater<int>> minHeap;
        minHeap.push(intervals[0][1]);

        for (int i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] >= minHeap.top()) {
                minHeap.pop();
            }
            minHeap.push(intervals[i][1]);
        }

        return minHeap.size();
    }
};
