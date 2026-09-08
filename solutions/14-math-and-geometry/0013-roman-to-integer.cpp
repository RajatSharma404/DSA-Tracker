/**
 * Problem: 13. Roman to Integer
 * Difficulty: Easy
 * Topic: Math & Geometry / Hash Map
 * LeetCode Link: https://leetcode.com/problems/roman-to-integer/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) fixed lookup table
 */

#include <string>
#include <unordered_map>

using namespace std;

class Solution {
public:
    int romanToInt(string s) {
        unordered_map<char, int> roman = {
            {'I', 1}, {'V', 5}, {'X', 10}, {'L', 50},
            {'C', 100}, {'D', 500}, {'M', 1000}
        };

        int total = 0;
        int n = s.length();

        for (int i = 0; i < n; i++) {
            if (i + 1 < n && roman[s[i]] < roman[s[i + 1]]) {
                total -= roman[s[i]];
            } else {
                total += roman[s[i]];
            }
        }

        return total;
    }
};
