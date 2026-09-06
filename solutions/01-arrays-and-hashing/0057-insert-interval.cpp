/**
 * Problem: 57. Insert Interval
 * Difficulty: Medium
 * Topic: Arrays & Intervals
 * LeetCode Link: https://leetcode.com/problems/insert-interval/
 * 
 * Complexity:
 * - Time: O(n) linear scan
 * - Space: O(n) for result array
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> result;
        int i = 0;
        int n = intervals.size();

        // 1. Add all intervals ending before newInterval starts
        while (i < n && intervals[i][1] < newInterval[0]) {
            result.push_back(intervals[i]);
            i++;
        }

        // 2. Merge all overlapping intervals with newInterval
        while (i < n && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = min(newInterval[0], intervals[i][0]);
            newInterval[1] = max(newInterval[1], intervals[i][1]);
            i++;
        }
        result.push_back(newInterval);

        // 3. Add all remaining intervals starting after newInterval ends
        while (i < n) {
            result.push_back(intervals[i]);
            i++;
        }

        return result;
    }
};
