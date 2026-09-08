/**
 * Problem: 67. Add Binary
 * Difficulty: Easy
 * Topic: Bit Manipulation / String Simulation
 * LeetCode Link: https://leetcode.com/problems/add-binary/
 * 
 * Complexity:
 * - Time: O(max(N, M))
 * - Space: O(max(N, M)) for result string
 */

#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
    string addBinary(string a, string b) {
        string result = "";
        int i = a.length() - 1;
        int j = b.length() - 1;
        int carry = 0;

        while (i >= 0 || j >= 0 || carry) {
            int sum = carry;
            if (i >= 0) sum += a[i--] - '0';
            if (j >= 0) sum += b[j--] - '0';

            result.push_back((sum % 2) + '0');
            carry = sum / 2;
        }

        reverse(result.begin(), result.end());
        return result;
    }
};
