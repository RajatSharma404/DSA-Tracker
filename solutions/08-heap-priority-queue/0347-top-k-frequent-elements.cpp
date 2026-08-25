/**
 * Problem: 347. Top K Frequent Elements
 * Difficulty: Medium
 * Topic: Heap / Priority Queue
 * LeetCode Link: https://leetcode.com/problems/top-k-frequent-elements/
 * 
 * Complexity:
 * - Time: O(N log k)
 * - Space: O(N)
 */

#include <vector>
#include <unordered_map>
#include <queue>

using namespace std;

class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int num : nums) count[num]++;
        
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> minHeap;
        
        for (auto& [num, freq] : count) {
            minHeap.push({freq, num});
            if (minHeap.size() > k) {
                minHeap.pop();
            }
        }
        
        vector<int> result;
        while (!minHeap.empty()) {
            result.push_back(minHeap.top().second);
            minHeap.pop();
        }
        return result;
    }
};
