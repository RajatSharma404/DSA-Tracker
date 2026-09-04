/**
 * Problem: 37. Sudoku Solver
 * Difficulty: Hard
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/sudoku-solver/
 * 
 * Complexity:
 * - Time: O(9^E) where E is number of empty cells
 * - Space: O(1) in-place board state
 */

#include <vector>

using namespace std;

class Solution {
private:
    bool isValid(vector<vector<char>>& board, int row, int col, char c) {
        for (int i = 0; i < 9; ++i) {
            if (board[row][i] == c) return false;
            if (board[i][col] == c) return false;
            if (board[3 * (row / 3) + i / 3][3 * (col / 3) + i % 3] == c) return false;
        }
        return true;
    }

    bool solve(vector<vector<char>>& board) {
        for (int r = 0; r < 9; ++r) {
            for (int c = 0; c < 9; ++c) {
                if (board[r][c] == '.') {
                    for (char ch = '1'; ch <= '9'; ++ch) {
                        if (isValid(board, r, c, ch)) {
                            board[r][c] = ch;
                            if (solve(board)) return true;
                            board[r][c] = '.';
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

public:
    void solveSudoku(vector<vector<char>>& board) {
        solve(board);
    }
};
