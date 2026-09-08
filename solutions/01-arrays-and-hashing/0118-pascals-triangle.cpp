/**
 * Problem: 118. Pascal's Triangle
 * Difficulty: Easy
 * Topic: Arrays & Dynamic Programming / Pascal's Triangle
 * LeetCode Link: https://leetcode.com/problems/pascals-triangle/
 * 
 * Complexity:
 * - Time: O(numRows^2)
 * - Space: O(numRows^2) for output grid
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<vector<int>> generate(int numRows) {
        vector<vector<int>> triangle;

        for (int i = 0; i < numRows; i++) {
            vector<int> row(i + 1, 1);
            for (int j = 1; j < i; j++) {
                row[j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
            }
            triangle.push_back(row);
        }

        return triangle;
    }
};
