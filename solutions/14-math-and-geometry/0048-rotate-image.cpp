/**
 * Problem: 48. Rotate Image
 * Difficulty: Medium
 * Topic: Math & Geometry (Matrix Rotation)
 * LeetCode Link: https://leetcode.com/problems/rotate-image/
 * 
 * Complexity:
 * - Time: O(N^2)
 * - Space: O(1) in-place
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();

        // 1. Transpose the matrix
        for (int i = 0; i < n; ++i) {
            for (int j = i + 1; j < n; ++j) {
                swap(matrix[i][j], matrix[j][i]);
            }
        }

        // 2. Reverse each row
        for (int i = 0; i < n; ++i) {
            std::reverse(matrix[i].begin(), matrix[i].end());
        }
    }
};
