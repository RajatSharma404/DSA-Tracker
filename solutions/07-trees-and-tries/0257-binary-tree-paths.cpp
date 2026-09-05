/**
 * Problem: 257. Binary Tree Paths
 * Difficulty: Easy
 * Topic: Trees & Tries / DFS
 * LeetCode Link: https://leetcode.com/problems/binary-tree-paths/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

#include <vector>
#include <string>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
private:
    void dfs(TreeNode* node, string path, vector<string>& paths) {
        if (!node) return;
        path += to_string(node->val);
        if (!node->left && !node->right) {
            paths.push_back(path);
            return;
        }
        path += "->";
        dfs(node->left, path, paths);
        dfs(node->right, path, paths);
    }

public:
    vector<string> binaryTreePaths(TreeNode* root) {
        vector<string> paths;
        dfs(root, "", paths);
        return paths;
    }
};
