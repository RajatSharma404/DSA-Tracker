/**
 * Problem: 20. Valid Parentheses
 * Difficulty: Easy
 * Topic: Stack
 * LeetCode Link: https://leetcode.com/problems/valid-parentheses/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <string>
#include <stack>
#include <unordered_map>

using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        unordered_map<char, char> matching = {
            {')', '('},
            {']', '['},
            {'}', '{'}
        };
        for (char c : s) {
            if (matching.count(c)) {
                if (st.empty() || st.top() != matching[c]) return false;
                st.pop();
            } else {
                st.push(c);
            }
        }
        return st.empty();
    }
};
