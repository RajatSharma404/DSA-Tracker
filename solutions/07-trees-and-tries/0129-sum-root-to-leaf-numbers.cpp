/**
 * Problem: 129. Sum Root to Leaf Numbers
 * Difficulty: Medium
 * Topic: Trees & Tries / DFS
 * LeetCode Link: https://leetcode.com/problems/sum-root-to-leaf-numbers/
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
private:
    int dfs(TreeNode* node, int currentSum) {
        if (!node) return 0;
        currentSum = currentSum * 10 + node->val;
        if (!node->left && !node->right) return currentSum;
        return dfs(node->left, currentSum) + dfs(node->right, currentSum);
    }

public:
    int sumNumbers(TreeNode* root) {
        return dfs(root, 0);
    }
};
