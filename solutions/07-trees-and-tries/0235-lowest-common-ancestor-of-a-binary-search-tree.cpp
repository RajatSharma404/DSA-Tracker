/**
 * Problem: 235. Lowest Common Ancestor of a Binary Search Tree
 * Difficulty: Medium
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/
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
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        TreeNode* curr = root;
        while (curr) {
            if (p->val > curr->val && q->val > curr->val) {
                curr = curr->right;
            } else if (p->val < curr->val && q->val < curr->val) {
                curr = curr->left;
            } else {
                return curr;
            }
        }
        return nullptr;
    }
};
