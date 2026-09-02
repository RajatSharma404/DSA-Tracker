/**
 * Problem: 703. Kth Largest Element in a Stream
 * Difficulty: Easy
 * Topic: Heap / Priority Queue (Min-Heap of size k)
 * LeetCode Link: https://leetcode.com/problems/kth-largest-element-in-a-stream/
 * 
 * Complexity:
 * - Time: O(log k) per add
 * - Space: O(k)
 */

#include <vector>
#include <queue>

using namespace std;

class KthLargest {
private:
    int k;
    priority_queue<int, vector<int>, greater<int>> minHeap;

public:
    KthLargest(int k, vector<int>& nums) : k(k) {
        for (int num : nums) {
            add(num);
        }
    }

    int add(int val) {
        minHeap.push(val);
        if (minHeap.size() > k) {
            minHeap.pop();
        }
        return minHeap.top();
    }
};
