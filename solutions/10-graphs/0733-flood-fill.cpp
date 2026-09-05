/**
 * Problem: 733. Flood Fill
 * Difficulty: Easy
 * Topic: Graphs / DFS
 * LeetCode Link: https://leetcode.com/problems/flood-fill/
 *
 * Complexity:
 * - Time: O(m * n)
 * - Space: O(m * n) recursion stack
 */

#include <vector>

using namespace std;

class Solution {
private:
    void dfs(vector<vector<int>>& image, int r, int c, int origColor, int newColor) {
        if (r < 0 || r >= image.size() || c < 0 || c >= image[0].size() || image[r][c] != origColor) return;
        image[r][c] = newColor;
        dfs(image, r + 1, c, origColor, newColor);
        dfs(image, r - 1, c, origColor, newColor);
        dfs(image, r, c + 1, origColor, newColor);
        dfs(image, r, c - 1, origColor, newColor);
    }

public:
    vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
        int origColor = image[sr][sc];
        if (origColor != color) {
            dfs(image, sr, sc, origColor, color);
        }
        return image;
    }
};
