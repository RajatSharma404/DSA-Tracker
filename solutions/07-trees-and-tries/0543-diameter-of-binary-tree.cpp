/**
 * Problem: 543. Diameter of Binary Tree
 * Difficulty: Easy
 * Topic: Trees & Tries (DFS)
 * LeetCode Link: https://leetcode.com/problems/diameter-of-binary-tree/
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
    int maxDiameter = 0;

    int depth(TreeNode* node) {
        if (!node) return 0;
        int left = depth(node->left);
        int right = depth(node->right);
        maxDiameter = max(maxDiameter, left + right);
        return 1 + max(left, right);
    }

public:
    int diameterOfBinaryTree(TreeNode* root) {
        maxDiameter = 0;
        depth(root);
        return maxDiameter;
    }
};
