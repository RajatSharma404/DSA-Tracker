/**
 * Problem: 110. Balanced Binary Tree
 * Difficulty: Easy
 * Topic: Trees & Tries (Bottom-Up DFS)
 * LeetCode Link: https://leetcode.com/problems/balanced-binary-tree/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

#include <algorithm>
#include <cmath>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
private:
    int checkHeight(TreeNode* node) {
        if (!node) return 0;

        int left = checkHeight(node->left);
        if (left == -1) return -1;

        int right = checkHeight(node->right);
        if (right == -1) return -1;

        if (abs(left - right) > 1) return -1;
        return 1 + max(left, right);
    }

public:
    bool isBalanced(TreeNode* root) {
        return checkHeight(root) != -1;
    }
};
