/**
 * Problem: 455. Assign Cookies
 * Difficulty: Easy
 * Topic: Greedy
 * LeetCode Link: https://leetcode.com/problems/assign-cookies/
 *
 * Complexity:
 * - Time: O(n log n + m log m)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int findContentChildren(vector<int>& g, vector<int>& s) {
        sort(g.begin(), g.end());
        sort(s.begin(), s.end());
        int child = 0, cookie = 0;
        while (child < g.size() && cookie < s.size()) {
            if (s[cookie] >= g[child]) {
                child++;
            }
            cookie++;
        }
        return child;
    }
};
