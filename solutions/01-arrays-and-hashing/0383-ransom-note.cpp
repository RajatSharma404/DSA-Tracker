/**
 * Problem: 383. Ransom Note
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Hash Table
 * LeetCode Link: https://leetcode.com/problems/ransom-note/
 *
 * Complexity:
 * - Time: O(m + n)
 * - Space: O(1) constant alphabet space
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    bool canConstruct(string ransomNote, string magazine) {
        vector<int> count(26, 0);
        for (char c : magazine) count[c - 'a']++;
        for (char c : ransomNote) {
            if (--count[c - 'a'] < 0) return false;
        }
        return true;
    }
};
