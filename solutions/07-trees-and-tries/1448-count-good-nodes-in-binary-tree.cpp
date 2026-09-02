/**
 * Problem: 1448. Count Good Nodes in Binary Tree
 * Difficulty: Medium
 * Topic: Trees & Tries (DFS Preorder)
 * LeetCode Link: https://leetcode.com/problems/count-good-nodes-in-binary-tree/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(h) recursion stack
 */

#include <algorithm>

using namespace std;

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
    int dfs(TreeNode* node, int maxVal) {
        if (!node) return 0;

        int good = 0;
        if (node->val >= maxVal) {
            good = 1;
            maxVal = node->val;
        }

        return good + dfs(node->left, maxVal) + dfs(node->right, maxVal);
    }

public:
    int goodNodes(TreeNode* root) {
        if (!root) return 0;
        return dfs(root, root->val);
    }
};
