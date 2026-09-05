/**
 * Problem: 700. Search in a Binary Search Tree
 * Difficulty: Easy
 * Topic: Trees & Tries / BST
 * LeetCode Link: https://leetcode.com/problems/search-in-a-binary-search-tree/
 *
 * Complexity:
 * - Time: O(h) where h is height of BST
 * - Space: O(1)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    TreeNode* searchBST(TreeNode* root, int val) {
        while (root && root->val != val) {
            root = (val < root->val) ? root->left : root->right;
        }
        return root;
    }
};
