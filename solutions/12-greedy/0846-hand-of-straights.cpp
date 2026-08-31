/**
 * Problem: 846. Hand of Straights
 * Difficulty: Medium
 * Topic: Greedy / Ordered Map
 * LeetCode Link: https://leetcode.com/problems/hand-of-straights/
 * 
 * Complexity:
 * - Time: O(n log n)
 * - Space: O(n)
 */

#include <vector>
#include <map>

using namespace std;

class Solution {
public:
    bool isNStraightHand(vector<int>& hand, int groupSize) {
        if (hand.size() % groupSize != 0) return false;

        map<int, int> count;
        for (int card : hand) count[card]++;

        for (auto& [card, freq] : count) {
            if (freq > 0) {
                int needed = freq;
                for (int i = 0; i < groupSize; ++i) {
                    if (count[card + i] < needed) return false;
                    count[card + i] -= needed;
                }
            }
        }
        return true;
    }
};
