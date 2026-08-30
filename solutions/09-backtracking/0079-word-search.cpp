/**
 * Problem: 79. Word Search
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/word-search/
 * 
 * Complexity:
 * - Time: O(M * N * 4^L) where L is length of word
 * - Space: O(L) recursion stack
 */

#include <vector>
#include <string>

using namespace std;

class Solution {
private:
    bool dfs(vector<vector<char>>& board, const string& word, int index, int r, int c) {
        if (index == word.length()) return true;
        if (r < 0 || c < 0 || r >= board.size() || c >= board[0].size() || board[r][c] != word[index]) {
            return false;
        }

        char temp = board[r][c];
        board[r][c] = '#'; // mark visited

        bool found = dfs(board, word, index + 1, r + 1, c) ||
                     dfs(board, word, index + 1, r - 1, c) ||
                     dfs(board, word, index + 1, r, c + 1) ||
                     dfs(board, word, index + 1, r, c - 1);

        board[r][c] = temp; // backtrack
        return found;
    }

public:
    bool exist(vector<vector<char>>& board, string word) {
        for (int r = 0; r < board.size(); ++r) {
            for (int c = 0; c < board[0].size(); ++c) {
                if (board[r][c] == word[0] && dfs(board, word, 0, r, c)) {
                    return true;
                }
            }
        }
        return false;
    }
};
