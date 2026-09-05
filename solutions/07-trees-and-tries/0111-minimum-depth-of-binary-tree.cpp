/**
 * Problem: 111. Minimum Depth of Binary Tree
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/minimum-depth-of-binary-tree/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

#include <algorithm>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    int minDepth(TreeNode* root) {
        if (!root) return 0;
        if (!root->left) return 1 + minDepth(root->right);
        if (!root->right) return 1 + minDepth(root->left);
        return 1 + min(minDepth(root->left), minDepth(root->right));
    }
};
