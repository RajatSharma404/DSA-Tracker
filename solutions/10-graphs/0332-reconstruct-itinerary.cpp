/**
 * Problem: 332. Reconstruct Itinerary
 * Difficulty: Hard
 * Topic: Graphs / Hierholzer's Algorithm (Eulerian Path)
 * LeetCode Link: https://leetcode.com/problems/reconstruct-itinerary/
 * 
 * Complexity:
 * - Time: O(E log E) due to priority queue ordering of destinations
 * - Space: O(V + E) for adjacency list and recursion stack
 */

#include <vector>
#include <string>
#include <unordered_map>
#include <queue>
#include <algorithm>
#include <functional>

using namespace std;

class Solution {
public:
    vector<string> findItinerary(vector<vector<string>>& tickets) {
        unordered_map<string, priority_queue<string, vector<string>, greater<string>>> adj;
        for (const auto& ticket : tickets) {
            adj[ticket[0]].push(ticket[1]);
        }

        vector<string> route;
        function<void(const string&)> dfs = [&](const string& airport) {
            while (!adj[airport].empty()) {
                string next = adj[airport].top();
                adj[airport].pop();
                dfs(next);
            }
            route.push_back(airport);
        };

        dfs("JFK");
        reverse(route.begin(), route.end());
        return route;
    }
};
