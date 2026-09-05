/**
 * Problem: 297. Serialize and Deserialize Binary Tree
 * Difficulty: Hard
 * Topic: Trees & Tries (Preorder Traversal)
 * LeetCode Link: https://leetcode.com/problems/serialize-and-deserialize-binary-tree/
 * 
 * Complexity:
 * - Time: O(n) for both serialize and deserialize
 * - Space: O(n)
 */

#include <string>
#include <sstream>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Codec {
private:
    void serializeHelper(TreeNode* root, ostringstream& out) {
        if (!root) {
            out << "# ";
            return;
        }
        out << root->val << " ";
        serializeHelper(root->left, out);
        serializeHelper(root->right, out);
    }

    TreeNode* deserializeHelper(istringstream& in) {
        string val;
        in >> val;
        if (val == "#") return nullptr;

        TreeNode* root = new TreeNode(stoi(val));
        root->left = deserializeHelper(in);
        root->right = deserializeHelper(in);
        return root;
    }

public:
    string serialize(TreeNode* root) {
        ostringstream out;
        serializeHelper(root, out);
        return out.str();
    }

    TreeNode* deserialize(string data) {
        istringstream in(data);
        return deserializeHelper(in);
    }
};
