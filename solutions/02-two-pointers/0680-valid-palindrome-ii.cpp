/**
 * Problem: 680. Valid Palindrome II
 * Difficulty: Easy
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/valid-palindrome-ii/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
private:
    bool isPal(const string& s, int l, int r) {
        while (l < r) {
            if (s[l++] != s[r--]) return false;
        }
        return true;
    }

public:
    bool validPalindrome(string s) {
        int l = 0, r = s.size() - 1;
        while (l < r) {
            if (s[l] != s[r]) {
                return isPal(s, l + 1, r) || isPal(s, l, r - 1);
            }
            l++;
            r--;
        }
        return true;
    }
};
