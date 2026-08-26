/**
 * Problem: 424. Longest Repeating Character Replacement
 * Difficulty: Medium
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/longest-repeating-character-replacement/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) (26 uppercase letters)
 */

#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int characterReplacement(string s, int k) {
        vector<int> count(26, 0);
        int maxCount = 0;
        int maxLen = 0;
        int left = 0;
        
        for (int right = 0; right < s.length(); ++right) {
            count[s[right] - 'A']++;
            maxCount = max(maxCount, count[s[right] - 'A']);
            
            // If window size minus max frequency > k, shrink window
            while ((right - left + 1) - maxCount > k) {
                count[s[left] - 'A']--;
                left++;
            }
            
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};
