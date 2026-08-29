/**
 * Problem: 621. Task Scheduler
 * Difficulty: Medium
 * Topic: Greedy / Max-Heap
 * LeetCode Link: https://leetcode.com/problems/task-scheduler/
 * 
 * Complexity:
 * - Time: O(N) where N is number of tasks
 * - Space: O(1) (26 distinct tasks)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        vector<int> freq(26, 0);
        for (char t : tasks) {
            freq[t - 'A']++;
        }

        int maxFreq = *max_element(freq.begin(), freq.end());
        int countMax = 0;
        for (int f : freq) {
            if (f == maxFreq) countMax++;
        }

        int emptySlots = (maxFreq - 1) * (n + 1) + countMax;
        return max((int)tasks.size(), emptySlots);
    }
};
