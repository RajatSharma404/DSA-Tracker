/**
 * Problem: 572. Subtree of Another Tree
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/subtree-of-another-tree/
 * 
 * Complexity:
 * - Time: O(s * t)
 * - Space: O(h)
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
private:
    bool isSame(TreeNode* p, TreeNode* q) {
        if (!p && !q) return true;
        if (!p || !q || p->val != q->val) return false;
        return isSame(p->left, q->left) && isSame(p->right, q->right);
    }
    
public:
    bool isSubtree(TreeNode* root, TreeNode* subRoot) {
        if (!root) return false;
        if (isSame(root, subRoot)) return true;
        return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
    }
};
