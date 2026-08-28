/**
 * Problem: 98. Validate Binary Search Tree
 * Difficulty: Medium
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/validate-binary-search-tree/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(h) recursion stack
 */

#include <climits>

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
    bool validate(TreeNode* node, long minVal, long maxVal) {
        if (!node) return true;
        if (node->val <= minVal || node->val >= maxVal) return false;
        return validate(node->left, minVal, node->val) && validate(node->right, node->val, maxVal);
    }

public:
    bool isValidBST(TreeNode* root) {
        return validate(root, LONG_MIN, LONG_MAX);
    }
};
