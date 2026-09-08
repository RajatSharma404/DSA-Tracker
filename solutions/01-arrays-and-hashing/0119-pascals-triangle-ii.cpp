/**
 * Problem: 119. Pascal's Triangle II
 * Difficulty: Easy
 * Topic: Arrays & Dynamic Programming / Pascal's Triangle
 * LeetCode Link: https://leetcode.com/problems/pascals-triangle-ii/
 * 
 * Complexity:
 * - Time: O(rowIndex^2)
 * - Space: O(rowIndex) auxiliary space
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<int> getRow(int rowIndex) {
        vector<int> row(rowIndex + 1, 0);
        row[0] = 1;

        for (int i = 1; i <= rowIndex; i++) {
            for (int j = i; j >= 1; j--) {
                row[j] += row[j - 1];
            }
        }

        return row;
    }
};
