/**
 * Problem: 973. K Closest Points to Origin
 * Difficulty: Medium
 * Topic: Heap / Priority Queue (Max-Heap)
 * LeetCode Link: https://leetcode.com/problems/k-closest-points-to-origin/
 * 
 * Complexity:
 * - Time: O(n log k)
 * - Space: O(k)
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        // Max-heap storing pair<distanceSquared, index>
        priority_queue<pair<int, int>> maxHeap;

        for (int i = 0; i < points.size(); ++i) {
            int distSq = points[i][0] * points[i][0] + points[i][1] * points[i][1];
            maxHeap.push({distSq, i});
            if (maxHeap.size() > k) {
                maxHeap.pop();
            }
        }

        vector<vector<int>> result;
        while (!maxHeap.empty()) {
            result.push_back(points[maxHeap.top().second]);
            maxHeap.pop();
        }

        return result;
    }
};
