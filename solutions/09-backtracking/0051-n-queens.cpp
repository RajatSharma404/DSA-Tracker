/**
 * Problem: 51. N-Queens
 * Difficulty: Hard
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/n-queens/
 * 
 * Complexity:
 * - Time: O(N!)
 * - Space: O(N) hash sets + board
 */

#include <vector>
#include <string>
#include <unordered_set>

using namespace std;

class Solution {
private:
    unordered_set<int> cols;
    unordered_set<int> posDiag; // r + c
    unordered_set<int> negDiag; // r - c

    void backtrack(int r, int n, vector<string>& board, vector<vector<string>>& result) {
        if (r == n) {
            result.push_back(board);
            return;
        }

        for (int c = 0; c < n; ++c) {
            if (cols.count(c) || posDiag.count(r + c) || negDiag.count(r - c)) {
                continue;
            }

            cols.insert(c);
            posDiag.insert(r + c);
            negDiag.insert(r - c);
            board[r][c] = 'Q';

            backtrack(r + 1, n, board, result);

            cols.erase(c);
            posDiag.erase(r + c);
            negDiag.erase(r - c);
            board[r][c] = '.';
        }
    }

public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> result;
        vector<string> board(n, string(n, '.'));
        backtrack(0, n, board, result);
        return result;
    }
};
