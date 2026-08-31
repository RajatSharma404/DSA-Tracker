/**
 * Problem: 1899. Merge Triplets to Form Target Triplet
 * Difficulty: Medium
 * Topic: Greedy
 * LeetCode Link: https://leetcode.com/problems/merge-triplets-to-form-target-triplet/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    bool mergeTriplets(vector<vector<int>>& triplets, vector<int>& target) {
        bool has0 = false, has1 = false, has2 = false;

        for (const auto& t : triplets) {
            if (t[0] <= target[0] && t[1] <= target[1] && t[2] <= target[2]) {
                if (t[0] == target[0]) has0 = true;
                if (t[1] == target[1]) has1 = true;
                if (t[2] == target[2]) has2 = true;
            }
        }
        return has0 && has1 && has2;
    }
};
