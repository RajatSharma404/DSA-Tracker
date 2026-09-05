/**
 * Problem: 1047. Remove All Adjacent Duplicates In String
 * Difficulty: Easy
 * Topic: Stack
 * LeetCode Link: https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <string>

using namespace std;

class Solution {
public:
    string removeDuplicates(string s) {
        string res = "";
        for (char c : s) {
            if (!res.empty() && res.back() == c) {
                res.pop_back();
            } else {
                res.push_back(c);
            }
        }
        return res;
    }
};
