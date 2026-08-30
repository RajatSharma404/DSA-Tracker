/**
 * Problem: 207. Course Schedule
 * Difficulty: Medium
 * Topic: Graphs (Topological Sort / Cycle Detection)
 * LeetCode Link: https://leetcode.com/problems/course-schedule/
 * 
 * Complexity:
 * - Time: O(V + E)
 * - Space: O(V + E)
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> inDegree(numCourses, 0);

        for (const auto& pre : prerequisites) {
            adj[pre[1]].push_back(pre[0]);
            inDegree[pre[0]]++;
        }

        queue<int> q;
        for (int i = 0; i < numCourses; ++i) {
            if (inDegree[i] == 0) q.push(i);
        }

        int completed = 0;
        while (!q.empty()) {
            int course = q.front();
            q.pop();
            completed++;

            for (int neighbor : adj[course]) {
                if (--inDegree[neighbor] == 0) {
                    q.push(neighbor);
                }
            }
        }

        return completed == numCourses;
    }
};
