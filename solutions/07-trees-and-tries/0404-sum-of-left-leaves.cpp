/**
 * Problem: 404. Sum of Left Leaves
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/sum-of-left-leaves/
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
    int sumOfLeftLeaves(TreeNode* root) {
        if (!root) return 0;
        int sum = 0;
        if (root->left && !root->left->left && !root->left->right) {
            sum += root->left->val;
        }
        return sum + sumOfLeftLeaves(root->left) + sumOfLeftLeaves(root->right);
    }
};
