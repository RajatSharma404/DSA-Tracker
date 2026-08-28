/**
 * Problem: 105. Construct Binary Tree from Preorder and Inorder Traversal
 * Difficulty: Medium
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n) hash map + recursion stack
 */

#include <vector>
#include <unordered_map>

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
    unordered_map<int, int> inMap;
    int preIndex = 0;

    TreeNode* build(vector<int>& preorder, int inStart, int inEnd) {
        if (inStart > inEnd) return nullptr;

        int rootVal = preorder[preIndex++];
        TreeNode* root = new TreeNode(rootVal);
        int mid = inMap[rootVal];

        root->left = build(preorder, inStart, mid - 1);
        root->right = build(preorder, mid + 1, inEnd);
        return root;
    }

public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        preIndex = 0;
        inMap.clear();
        for (int i = 0; i < inorder.size(); ++i) {
            inMap[inorder[i]] = i;
        }
        return build(preorder, 0, inorder.size() - 1);
    }
};
