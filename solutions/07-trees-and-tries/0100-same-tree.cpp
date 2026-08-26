/**
 * Problem: 100. Same Tree
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/same-tree/
 * 
 * Complexity:
 * - Time: O(N) where N is the number of nodes
 * - Space: O(h) where h is the tree height
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p && !q) return true;
        if (!p || !q || p->val != q->val) return false;
        return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};
