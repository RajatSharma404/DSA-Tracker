/**
 * Problem: 289. Game of Life
 * Difficulty: Medium
 * Topic: Math & Geometry / In-Place State Transitions
 * LeetCode Link: https://leetcode.com/problems/game-of-life/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(1) auxiliary space (using bit/state encoding)
 */

#include <vector>
#include <cstdlib>

using namespace std;

class Solution {
public:
    void gameOfLife(vector<vector<int>>& board) {
        int m = board.size();
        int n = board[0].size();

        // State encoding:
        // 0: dead -> dead (0)
        // 1: live -> live (1)
        // 2: live -> dead (was 1, becomes 0)
        // 3: dead -> live (was 0, becomes 1)

        int dirs[8][2] = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};

        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                int liveNeighbors = 0;
                for (auto& d : dirs) {
                    int nr = r + d[0];
                    int nc = c + d[1];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
                        if (board[nr][nc] == 1 || board[nr][nc] == 2) {
                            liveNeighbors++;
                        }
                    }
                }

                if (board[r][c] == 1) {
                    if (liveNeighbors < 2 || liveNeighbors > 3) {
                        board[r][c] = 2; // live -> dead
                    }
                } else {
                    if (liveNeighbors == 3) {
                        board[r][c] = 3; // dead -> live
                    }
                }
            }
        }

        // Final state update
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                if (board[r][c] == 2) board[r][c] = 0;
                else if (board[r][c] == 3) board[r][c] = 1;
            }
        }
    }
};
