/**
 * Problem: 387. First Unique Character in a String
 * Difficulty: Easy
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/first-unique-character-in-a-string/
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
    int firstUniqChar(string s) {
        vector<int> freq(26, 0);
        for (char c : s) freq[c - 'a']++;
        for (int i = 0; i < s.size(); ++i) {
            if (freq[s[i] - 'a'] == 1) return i;
        }
        return -1;
    }
};
