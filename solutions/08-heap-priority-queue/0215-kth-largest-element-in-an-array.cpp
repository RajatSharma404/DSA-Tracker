/**
 * Problem: 215. Kth Largest Element in an Array
 * Difficulty: Medium
 * Topic: Heap / Priority Queue (Min-Heap)
 * LeetCode Link: https://leetcode.com/problems/kth-largest-element-in-an-array/
 * 
 * Complexity:
 * - Time: O(n log k)
 * - Space: O(k)
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> minHeap;

        for (int num : nums) {
            minHeap.push(num);
            if (minHeap.size() > k) {
                minHeap.pop();
            }
        }

        return minHeap.top();
    }
};
