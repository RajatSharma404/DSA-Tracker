/**
 * Problem: 295. Find Median from Data Stream
 * Difficulty: Hard
 * Topic: Heap / Priority Queue (Two Heaps)
 * LeetCode Link: https://leetcode.com/problems/find-median-from-data-stream/
 * 
 * Complexity:
 * - Time: O(log n) for addNum, O(1) for findMedian
 * - Space: O(n)
 */

#include <queue>
#include <vector>

using namespace std;

class MedianFinder {
private:
    priority_queue<int> maxHeap; // stores smaller half
    priority_queue<int, vector<int>, greater<int>> minHeap; // stores larger half

public:
    MedianFinder() {}

    void addNum(int num) {
        maxHeap.push(num);
        minHeap.push(maxHeap.top());
        maxHeap.pop();

        if (maxHeap.size() < minHeap.size()) {
            maxHeap.push(minHeap.top());
            minHeap.pop();
        }
    }

    double findMedian() {
        if (maxHeap.size() > minHeap.size()) {
            return maxHeap.top();
        }
        return (maxHeap.top() + minHeap.top()) / 2.0;
    }
};
