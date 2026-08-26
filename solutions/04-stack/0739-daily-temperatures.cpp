/**
 * Problem: 739. Daily Temperatures
 * Difficulty: Medium
 * Topic: Stack (Monotonic Stack)
 * LeetCode Link: https://leetcode.com/problems/daily-temperatures/
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
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> result(n, 0);
        stack<int> st; // stores indices
        
        for (int i = 0; i < n; ++i) {
            while (!st.empty() && temperatures[i] > temperatures[st.top()]) {
                int prevIdx = st.top();
                st.pop();
                result[prevIdx] = i - prevIdx;
            }
            st.push(i);
        }
        return result;
    }
};
