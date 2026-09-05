/**
 * Problem: 71. Simplify Path
 * Difficulty: Medium
 * Topic: Stack
 * LeetCode Link: https://leetcode.com/problems/simplify-path/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <string>
#include <vector>
#include <sstream>

using namespace std;

class Solution {
public:
    string simplifyPath(string path) {
        vector<string> st;
        stringstream ss(path);
        string part;
        while (getline(ss, part, '/')) {
            if (part == "" || part == ".") continue;
            if (part == "..") {
                if (!st.empty()) st.pop_back();
            } else {
                st.push_back(part);
            }
        }
        string res = "";
        for (const string& dir : st) {
            res += "/" + dir;
        }
        return res.empty() ? "/" : res;
    }
};
