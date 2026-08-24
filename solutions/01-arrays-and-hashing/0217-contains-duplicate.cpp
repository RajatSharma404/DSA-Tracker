/**
 * Problem: 217. Contains Duplicate
 * Difficulty: Easy
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/contains-duplicate/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <unordered_set>

using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int num : nums) {
            if (seen.count(num)) return true;
            seen.insert(num);
        }
        return false;
    }
};
