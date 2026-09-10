const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 36,
    title: 'Valid Sudoku',
    folder: '01-arrays-and-hashing',
    fileName: '0036-valid-sudoku.cpp',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    time: 'O(1)',
    space: 'O(1)',
    code: `/**
 * Problem: 36. Valid Sudoku
 * Difficulty: Medium
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/valid-sudoku/
 * 
 * Complexity:
 * - Time: O(1) (fixed 9x9 board)
 * - Space: O(1)
 */

#include <vector>
#include <unordered_set>
#include <string>

using namespace std;

class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        unordered_set<string> seen;
        
        for (int i = 0; i < 9; ++i) {
            for (int j = 0; j < 9; ++j) {
                char c = board[i][j];
                if (c != '.') {
                    string row = string(1, c) + " in row " + to_string(i);
                    string col = string(1, c) + " in col " + to_string(j);
                    string box = string(1, c) + " in box " + to_string(i / 3) + "-" + to_string(j / 3);
                    
                    if (seen.count(row) || seen.count(col) || seen.count(box)) {
                        return false;
                    }
                    
                    seen.insert(row);
                    seen.insert(col);
                    seen.insert(box);
                }
            }
        }
        return true;
    }
};
`
  },
  {
    id: 167,
    title: 'Two Sum II - Input Array Is Sorted',
    folder: '02-two-pointers',
    fileName: '0167-two-sum-ii-input-array-is-sorted.cpp',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 167. Two Sum II - Input Array Is Sorted
 * Difficulty: Medium
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int left = 0, right = numbers.size() - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) {
                return {left + 1, right + 1};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return {};
    }
};
`
  },
  {
    id: 567,
    title: 'Permutation in String',
    folder: '03-sliding-window',
    fileName: '0567-permutation-in-string.cpp',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    time: 'O(l1 + l2)',
    space: 'O(1)',
    code: `/**
 * Problem: 567. Permutation in String
 * Difficulty: Medium
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/permutation-in-string/
 * 
 * Complexity:
 * - Time: O(l1 + l2)
 * - Space: O(1) (26 characters)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        if (s1.length() > s2.length()) return false;
        
        vector<int> count1(26, 0), count2(26, 0);
        for (int i = 0; i < s1.length(); ++i) {
            count1[s1[i] - 'a']++;
            count2[s2[i] - 'a']++;
        }
        
        if (count1 == count2) return true;
        
        for (int i = s1.length(); i < s2.length(); ++i) {
            count2[s2[i] - 'a']++;
            count2[s2[i - s1.length()] - 'a']--;
            if (count1 == count2) return true;
        }
        
        return false;
    }
};
`
  },
  {
    id: 150,
    title: 'Evaluate Reverse Polish Notation',
    folder: '04-stack',
    fileName: '0150-evaluate-reverse-polish-notation.cpp',
    difficulty: 'Medium',
    topic: 'Stack',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 150. Evaluate Reverse Polish Notation
 * Difficulty: Medium
 * Topic: Stack
 * LeetCode Link: https://leetcode.com/problems/evaluate-reverse-polish-notation/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <string>
#include <stack>

using namespace std;

class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        stack<int> st;
        for (const string& token : tokens) {
            if (token == "+" || token == "-" || token == "*" || token == "/") {
                int b = st.top(); st.pop();
                int a = st.top(); st.pop();
                if (token == "+") st.push(a + b);
                else if (token == "-") st.push(a - b);
                else if (token == "*") st.push(a * b);
                else if (token == "/") st.push(a / b);
            } else {
                st.push(stoi(token));
            }
        }
        return st.top();
    }
};
`
  },
  {
    id: 74,
    title: 'Search a 2D Matrix',
    folder: '05-binary-search',
    fileName: '0074-search-a-2d-matrix.cpp',
    difficulty: 'Medium',
    topic: 'Binary Search',
    time: 'O(log(m * n))',
    space: 'O(1)',
    code: `/**
 * Problem: 74. Search a 2D Matrix
 * Difficulty: Medium
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/search-a-2d-matrix/
 * 
 * Complexity:
 * - Time: O(log(m * n))
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int m = matrix.size();
        int n = matrix[0].size();
        int left = 0, right = m * n - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int val = matrix[mid / n][mid % n];
            
            if (val == target) return true;
            if (val < target) left = mid + 1;
            else right = mid - 1;
        }
        return false;
    }
};
`
  },
  {
    id: 19,
    title: 'Remove Nth Node From End of List',
    folder: '06-linked-list',
    fileName: '0019-remove-nth-node-from-end-of-list.cpp',
    difficulty: 'Medium',
    topic: 'Linked List',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 19. Remove Nth Node From End of List
 * Difficulty: Medium
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/remove-nth-node-from-end-of-list/
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
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0, head);
        ListNode* fast = &dummy;
        ListNode* slow = &dummy;
        
        for (int i = 0; i <= n; ++i) {
            fast = fast->next;
        }
        
        while (fast != nullptr) {
            fast = fast->next;
            slow = slow->next;
        }
        
        ListNode* toDelete = slow->next;
        slow->next = slow->next->next;
        delete toDelete;
        
        return dummy.next;
    }
};
`
  },
  {
    id: 572,
    title: 'Subtree of Another Tree',
    folder: '07-trees-and-tries',
    fileName: '0572-subtree-of-another-tree.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(s * t)',
    space: 'O(h)',
    code: `/**
 * Problem: 572. Subtree of Another Tree
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/subtree-of-another-tree/
 * 
 * Complexity:
 * - Time: O(s * t)
 * - Space: O(h)
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
private:
    bool isSame(TreeNode* p, TreeNode* q) {
        if (!p && !q) return true;
        if (!p || !q || p->val != q->val) return false;
        return isSame(p->left, q->left) && isSame(p->right, q->right);
    }
    
public:
    bool isSubtree(TreeNode* root, TreeNode* subRoot) {
        if (!root) return false;
        if (isSame(root, subRoot)) return true;
        return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
    }
};
`
  },
  {
    id: 235,
    title: 'Lowest Common Ancestor of a Binary Search Tree',
    folder: '07-trees-and-tries',
    fileName: '0235-lowest-common-ancestor-of-a-binary-search-tree.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries',
    time: 'O(h)',
    space: 'O(1)',
    code: `/**
 * Problem: 235. Lowest Common Ancestor of a Binary Search Tree
 * Difficulty: Medium
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/
 * 
 * Complexity:
 * - Time: O(h) where h is height of BST
 * - Space: O(1)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        TreeNode* curr = root;
        while (curr) {
            if (p->val > curr->val && q->val > curr->val) {
                curr = curr->right;
            } else if (p->val < curr->val && q->val < curr->val) {
                curr = curr->left;
            } else {
                return curr;
            }
        }
        return nullptr;
    }
};
`
  },
  {
    id: 78,
    title: 'Subsets',
    folder: '09-backtracking',
    fileName: '0078-subsets.cpp',
    difficulty: 'Medium',
    topic: 'Recursion & Backtracking',
    time: 'O(n * 2^n)',
    space: 'O(n)',
    code: `/**
 * Problem: 78. Subsets
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/subsets/
 * 
 * Complexity:
 * - Time: O(n * 2^n)
 * - Space: O(n)
 */

#include <vector>

using namespace std;

class Solution {
private:
    void backtrack(int index, vector<int>& nums, vector<int>& current, vector<vector<int>>& result) {
        result.push_back(current);
        
        for (int i = index; i < nums.size(); ++i) {
            current.push_back(nums[i]);
            backtrack(i + 1, nums, current, result);
            current.pop_back();
        }
    }
    
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> current;
        backtrack(0, nums, current, result);
        return result;
    }
};
`
  },
  {
    id: 39,
    title: 'Combination Sum',
    folder: '09-backtracking',
    fileName: '0039-combination-sum.cpp',
    difficulty: 'Medium',
    topic: 'Recursion & Backtracking',
    time: 'O(2^t)',
    space: 'O(t/min)',
    code: `/**
 * Problem: 39. Combination Sum
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/combination-sum/
 * 
 * Complexity:
 * - Time: O(2^t) where t is target value
 * - Space: O(t)
 */

#include <vector>

using namespace std;

class Solution {
private:
    void backtrack(int index, int target, vector<int>& candidates, vector<int>& current, vector<vector<int>>& result) {
        if (target == 0) {
            result.push_back(current);
            return;
        }
        if (target < 0 || index >= candidates.size()) return;
        
        // Option 1: Include candidate[index]
        current.push_back(candidates[index]);
        backtrack(index, target - candidates[index], candidates, current, result);
        current.pop_back();
        
        // Option 2: Skip candidate[index]
        backtrack(index + 1, target, candidates, current, result);
    }
    
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        vector<vector<int>> result;
        vector<int> current;
        backtrack(0, target, candidates, current, result);
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
