/**
 * Problem: 242. Valid Anagram
 * Difficulty: Easy
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/valid-anagram/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.length() != t.length()) return false;
        vector<int> count(26, 0);
        for (int i = 0; i < s.length(); ++i) {
            count[s[i] - 'a']++;
            count[t[i] - 'a']--;
        }
        for (int c : count) {
            if (c != 0) return false;
        }
        return true;
    }
};
