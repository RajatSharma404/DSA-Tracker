/**
 * Problem: 22. Generate Parentheses
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/generate-parentheses/
 * 
 * Complexity:
 * - Time: O(4^n / sqrt(n)) bounded by n-th Catalan number
 * - Space: O(n) recursion stack
 */

#include <vector>
#include <string>

using namespace std;

class Solution {
private:
    void backtrack(int openCount, int closeCount, int n, string& current, vector<string>& result) {
        if (current.length() == 2 * n) {
            result.push_back(current);
            return;
        }

        if (openCount < n) {
            current.push_back('(');
            backtrack(openCount + 1, closeCount, n, current, result);
            current.pop_back();
        }

        if (closeCount < openCount) {
            current.push_back(')');
            backtrack(openCount, closeCount + 1, n, current, result);
            current.pop_back();
        }
    }

public:
    vector<string> generateParenthesis(int n) {
        vector<string> result;
        string current = "";
        backtrack(0, 0, n, current, result);
        return result;
    }
};
