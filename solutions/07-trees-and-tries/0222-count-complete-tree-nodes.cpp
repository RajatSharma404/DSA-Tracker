/**
 * Problem: 222. Count Complete Tree Nodes
 * Difficulty: Easy
 * Topic: Trees & Tries / Binary Search on Tree
 * LeetCode Link: https://leetcode.com/problems/count-complete-tree-nodes/
 *
 * Complexity:
 * - Time: O((log n)^2)
 * - Space: O(log n)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    int countNodes(TreeNode* root) {
        if (!root) return 0;
        int leftH = 0, rightH = 0;
        TreeNode* l = root;
        while (l) { leftH++; l = l->left; }
        TreeNode* r = root;
        while (r) { rightH++; r = r->right; }
        
        if (leftH == rightH) return (1 << leftH) - 1;
        return 1 + countNodes(root->left) + countNodes(root->right);
    }
};
