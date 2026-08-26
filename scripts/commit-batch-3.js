const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 238,
    title: 'Product of Array Except Self',
    folder: '01-arrays-and-hashing',
    fileName: '0238-product-of-array-except-self.cpp',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1) excluding output',
    code: `/**
 * Problem: 238. Product of Array Except Self
 * Difficulty: Medium
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/product-of-array-except-self/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) auxiliary space (excluding return vector)
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> result(n, 1);
        
        int prefix = 1;
        for (int i = 0; i < n; ++i) {
            result[i] = prefix;
            prefix *= nums[i];
        }
        
        int suffix = 1;
        for (int i = n - 1; i >= 0; --i) {
            result[i] *= suffix;
            suffix *= nums[i];
        }
        
        return result;
    }
};
`
  },
  {
    id: 128,
    title: 'Longest Consecutive Sequence',
    folder: '01-arrays-and-hashing',
    fileName: '0128-longest-consecutive-sequence.cpp',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 128. Longest Consecutive Sequence
 * Difficulty: Medium
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/longest-consecutive-sequence/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <unordered_set>
#include <algorithm>

using namespace std;

class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> numSet(nums.begin(), nums.end());
        int longestStreak = 0;
        
        for (int num : numSet) {
            // Check if it's the start of a sequence
            if (!numSet.count(num - 1)) {
                int currentNum = num;
                int currentStreak = 1;
                
                while (numSet.count(currentNum + 1)) {
                    currentNum++;
                    currentStreak++;
                }
                longestStreak = max(longestStreak, currentStreak);
            }
        }
        return longestStreak;
    }
};
`
  },
  {
    id: 424,
    title: 'Longest Repeating Character Replacement',
    folder: '03-sliding-window',
    fileName: '0424-longest-repeating-character-replacement.cpp',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
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
`
  },
  {
    id: 739,
    title: 'Daily Temperatures',
    folder: '04-stack',
    fileName: '0739-daily-temperatures.cpp',
    difficulty: 'Medium',
    topic: 'Stack',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 739. Daily Temperatures
 * Difficulty: Medium
 * Topic: Stack (Monotonic Stack)
 * LeetCode Link: https://leetcode.com/problems/daily-temperatures/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <stack>

using namespace std;

class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> result(n, 0);
        stack<int> st; // stores indices
        
        for (int i = 0; i < n; ++i) {
            while (!st.empty() && temperatures[i] > temperatures[st.top()]) {
                int prevIdx = st.top();
                st.pop();
                result[prevIdx] = i - prevIdx;
            }
            st.push(i);
        }
        return result;
    }
};
`
  },
  {
    id: 875,
    title: 'Koko Eating Bananas',
    folder: '05-binary-search',
    fileName: '0875-koko-eating-bananas.cpp',
    difficulty: 'Medium',
    topic: 'Binary Search',
    time: 'O(n log(maxP))',
    space: 'O(1)',
    code: `/**
 * Problem: 875. Koko Eating Bananas
 * Difficulty: Medium
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/koko-eating-bananas/
 * 
 * Complexity:
 * - Time: O(n log(max(piles)))
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int left = 1;
        int right = *max_element(piles.begin(), piles.end());
        int ans = right;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            long long hoursNeeded = 0;
            for (int pile : piles) {
                hoursNeeded += (pile + mid - 1LL) / mid;
            }
            
            if (hoursNeeded <= h) {
                ans = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return ans;
    }
};
`
  },
  {
    id: 21,
    title: 'Merge Two Sorted Lists',
    folder: '06-linked-list',
    fileName: '0021-merge-two-sorted-lists.cpp',
    difficulty: 'Easy',
    topic: 'Linked List',
    time: 'O(n + m)',
    space: 'O(1)',
    code: `/**
 * Problem: 21. Merge Two Sorted Lists
 * Difficulty: Easy
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/merge-two-sorted-lists/
 * 
 * Complexity:
 * - Time: O(n + m)
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
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                tail->next = list1;
                list1 = list1->next;
            } else {
                tail->next = list2;
                list2 = list2->next;
            }
            tail = tail->next;
        }
        
        tail->next = list1 ? list1 : list2;
        return dummy.next;
    }
};
`
  },
  {
    id: 143,
    title: 'Reorder List',
    folder: '06-linked-list',
    fileName: '0143-reorder-list.cpp',
    difficulty: 'Medium',
    topic: 'Linked List',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 143. Reorder List
 * Difficulty: Medium
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/reorder-list/
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
    void reorderList(ListNode* head) {
        if (!head || !head->next) return;
        
        // 1. Find middle of list
        ListNode* slow = head;
        ListNode* fast = head->next;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        
        // 2. Reverse second half
        ListNode* second = slow->next;
        slow->next = nullptr;
        ListNode* prev = nullptr;
        while (second) {
            ListNode* tmp = second->next;
            second->next = prev;
            prev = second;
            second = tmp;
        }
        
        // 3. Merge two halves
        ListNode* first = head;
        second = prev;
        while (second) {
            ListNode* tmp1 = first->next;
            ListNode* tmp2 = second->next;
            first->next = second;
            second->next = tmp1;
            first = tmp1;
            second = tmp2;
        }
    }
};
`
  },
  {
    id: 100,
    title: 'Same Tree',
    folder: '07-trees-and-tries',
    fileName: '0100-same-tree.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(p + q)',
    space: 'O(h)',
    code: `/**
 * Problem: 100. Same Tree
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/same-tree/
 * 
 * Complexity:
 * - Time: O(N) where N is the number of nodes
 * - Space: O(h) where h is the tree height
 */

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
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p && !q) return true;
        if (!p || !q || p->val != q->val) return false;
        return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};
`
  },
  {
    id: 102,
    title: 'Binary Tree Level Order Traversal',
    folder: '07-trees-and-tries',
    fileName: '0102-binary-tree-level-order-traversal.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 102. Binary Tree Level Order Traversal
 * Difficulty: Medium
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/binary-tree-level-order-traversal/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <queue>

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
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> result;
        if (!root) return result;
        
        queue<TreeNode*> q;
        q.push(root);
        
        while (!q.empty()) {
            int levelSize = q.size();
            vector<int> currentLevel;
            
            for (int i = 0; i < levelSize; ++i) {
                TreeNode* node = q.front();
                q.pop();
                currentLevel.push_back(node->val);
                
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            result.push_back(currentLevel);
        }
        return result;
    }
};
`
  },
  {
    id: 200,
    title: 'Number of Islands',
    folder: '10-graphs',
    fileName: '0200-number-of-islands.cpp',
    difficulty: 'Medium',
    topic: 'Graphs',
    time: 'O(M * N)',
    space: 'O(M * N)',
    code: `/**
 * Problem: 200. Number of Islands
 * Difficulty: Medium
 * Topic: Graphs
 * LeetCode Link: https://leetcode.com/problems/number-of-islands/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M * N) recursion stack
 */

#include <vector>

using namespace std;

class Solution {
private:
    void dfs(vector<vector<char>>& grid, int r, int c) {
        int rows = grid.size();
        int cols = grid[0].size();
        
        if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] != '1') {
            return;
        }
        
        grid[r][c] = '0'; // mark as visited
        
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }
    
public:
    int numIslands(vector<vector<char>>& grid) {
        if (grid.empty()) return 0;
        int count = 0;
        
        for (int r = 0; r < grid.size(); ++r) {
            for (int c = 0; c < grid[0].size(); ++c) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
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
