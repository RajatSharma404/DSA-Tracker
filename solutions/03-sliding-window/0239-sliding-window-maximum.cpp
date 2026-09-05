/**
 * Problem: 239. Sliding Window Maximum
 * Difficulty: Hard
 * Topic: Sliding Window (Monotonic Deque)
 * LeetCode Link: https://leetcode.com/problems/sliding-window-maximum/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(k) deque space
 */

#include <vector>
#include <deque>

using namespace std;

class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> dq; // stores indices
        vector<int> result;

        for (int i = 0; i < nums.size(); ++i) {
            // Remove indices that are out of the current window
            if (!dq.empty() && dq.front() == i - k) {
                dq.pop_front();
            }

            // Remove smaller elements from back of deque
            while (!dq.empty() && nums[dq.back()] < nums[i]) {
                dq.pop_back();
            }

            dq.push_back(i);

            if (i >= k - 1) {
                result.push_back(nums[dq.front()]);
            }
        }

        return result;
    }
};
