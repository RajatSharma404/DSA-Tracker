/**
 * Problem: 127. Word Ladder
 * Difficulty: Hard
 * Topic: Graphs (BFS Shortest Path)
 * LeetCode Link: https://leetcode.com/problems/word-ladder/
 * 
 * Complexity:
 * - Time: O(M^2 * N) where M is length of each word and N is number of words
 * - Space: O(M * N)
 */

#include <string>
#include <vector>
#include <unordered_set>
#include <queue>

using namespace std;

class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> dict(wordList.begin(), wordList.end());
        if (!dict.count(endWord)) return 0;

        queue<string> q;
        q.push(beginWord);
        int steps = 1;

        while (!q.empty()) {
            int sz = q.size();
            for (int i = 0; i < sz; ++i) {
                string word = q.front();
                q.pop();

                if (word == endWord) return steps;

                for (int j = 0; j < word.length(); ++j) {
                    char orig = word[j];
                    for (char c = 'a'; c <= 'z'; ++c) {
                        word[j] = c;
                        if (dict.count(word)) {
                            dict.erase(word);
                            q.push(word);
                        }
                    }
                    word[j] = orig;
                }
            }
            steps++;
        }

        return 0;
    }
};
