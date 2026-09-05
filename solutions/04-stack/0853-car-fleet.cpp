/**
 * Problem: 853. Car Fleet
 * Difficulty: Medium
 * Topic: Stack / Monotonic Stack
 * LeetCode Link: https://leetcode.com/problems/car-fleet/
 *
 * Complexity:
 * - Time: O(n log n)
 * - Space: O(n)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int carFleet(int target, vector<int>& position, vector<int>& speed) {
        int n = position.size();
        vector<pair<int, double>> cars(n);
        for (int i = 0; i < n; ++i) {
            cars[i] = {position[i], (double)(target - position[i]) / speed[i]};
        }
        sort(cars.begin(), cars.end(), [](const auto& a, const auto& b) {
            return a.first > b.first;
        });
        
        int fleets = 0;
        double maxTime = 0.0;
        for (const auto& car : cars) {
            if (car.second > maxTime) {
                fleets++;
                maxTime = car.second;
            }
        }
        return fleets;
    }
};
