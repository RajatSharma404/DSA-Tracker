/**
 * Problem: 946. Validate Stack Sequences
 * Difficulty: Medium
 * Topic: Stack Simulation
 * LeetCode Link: https://leetcode.com/problems/validate-stack-sequences/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <stack>

using namespace std;

class Solution {
public:
    bool validateStackSequences(vector<int>& pushed, vector<int>& popped) {
        stack<int> st;
        int j = 0;
        for (int x : pushed) {
            st.push(x);
            while (!st.empty() && j < popped.size() && st.top() == popped[j]) {
                st.pop();
                j++;
            }
        }
        return st.empty();
    }
};
