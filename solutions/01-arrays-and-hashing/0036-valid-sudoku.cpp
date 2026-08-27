/**
 * Problem: 36. Valid Sudoku
 * Difficulty: Medium
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/valid-sudoku/
 * 
 * Complexity:
 * - Time: O(1) (fixed 9x9 board)
 * - Space: O(1)
 */

#include <vector>
#include <unordered_set>
#include <string>

using namespace std;

class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        unordered_set<string> seen;
        
        for (int i = 0; i < 9; ++i) {
            for (int j = 0; j < 9; ++j) {
                char c = board[i][j];
                if (c != '.') {
                    string row = string(1, c) + " in row " + to_string(i);
                    string col = string(1, c) + " in col " + to_string(j);
                    string box = string(1, c) + " in box " + to_string(i / 3) + "-" + to_string(j / 3);
                    
                    if (seen.count(row) || seen.count(col) || seen.count(box)) {
                        return false;
                    }
                    
                    seen.insert(row);
                    seen.insert(col);
                    seen.insert(box);
                }
            }
        }
        return true;
    }
};
