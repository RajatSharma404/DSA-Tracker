/**
 * Problem: 841. Keys and Rooms
 * Difficulty: Medium
 * Topic: Graphs / BFS
 * LeetCode Link: https://leetcode.com/problems/keys-and-rooms/
 *
 * Complexity:
 * - Time: O(n + e) where e is total keys
 * - Space: O(n)
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    bool canVisitAllRooms(vector<vector<int>>& rooms) {
        int n = rooms.size();
        vector<bool> visited(n, false);
        visited[0] = true;
        queue<int> q;
        q.push(0);
        int count = 1;
        
        while (!q.empty()) {
            int curr = q.front(); q.pop();
            for (int key : rooms[curr]) {
                if (!visited[key]) {
                    visited[key] = true;
                    q.push(key);
                    count++;
                }
            }
        }
        return count == n;
    }
};
