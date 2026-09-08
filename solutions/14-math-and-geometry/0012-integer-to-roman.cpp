/**
 * Problem: 12. Integer to Roman
 * Difficulty: Medium
 * Topic: Math & Geometry / Greedy Mapping
 * LeetCode Link: https://leetcode.com/problems/integer-to-roman/
 * 
 * Complexity:
 * - Time: O(1) bounded by fixed number of Roman numerals
 * - Space: O(1)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    string intToRoman(int num) {
        const vector<pair<int, string>> valToRoman = {
            {1000, "M"}, {900, "CM"}, {500, "D"}, {400, "CD"},
            {100, "C"},   {90, "XC"},  {50, "L"},   {40, "XL"},
            {10, "X"},    {9, "IX"},   {5, "V"},    {4, "IV"},
            {1, "I"}
        };

        string result = "";
        for (const auto& [val, sym] : valToRoman) {
            while (num >= val) {
                result += sym;
                num -= val;
            }
        }

        return result;
    }
};
