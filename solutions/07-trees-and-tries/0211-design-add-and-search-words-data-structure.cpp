/**
 * Problem: 211. Design Add and Search Words Data Structure
 * Difficulty: Medium
 * Topic: Trees & Tries (Trie + DFS)
 * LeetCode Link: https://leetcode.com/problems/design-add-and-search-words-data-structure/
 * 
 * Complexity:
 * - Time: O(m) addWord, O(N * 26^m) worst search with '.'
 * - Space: O(total letters * 26)
 */

#include <string>

using namespace std;

class WordDictionaryNode {
public:
    WordDictionaryNode* children[26];
    bool isEnd;

    WordDictionaryNode() {
        isEnd = false;
        for (int i = 0; i < 26; ++i) children[i] = nullptr;
    }
};

class WordDictionary {
private:
    WordDictionaryNode* root;

    bool searchInNode(const string& word, int index, WordDictionaryNode* node) {
        if (!node) return false;
        if (index == word.length()) return node->isEnd;

        char c = word[index];
        if (c != '.') {
            int idx = c - 'a';
            return searchInNode(word, index + 1, node->children[idx]);
        }

        for (int i = 0; i < 26; ++i) {
            if (node->children[i] && searchInNode(word, index + 1, node->children[i])) {
                return true;
            }
        }
        return false;
    }

public:
    WordDictionary() {
        root = new WordDictionaryNode();
    }

    void addWord(string word) {
        WordDictionaryNode* curr = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!curr->children[idx]) {
                curr->children[idx] = new WordDictionaryNode();
            }
            curr = curr->children[idx];
        }
        curr->isEnd = true;
    }

    bool search(string word) {
        return searchInNode(word, 0, root);
    }
};
