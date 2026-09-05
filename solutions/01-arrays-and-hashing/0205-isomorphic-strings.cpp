/**
 * Problem: 205. Isomorphic Strings
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Hash Map
 * LeetCode Link: https://leetcode.com/problems/isomorphic-strings/
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
    bool isIsomorphic(string s, string t) {
        if (s.size() != t.size()) return false;
        vector<int> m1(256, 0), m2(256, 0);
        for (int i = 0; i < s.size(); ++i) {
            if (m1[(unsigned char)s[i]] != m2[(unsigned char)t[i]]) return false;
            m1[(unsigned char)s[i]] = i + 1;
            m2[(unsigned char)t[i]] = i + 1;
        }
        return true;
    }
};
