/**
 * Problem: 73. Set Matrix Zeroes
 * Difficulty: Medium
 * Topic: Math & Geometry (In-Place Array Markers)
 * LeetCode Link: https://leetcode.com/problems/set-matrix-zeroes/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(1) in-place
 */

#include <vector>

using namespace std;

class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        bool firstRowZero = false, firstColZero = false;

        for (int i = 0; i < m; ++i) {
            if (matrix[i][0] == 0) firstColZero = true;
        }
        for (int j = 0; j < n; ++j) {
            if (matrix[0][j] == 0) firstRowZero = true;
        }

        for (int i = 1; i < m; ++i) {
            for (int j = 1; j < n; ++j) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }

        for (int i = 1; i < m; ++i) {
            for (int j = 1; j < n; ++j) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                    matrix[i][j] = 0;
                }
            }
        }

        if (firstColZero) {
            for (int i = 0; i < m; ++i) matrix[i][0] = 0;
        }
        if (firstRowZero) {
            for (int j = 0; j < n; ++j) matrix[0][j] = 0;
        }
    }
};
