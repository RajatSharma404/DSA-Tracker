/**
 * Problem: 49. Group Anagrams
 * Difficulty: Medium
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/group-anagrams/
 * 
 * Complexity:
 * - Time: O(N * K log K) where N is the number of strings and K is the maximum length of a string
 * - Space: O(N * K)
 */

#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (const string& s : strs) {
            string key = s;
            sort(key.begin(), key.end());
            groups[key].push_back(s);
        }
        
        vector<vector<string>> result;
        for (auto& pair : groups) {
            result.push_back(move(pair.second));
        }
        return result;
    }
};
