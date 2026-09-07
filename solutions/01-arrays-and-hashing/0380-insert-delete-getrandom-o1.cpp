/**
 * Problem: 380. Insert Delete GetRandom O(1)
 * Difficulty: Medium
 * Topic: Arrays & Hashing / Design (Hash Map + Dynamic Array)
 * LeetCode Link: https://leetcode.com/problems/insert-delete-getrandom-o1/
 * 
 * Complexity:
 * - Time: O(1) average for insert, remove, and getRandom
 * - Space: O(n)
 */

#include <vector>
#include <unordered_map>
#include <cstdlib>

using namespace std;

class RandomizedSet {
private:
    vector<int> nums;
    unordered_map<int, int> valToIndex;

public:
    RandomizedSet() {}

    bool insert(int val) {
        if (valToIndex.count(val)) return false;

        nums.push_back(val);
        valToIndex[val] = nums.size() - 1;
        return true;
    }

    bool remove(int val) {
        if (!valToIndex.count(val)) return false;

        int idx = valToIndex[val];
        int lastVal = nums.back();

        nums[idx] = lastVal;
        valToIndex[lastVal] = idx;

        nums.pop_back();
        valToIndex.erase(val);
        return true;
    }

    int getRandom() {
        return nums[rand() % nums.size()];
    }
};
