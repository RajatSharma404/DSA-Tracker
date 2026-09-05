/**
 * Problem: 345. Reverse Vowels of a String
 * Difficulty: Easy
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/reverse-vowels-of-a-string/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>
#include <unordered_set>
#include <algorithm>

using namespace std;

class Solution {
public:
    string reverseVowels(string s) {
        unordered_set<char> vowels = {'a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'};
        int l = 0, r = s.size() - 1;
        while (l < r) {
            while (l < r && !vowels.count(s[l])) l++;
            while (l < r && !vowels.count(s[r])) r--;
            if (l < r) {
                swap(s[l++], s[r--]);
            }
        }
        return s;
    }
};
