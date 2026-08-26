/**
 * Problem: 238. Product of Array Except Self
 * Difficulty: Medium
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/product-of-array-except-self/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) auxiliary space (excluding return vector)
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> result(n, 1);
        
        int prefix = 1;
        for (int i = 0; i < n; ++i) {
            result[i] = prefix;
            prefix *= nums[i];
        }
        
        int suffix = 1;
        for (int i = n - 1; i >= 0; --i) {
            result[i] *= suffix;
            suffix *= nums[i];
        }
        
        return result;
    }
};
