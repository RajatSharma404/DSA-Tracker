/**
 * Problem: 290. Word Pattern
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Hash Map
 * LeetCode Link: https://leetcode.com/problems/word-pattern/
 *
 * Complexity:
 * - Time: O(n + m)
 * - Space: O(w) where w is number of unique words
 */

#include <string>
#include <sstream>
#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    bool wordPattern(string pattern, string s) {
        stringstream ss(s);
        string word;
        vector<string> words;
        while (ss >> word) words.push_back(word);
        
        if (pattern.size() != words.size()) return false;
        unordered_map<char, string> p2w;
        unordered_map<string, char> w2p;
        
        for (int i = 0; i < pattern.size(); ++i) {
            char c = pattern[i];
            const string& w = words[i];
            if (p2w.count(c) && p2w[c] != w) return false;
            if (w2p.count(w) && w2p[w] != c) return false;
            p2w[c] = w;
            w2p[w] = c;
        }
        return true;
    }
};
