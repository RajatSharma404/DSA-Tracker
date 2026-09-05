/**
 * Problem: 1456. Maximum Number of Vowels in a Substring of Given Length
 * Difficulty: Medium
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>
#include <algorithm>

using namespace std;

class Solution {
private:
    bool isVowel(char c) {
        return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
    }

public:
    int maxVowels(string s, int k) {
        int count = 0;
        for (int i = 0; i < k; ++i) {
            if (isVowel(s[i])) count++;
        }
        int maxCount = count;
        for (int i = k; i < s.size(); ++i) {
            if (isVowel(s[i])) count++;
            if (isVowel(s[i - k])) count--;
            maxCount = max(maxCount, count);
        }
        return maxCount;
    }
};
