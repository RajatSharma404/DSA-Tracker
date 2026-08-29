/**
 * Problem: 647. Palindromic Substrings
 * Difficulty: Medium
 * Topic: Dynamic Programming / Expand Around Center
 * LeetCode Link: https://leetcode.com/problems/palindromic-substrings/
 * 
 * Complexity:
 * - Time: O(n^2)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
private:
    int countPalindromes(const string& s, int left, int right) {
        int count = 0;
        while (left >= 0 && right < s.length() && s[left] == s[right]) {
            count++;
            left--;
            right++;
        }
        return count;
    }

public:
    int countSubstrings(string s) {
        int total = 0;
        for (int i = 0; i < s.length(); ++i) {
            total += countPalindromes(s, i, i);     // Odd length
            total += countPalindromes(s, i, i + 1); // Even length
        }
        return total;
    }
};
