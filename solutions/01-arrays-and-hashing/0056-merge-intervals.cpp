/**
 * Problem: 56. Merge Intervals
 * Difficulty: Medium
 * Topic: Arrays & Intervals / Sorting
 * LeetCode Link: https://leetcode.com/problems/merge-intervals/
 * 
 * Complexity:
 * - Time: O(n log n) due to sorting
 * - Space: O(n) for the output list
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if (intervals.empty()) return {};

        sort(intervals.begin(), intervals.end());

        vector<vector<int>> merged;
        merged.push_back(intervals[0]);

        for (int i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] <= merged.back()[1]) {
                merged.back()[1] = max(merged.back()[1], intervals[i][1]);
            } else {
                merged.push_back(intervals[i]);
            }
        }

        return merged;
    }
};
