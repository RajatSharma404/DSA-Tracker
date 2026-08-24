const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sync = require('./sync-solutions');

const problems = [
  {
    id: 1,
    title: 'Two Sum',
    folder: '01-arrays-and-hashing',
    fileName: '0001-two-sum.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 1. Two Sum
 * Difficulty: Easy
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/two-sum/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};
`
  },
  {
    id: 217,
    title: 'Contains Duplicate',
    folder: '01-arrays-and-hashing',
    fileName: '0217-contains-duplicate.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 217. Contains Duplicate
 * Difficulty: Easy
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/contains-duplicate/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <unordered_set>

using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int num : nums) {
            if (seen.count(num)) return true;
            seen.insert(num);
        }
        return false;
    }
};
`
  },
  {
    id: 242,
    title: 'Valid Anagram',
    folder: '01-arrays-and-hashing',
    fileName: '0242-valid-anagram.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 242. Valid Anagram
 * Difficulty: Easy
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/valid-anagram/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.length() != t.length()) return false;
        vector<int> count(26, 0);
        for (int i = 0; i < s.length(); ++i) {
            count[s[i] - 'a']++;
            count[t[i] - 'a']--;
        }
        for (int c : count) {
            if (c != 0) return false;
        }
        return true;
    }
};
`
  },
  {
    id: 125,
    title: 'Valid Palindrome',
    folder: '02-two-pointers',
    fileName: '0125-valid-palindrome.cpp',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 125. Valid Palindrome
 * Difficulty: Easy
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/valid-palindrome/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>
#include <cctype>

using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !isalnum(s[left])) left++;
            while (left < right && !isalnum(s[right])) right--;
            if (tolower(s[left]) != tolower(s[right])) return false;
            left++;
            right--;
        }
        return true;
    }
};
`
  },
  {
    id: 20,
    title: 'Valid Parentheses',
    folder: '04-stack',
    fileName: '0020-valid-parentheses.cpp',
    difficulty: 'Easy',
    topic: 'Stack',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 20. Valid Parentheses
 * Difficulty: Easy
 * Topic: Stack
 * LeetCode Link: https://leetcode.com/problems/valid-parentheses/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <string>
#include <stack>
#include <unordered_map>

using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        unordered_map<char, char> matching = {
            {')', '('},
            {']', '['},
            {'}', '{'}
        };
        for (char c : s) {
            if (matching.count(c)) {
                if (st.empty() || st.top() != matching[c]) return false;
                st.pop();
            } else {
                st.push(c);
            }
        }
        return st.empty();
    }
};
`
  },
  {
    id: 704,
    title: 'Binary Search',
    folder: '05-binary-search',
    fileName: '0704-binary-search.cpp',
    difficulty: 'Easy',
    topic: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    code: `/**
 * Problem: 704. Binary Search
 * Difficulty: Easy
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/binary-search/
 * 
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};
`
  },
  {
    id: 206,
    title: 'Reverse Linked List',
    folder: '06-linked-list',
    fileName: '0206-reverse-linked-list.cpp',
    difficulty: 'Easy',
    topic: 'Linked List',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 206. Reverse Linked List
 * Difficulty: Easy
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/reverse-linked-list/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr != nullptr) {
            ListNode* nextTemp = curr->next;
            curr->next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
};
`
  },
  {
    id: 121,
    title: 'Best Time to Buy and Sell Stock',
    folder: '03-sliding-window',
    fileName: '0121-best-time-to-buy-and-sell-stock.cpp',
    difficulty: 'Easy',
    topic: 'Sliding Window',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 121. Best Time to Buy and Sell Stock
 * Difficulty: Easy
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/best-time-to-buy-and-sell-stock/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = 1e9;
        int maxProfit = 0;
        for (int price : prices) {
            minPrice = min(minPrice, price);
            maxProfit = max(maxProfit, price - minPrice);
        }
        return maxProfit;
    }
};
`
  },
  {
    id: 226,
    title: 'Invert Binary Tree',
    folder: '07-trees-and-tries',
    fileName: '0226-invert-binary-tree.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 226. Invert Binary Tree
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/invert-binary-tree/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

#include <algorithm>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        swap(root->left, root->right);
        invertTree(root->left);
        invertTree(root->right);
        return root;
    }
};
`
  },
  {
    id: 70,
    title: 'Climbing Stairs',
    folder: '11-dynamic-programming',
    fileName: '0070-climbing-stairs.cpp',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 70. Climbing Stairs
 * Difficulty: Easy
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/climbing-stairs/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; ++i) {
            int current = prev1 + prev2;
            prev2 = prev1;
            prev1 = current;
        }
        return prev1;
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

console.log('\n🎉 Successfully committed 10 questions in 10 individual commits!');
