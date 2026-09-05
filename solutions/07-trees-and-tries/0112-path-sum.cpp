/**
 * Problem: 112. Path Sum
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/path-sum/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    bool hasPathSum(TreeNode* root, int targetSum) {
        if (!root) return false;
        if (!root->left && !root->right) return root->val == targetSum;
        return hasPathSum(root->left, targetSum - root->val) || hasPathSum(root->right, targetSum - root->val);
    }
};
