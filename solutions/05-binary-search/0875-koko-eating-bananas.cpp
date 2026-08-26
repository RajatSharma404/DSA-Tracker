/**
 * Problem: 875. Koko Eating Bananas
 * Difficulty: Medium
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/koko-eating-bananas/
 * 
 * Complexity:
 * - Time: O(n log(max(piles)))
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int left = 1;
        int right = *max_element(piles.begin(), piles.end());
        int ans = right;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            long long hoursNeeded = 0;
            for (int pile : piles) {
                hoursNeeded += (pile + mid - 1LL) / mid;
            }
            
            if (hoursNeeded <= h) {
                ans = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return ans;
    }
};
