/**
 * Problem: 66. Plus One
 * Difficulty: Easy
 * Topic: Math & Number Theory
 * LeetCode Link: https://leetcode.com/problems/plus-one/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        int n = digits.size();
        for (int i = n - 1; i >= 0; --i) {
            if (digits[i] < 9) {
                digits[i]++;
                return digits;
            }
            digits[i] = 0;
        }

        digits.insert(digits.begin(), 1);
        return digits;
    }
};
