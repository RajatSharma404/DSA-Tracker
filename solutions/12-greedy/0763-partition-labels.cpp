/**
 * Problem: 763. Partition Labels
 * Difficulty: Medium
 * Topic: Greedy / Two Pointers
 * LeetCode Link: https://leetcode.com/problems/partition-labels/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) (26 characters)
 */

#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<int> partitionLabels(string s) {
        vector<int> lastIndex(26, 0);
        for (int i = 0; i < s.length(); ++i) {
            lastIndex[s[i] - 'a'] = i;
        }

        vector<int> result;
        int start = 0, end = 0;

        for (int i = 0; i < s.length(); ++i) {
            end = max(end, lastIndex[s[i] - 'a']);
            if (i == end) {
                result.push_back(end - start + 1);
                start = i + 1;
            }
        }
        return result;
    }
};
