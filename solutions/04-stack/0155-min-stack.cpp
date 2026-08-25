/**
 * Problem: 155. Min Stack
 * Difficulty: Medium
 * Topic: Stack
 * LeetCode Link: https://leetcode.com/problems/min-stack/
 * 
 * Complexity:
 * - Time: O(1) for push, pop, top, getMin
 * - Space: O(n)
 */

#include <stack>
#include <algorithm>

using namespace std;

class MinStack {
private:
    stack<int> mainStack;
    stack<int> minStack;
public:
    MinStack() {}
    
    void push(int val) {
        mainStack.push(val);
        if (minStack.empty() || val <= minStack.top()) {
            minStack.push(val);
        }
    }
    
    void pop() {
        if (mainStack.top() == minStack.top()) {
            minStack.pop();
        }
        mainStack.pop();
    }
    
    int top() {
        return mainStack.top();
    }
    
    int getMin() {
        return minStack.top();
    }
};
