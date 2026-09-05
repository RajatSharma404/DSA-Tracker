/**
 * Problem: 394. Decode String
 * Difficulty: Medium
 * Topic: Stack
 * LeetCode Link: https://leetcode.com/problems/decode-string/
 *
 * Complexity:
 * - Time: O(maxK * n)
 * - Space: O(n)
 */

#include <string>
#include <stack>

using namespace std;

class Solution {
public:
    string decodeString(string s) {
        stack<string> strSt;
        stack<int> numSt;
        string currStr = "";
        int num = 0;
        
        for (char c : s) {
            if (isdigit(c)) {
                num = num * 10 + (c - '0');
            } else if (c == '[') {
                numSt.push(num);
                strSt.push(currStr);
                num = 0;
                currStr = "";
            } else if (c == ']') {
                int repeat = numSt.top(); numSt.pop();
                string prevStr = strSt.top(); strSt.pop();
                string expanded = "";
                for (int i = 0; i < repeat; ++i) expanded += currStr;
                currStr = prevStr + expanded;
            } else {
                currStr += c;
            }
        }
        return currStr;
    }
};
