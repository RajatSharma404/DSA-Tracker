/**
 * Problem: 108. Convert Sorted Array to Binary Search Tree
 * Difficulty: Easy
 * Topic: Trees & Tries / Divide and Conquer
 * LeetCode Link: https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(log n) call stack
 */

#include <vector>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
private:
    TreeNode* build(const vector<int>& nums, int l, int r) {
        if (l > r) return nullptr;
        int mid = l + (r - l) / 2;
        TreeNode* root = new TreeNode(nums[mid]);
        root->left = build(nums, l, mid - 1);
        root->right = build(nums, mid + 1, r);
        return root;
    }

public:
    TreeNode* sortedArrayToBST(vector<int>& nums) {
        return build(nums, 0, nums.size() - 1);
    }
};
