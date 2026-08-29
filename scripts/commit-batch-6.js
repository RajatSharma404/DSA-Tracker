const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 647,
    title: 'Palindromic Substrings',
    folder: '11-dynamic-programming',
    fileName: '0647-palindromic-substrings.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n^2)',
    space: 'O(1)',
    code: `/**
 * Problem: 647. Palindromic Substrings
 * Difficulty: Medium
 * Topic: Dynamic Programming / Expand Around Center
 * LeetCode Link: https://leetcode.com/problems/palindromic-substrings/
 * 
 * Complexity:
 * - Time: O(n^2)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
private:
    int countPalindromes(const string& s, int left, int right) {
        int count = 0;
        while (left >= 0 && right < s.length() && s[left] == s[right]) {
            count++;
            left--;
            right++;
        }
        return count;
    }

public:
    int countSubstrings(string s) {
        int total = 0;
        for (int i = 0; i < s.length(); ++i) {
            total += countPalindromes(s, i, i);     // Odd length
            total += countPalindromes(s, i, i + 1); // Even length
        }
        return total;
    }
};
`
  },
  {
    id: 322,
    title: 'Coin Change',
    folder: '11-dynamic-programming',
    fileName: '0322-coin-change.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(amount * n)',
    space: 'O(amount)',
    code: `/**
 * Problem: 322. Coin Change
 * Difficulty: Medium
 * Topic: Dynamic Programming (Bottom-Up)
 * LeetCode Link: https://leetcode.com/problems/coin-change/
 * 
 * Complexity:
 * - Time: O(amount * coins.size())
 * - Space: O(amount)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;

        for (int a = 1; a <= amount; ++a) {
            for (int c : coins) {
                if (a - c >= 0) {
                    dp[a] = min(dp[a], 1 + dp[a - c]);
                }
            }
        }

        return dp[amount] > amount ? -1 : dp[amount];
    }
};
`
  },
  {
    id: 300,
    title: 'Longest Increasing Subsequence',
    folder: '11-dynamic-programming',
    fileName: '0300-longest-increasing-subsequence.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n log n)',
    space: 'O(n)',
    code: `/**
 * Problem: 300. Longest Increasing Subsequence
 * Difficulty: Medium
 * Topic: Dynamic Programming / Patience Sorting (Binary Search)
 * LeetCode Link: https://leetcode.com/problems/longest-increasing-subsequence/
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
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;
        for (int x : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) {
                tails.push_back(x);
            } else {
                *it = x;
            }
        }
        return tails.size();
    }
};
`
  },
  {
    id: 1143,
    title: 'Longest Common Subsequence',
    folder: '11-dynamic-programming',
    fileName: '1143-longest-common-subsequence.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(m * n)',
    space: 'O(m * n)',
    code: `/**
 * Problem: 1143. Longest Common Subsequence
 * Difficulty: Medium
 * Topic: Dynamic Programming (2D Grid)
 * LeetCode Link: https://leetcode.com/problems/longest-common-subsequence/
 * 
 * Complexity:
 * - Time: O(m * n)
 * - Space: O(m * n)
 */

#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int m = text1.size(), n = text2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

        for (int i = m - 1; i >= 0; --i) {
            for (int j = n - 1; j >= 0; --j) {
                if (text1[i] == text2[j]) {
                    dp[i][j] = 1 + dp[i + 1][j + 1];
                } else {
                    dp[i][j] = max(dp[i + 1][j], dp[i][j + 1]);
                }
            }
        }

        return dp[0][0];
    }
};
`
  },
  {
    id: 208,
    title: 'Implement Trie (Prefix Tree)',
    folder: '07-trees-and-tries',
    fileName: '0208-implement-trie-prefix-tree.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries',
    time: 'O(m) per op',
    space: 'O(T * 26)',
    code: `/**
 * Problem: 208. Implement Trie (Prefix Tree)
 * Difficulty: Medium
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/implement-trie-prefix-tree/
 * 
 * Complexity:
 * - Time: O(m) where m is word length
 * - Space: O(total characters inserted * 26)
 */

#include <string>
#include <vector>

using namespace std;

class TrieNode {
public:
    TrieNode* children[26];
    bool isEndOfWord;

    TrieNode() {
        isEndOfWord = false;
        for (int i = 0; i < 26; ++i) {
            children[i] = nullptr;
        }
    }
};

class Trie {
private:
    TrieNode* root;

public:
    Trie() {
        root = new TrieNode();
    }

    void insert(string word) {
        TrieNode* node = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!node->children[idx]) {
                node->children[idx] = new TrieNode();
            }
            node = node->children[idx];
        }
        node->isEndOfWord = true;
    }

    bool search(string word) {
        TrieNode* node = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!node->children[idx]) return false;
            node = node->children[idx];
        }
        return node->isEndOfWord;
    }

    bool startsWith(string prefix) {
        TrieNode* node = root;
        for (char c : prefix) {
            int idx = c - 'a';
            if (!node->children[idx]) return false;
            node = node->children[idx];
        }
        return true;
    }
};
`
  },
  {
    id: 211,
    title: 'Design Add and Search Words Data Structure',
    folder: '07-trees-and-tries',
    fileName: '0211-design-add-and-search-words-data-structure.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries',
    time: 'O(m) insert, O(26^m) search',
    space: 'O(T * 26)',
    code: `/**
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
`
  },
  {
    id: 215,
    title: 'Kth Largest Element in an Array',
    folder: '08-heap-priority-queue',
    fileName: '0215-kth-largest-element-in-an-array.cpp',
    difficulty: 'Medium',
    topic: 'Heap / Priority Queue',
    time: 'O(n log k)',
    space: 'O(k)',
    code: `/**
 * Problem: 215. Kth Largest Element in an Array
 * Difficulty: Medium
 * Topic: Heap / Priority Queue (Min-Heap)
 * LeetCode Link: https://leetcode.com/problems/kth-largest-element-in-an-array/
 * 
 * Complexity:
 * - Time: O(n log k)
 * - Space: O(k)
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> minHeap;

        for (int num : nums) {
            minHeap.push(num);
            if (minHeap.size() > k) {
                minHeap.pop();
            }
        }

        return minHeap.top();
    }
};
`
  },
  {
    id: 621,
    title: 'Task Scheduler',
    folder: '08-heap-priority-queue',
    fileName: '0621-task-scheduler.cpp',
    difficulty: 'Medium',
    topic: 'Heap / Priority Queue',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 621. Task Scheduler
 * Difficulty: Medium
 * Topic: Greedy / Max-Heap
 * LeetCode Link: https://leetcode.com/problems/task-scheduler/
 * 
 * Complexity:
 * - Time: O(N) where N is number of tasks
 * - Space: O(1) (26 distinct tasks)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        vector<int> freq(26, 0);
        for (char t : tasks) {
            freq[t - 'A']++;
        }

        int maxFreq = *max_element(freq.begin(), freq.end());
        int countMax = 0;
        for (int f : freq) {
            if (f == maxFreq) countMax++;
        }

        int emptySlots = (maxFreq - 1) * (n + 1) + countMax;
        return max((int)tasks.size(), emptySlots);
    }
};
`
  },
  {
    id: 46,
    title: 'Permutations',
    folder: '09-backtracking',
    fileName: '0046-permutations.cpp',
    difficulty: 'Medium',
    topic: 'Recursion & Backtracking',
    time: 'O(n! * n)',
    space: 'O(n)',
    code: `/**
 * Problem: 46. Permutations
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/permutations/
 * 
 * Complexity:
 * - Time: O(n! * n)
 * - Space: O(n) recursion stack
 */

#include <vector>

using namespace std;

class Solution {
private:
    void backtrack(int first, vector<int>& nums, vector<vector<int>>& result) {
        if (first == nums.size()) {
            result.push_back(nums);
            return;
        }

        for (int i = first; i < nums.size(); ++i) {
            swap(nums[first], nums[i]);
            backtrack(first + 1, nums, result);
            swap(nums[first], nums[i]); // backtrack
        }
    }

public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> result;
        backtrack(0, nums, result);
        return result;
    }
};
`
  },
  {
    id: 90,
    title: 'Subsets II',
    folder: '09-backtracking',
    fileName: '0090-subsets-ii.cpp',
    difficulty: 'Medium',
    topic: 'Recursion & Backtracking',
    time: 'O(n * 2^n)',
    space: 'O(n)',
    code: `/**
 * Problem: 90. Subsets II
 * Difficulty: Medium
 * Topic: Recursion & Backtracking (Handling Duplicates)
 * LeetCode Link: https://leetcode.com/problems/subsets-ii/
 * 
 * Complexity:
 * - Time: O(n * 2^n)
 * - Space: O(n) recursion stack
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
private:
    void backtrack(int index, vector<int>& nums, vector<int>& current, vector<vector<int>>& result) {
        result.push_back(current);

        for (int i = index; i < nums.size(); ++i) {
            if (i > index && nums[i] == nums[i - 1]) continue; // skip duplicates
            current.push_back(nums[i]);
            backtrack(i + 1, nums, current, result);
            current.pop_back();
        }
    }

public:
    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> current;
        sort(nums.begin(), nums.end());
        backtrack(0, nums, current, result);
        return result;
    }
};
`
  }
];

const rootDir = path.join(__dirname, '..');
const solutionsDir = path.join(rootDir, 'solutions');

for (let i = 0; i < problems.length; i++) {
  const p = problems[i];
  const targetDir = path.join(solutionsDir, p.folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, p.fileName);
  fs.writeFileSync(filePath, p.code, 'utf8');

  sync();

  const commitMsg = `feat(solutions): add ${p.id}. ${p.title} (${p.difficulty})`;
  execSync('git add .', { cwd: rootDir });
  execSync(`git commit -m "${commitMsg}"`, { cwd: rootDir });
  console.log(`[${i + 1}/10] Committed: "${commitMsg}"`);
}

console.log('\n🚀 Pushing all 10 commits to GitHub...');
try {
  const pushOutput = execSync('git push origin main', { cwd: rootDir }).toString();
  console.log(pushOutput);
  console.log('\n🎉 Successfully committed and pushed 10 questions to GitHub!');
} catch (err) {
  console.error('Push error:', err.message);
}
