/**
 * Problem: 701. Insert into a Binary Search Tree
 * Difficulty: Medium
 * Topic: Trees & Tries / BST
 * LeetCode Link: https://leetcode.com/problems/insert-into-a-binary-search-tree/
 *
 * Complexity:
 * - Time: O(h)
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
    TreeNode* insertIntoBST(TreeNode* root, int val) {
        if (!root) return new TreeNode(val);
        TreeNode* curr = root;
        while (true) {
            if (val < curr->val) {
                if (curr->left) curr = curr->left;
                else { curr->left = new TreeNode(val); break; }
            } else {
                if (curr->right) curr = curr->right;
                else { curr->right = new TreeNode(val); break; }
            }
        }
        return root;
    }
};
