/**
 * Problem: 54. Spiral Matrix
 * Difficulty: Medium
 * Topic: Math & Geometry (Matrix Traversal)
 * LeetCode Link: https://leetcode.com/problems/spiral-matrix/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(1) auxiliary space
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        vector<int> result;
        if (matrix.empty()) return result;

        int top = 0, bottom = matrix.size() - 1;
        int left = 0, right = matrix[0].size() - 1;

        while (top <= bottom && left <= right) {
            // Traverse Right
            for (int col = left; col <= right; ++col) {
                result.push_back(matrix[top][col]);
            }
            top++;

            // Traverse Down
            for (int row = top; row <= bottom; ++row) {
                result.push_back(matrix[row][right]);
            }
            right--;

            // Traverse Left
            if (top <= bottom) {
                for (int col = right; col >= left; --col) {
                    result.push_back(matrix[bottom][col]);
                }
                bottom--;
            }

            // Traverse Up
            if (left <= right) {
                for (int row = bottom; row >= top; --row) {
                    result.push_back(matrix[row][left]);
                }
                left++;
            }
        }
        return result;
    }
};
