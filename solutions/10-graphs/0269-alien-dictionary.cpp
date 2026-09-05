/**
 * Problem: 269. Alien Dictionary
 * Difficulty: Hard
 * Topic: Graphs (Topological Sort / Kahn's Algorithm)
 * LeetCode Link: https://leetcode.com/problems/alien-dictionary/
 * 
 * Complexity:
 * - Time: O(C) where C is total length of all words
 * - Space: O(1) (at most 26 unique characters)
 */

#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <algorithm>

using namespace std;

class Solution {
public:
    string alienOrder(vector<string>& words) {
        unordered_map<char, unordered_set<char>> adj;
        unordered_map<char, int> inDegree;

        for (const string& w : words) {
            for (char c : w) {
                inDegree[c] = 0;
            }
        }

        for (int i = 0; i < words.size() - 1; ++i) {
            string w1 = words[i], w2 = words[i + 1];
            if (w1.length() > w2.length() && w1.rfind(w2, 0) == 0) {
                return ""; // invalid prefix order
            }

            int minLen = min(w1.length(), w2.length());
            for (int j = 0; j < minLen; ++j) {
                if (w1[j] != w2[j]) {
                    if (!adj[w1[j]].count(w2[j])) {
                        adj[w1[j]].insert(w2[j]);
                        inDegree[w2[j]]++;
                    }
                    break;
                }
            }
        }

        queue<char> q;
        for (auto& [c, deg] : inDegree) {
            if (deg == 0) q.push(c);
        }

        string result = "";
        while (!q.empty()) {
            char c = q.front();
            q.pop();
            result += c;

            for (char neighbor : adj[c]) {
                if (--inDegree[neighbor] == 0) {
                    q.push(neighbor);
                }
            }
        }

        return result.length() == inDegree.size() ? result : "";
    }
};
