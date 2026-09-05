/**
 * Problem: 438. Find All Anagrams in a String
 * Difficulty: Medium
 * Topic: Sliding Window / Frequency Array
 * LeetCode Link: https://leetcode.com/problems/find-all-anagrams-in-a-string/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) fixed 26 alphabet size
 */

#include <vector>
#include <string>

using namespace std;

class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        vector<int> res;
        if (s.size() < p.size()) return res;
        vector<int> pCount(26, 0), sCount(26, 0);
        for (char c : p) pCount[c - 'a']++;
        
        int k = p.size();
        for (int i = 0; i < k; ++i) sCount[s[i] - 'a']++;
        if (sCount == pCount) res.push_back(0);
        
        for (int i = k; i < s.size(); ++i) {
            sCount[s[i] - 'a']++;
            sCount[s[i - k] - 'a']--;
            if (sCount == pCount) res.push_back(i - k + 1);
        }
        return res;
    }
};
