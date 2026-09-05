/**
 * Problem: 997. Find the Town Judge
 * Difficulty: Easy
 * Topic: Graphs / Degree Counting
 * LeetCode Link: https://leetcode.com/problems/find-the-town-judge/
 *
 * Complexity:
 * - Time: O(n + t) where t is trust array size
 * - Space: O(n)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int findJudge(int n, vector<vector<int>>& trust) {
        vector<int> balance(n + 1, 0);
        for (const auto& t : trust) {
            balance[t[0]]--;
            balance[t[1]]++;
        }
        for (int i = 1; i <= n; ++i) {
            if (balance[i] == n - 1) return i;
        }
        return -1;
    }
};
