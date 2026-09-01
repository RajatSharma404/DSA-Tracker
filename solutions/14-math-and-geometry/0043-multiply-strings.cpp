/**
 * Problem: 43. Multiply Strings
 * Difficulty: Medium
 * Topic: Math & Number Theory (Big Integer Multiplication)
 * LeetCode Link: https://leetcode.com/problems/multiply-strings/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M + N)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    string multiply(string num1, string num2) {
        if (num1 == "0" || num2 == "0") return "0";

        int m = num1.size(), n = num2.size();
        vector<int> pos(m + n, 0);

        for (int i = m - 1; i >= 0; --i) {
            for (int j = n - 1; j >= 0; --j) {
                int mul = (num1[i] - '0') * (num2[j] - '0');
                int p1 = i + j, p2 = i + j + 1;
                int sum = mul + pos[p2];

                pos[p2] = sum % 10;
                pos[p1] += sum / 10;
            }
        }

        string result = "";
        for (int p : pos) {
            if (!(result.empty() && p == 0)) {
                result.push_back(p + '0');
            }
        }

        return result.empty() ? "0" : result;
    }
};
