const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 287,
    title: 'Find the Duplicate Number',
    folder: '06-linked-list',
    fileName: '0287-find-the-duplicate-number.cpp',
    difficulty: 'Medium',
    topic: 'Linked List',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 287. Find the Duplicate Number
 * Difficulty: Medium
 * Topic: Linked List (Floyd's Tortoise and Hare)
 * LeetCode Link: https://leetcode.com/problems/find-the-duplicate-number/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int slow = nums[0];
        int fast = nums[0];

        // 1. Detect cycle
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);

        // 2. Find entrance to the cycle
        slow = nums[0];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }

        return slow;
    }
};
`
  },
  {
    id: 2,
    title: 'Add Two Numbers',
    folder: '06-linked-list',
    fileName: '0002-add-two-numbers.cpp',
    difficulty: 'Medium',
    topic: 'Linked List',
    time: 'O(max(n, m))',
    space: 'O(max(n, m))',
    code: `/**
 * Problem: 2. Add Two Numbers
 * Difficulty: Medium
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/add-two-numbers/
 * 
 * Complexity:
 * - Time: O(max(N, M))
 * - Space: O(max(N, M))
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
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode dummy(0);
        ListNode* curr = &dummy;
        int carry = 0;

        while (l1 != nullptr || l2 != nullptr || carry != 0) {
            int sum = carry;
            if (l1 != nullptr) {
                sum += l1->val;
                l1 = l1->next;
            }
            if (l2 != nullptr) {
                sum += l2->val;
                l2 = l2->next;
            }

            carry = sum / 10;
            curr->next = new ListNode(sum % 10);
            curr = curr->next;
        }

        return dummy.next;
    }
};
`
  },
  {
    id: 138,
    title: 'Copy List with Random Pointer',
    folder: '06-linked-list',
    fileName: '0138-copy-list-with-random-pointer.cpp',
    difficulty: 'Medium',
    topic: 'Linked List',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 138. Copy List with Random Pointer
 * Difficulty: Medium
 * Topic: Linked List (Interweaving Nodes)
 * LeetCode Link: https://leetcode.com/problems/copy-list-with-random-pointer/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) auxiliary space
 */

class Node {
public:
    int val;
    Node* next;
    Node* random;
    Node(int _val) {
        val = _val;
        next = nullptr;
        random = nullptr;
    }
};

class Solution {
public:
    Node* copyRandomList(Node* head) {
        if (!head) return nullptr;

        // 1. Interweave cloned nodes with original nodes
        Node* curr = head;
        while (curr) {
            Node* clone = new Node(curr->val);
            clone->next = curr->next;
            curr->next = clone;
            curr = clone->next;
        }

        // 2. Assign random pointers for cloned nodes
        curr = head;
        while (curr) {
            if (curr->random) {
                curr->next->random = curr->random->next;
            }
            curr = curr->next->next;
        }

        // 3. Separate the two lists
        curr = head;
        Node* clonedHead = head->next;
        Node* clonedCurr = clonedHead;

        while (curr) {
            curr->next = curr->next->next;
            clonedCurr->next = clonedCurr->next ? clonedCurr->next->next : nullptr;
            curr = curr->next;
            clonedCurr = clonedCurr->next;
        }

        return clonedHead;
    }
};
`
  },
  {
    id: 148,
    title: 'Sort List',
    folder: '06-linked-list',
    fileName: '0148-sort-list.cpp',
    difficulty: 'Medium',
    topic: 'Linked List',
    time: 'O(n log n)',
    space: 'O(log n)',
    code: `/**
 * Problem: 148. Sort List
 * Difficulty: Medium
 * Topic: Linked List (Merge Sort)
 * LeetCode Link: https://leetcode.com/problems/sort-list/
 * 
 * Complexity:
 * - Time: O(n log n)
 * - Space: O(log n) recursion stack
 */

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

class Solution {
private:
    ListNode* merge(ListNode* l1, ListNode* l2) {
        ListNode dummy(0);
        ListNode* tail = &dummy;

        while (l1 && l2) {
            if (l1->val < l2->val) {
                tail->next = l1;
                l1 = l1->next;
            } else {
                tail->next = l2;
                l2 = l2->next;
            }
            tail = tail->next;
        }
        tail->next = l1 ? l1 : l2;
        return dummy.next;
    }

public:
    ListNode* sortList(ListNode* head) {
        if (!head || !head->next) return head;

        ListNode* prev = nullptr;
        ListNode* slow = head;
        ListNode* fast = head;

        while (fast && fast->next) {
            prev = slow;
            slow = slow->next;
            fast = fast->next->next;
        }

        prev->next = nullptr; // divide into two halves

        ListNode* left = sortList(head);
        ListNode* right = sortList(slow);

        return merge(left, right);
    }
};
`
  },
  {
    id: 543,
    title: 'Diameter of Binary Tree',
    folder: '07-trees-and-tries',
    fileName: '0543-diameter-of-binary-tree.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 543. Diameter of Binary Tree
 * Difficulty: Easy
 * Topic: Trees & Tries (DFS)
 * LeetCode Link: https://leetcode.com/problems/diameter-of-binary-tree/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(h) recursion stack
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
private:
    int maxDiameter = 0;

    int depth(TreeNode* node) {
        if (!node) return 0;
        int left = depth(node->left);
        int right = depth(node->right);
        maxDiameter = max(maxDiameter, left + right);
        return 1 + max(left, right);
    }

public:
    int diameterOfBinaryTree(TreeNode* root) {
        maxDiameter = 0;
        depth(root);
        return maxDiameter;
    }
};
`
  },
  {
    id: 110,
    title: 'Balanced Binary Tree',
    folder: '07-trees-and-tries',
    fileName: '0110-balanced-binary-tree.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 110. Balanced Binary Tree
 * Difficulty: Easy
 * Topic: Trees & Tries (Bottom-Up DFS)
 * LeetCode Link: https://leetcode.com/problems/balanced-binary-tree/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

#include <algorithm>
#include <cmath>

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
private:
    int checkHeight(TreeNode* node) {
        if (!node) return 0;

        int left = checkHeight(node->left);
        if (left == -1) return -1;

        int right = checkHeight(node->right);
        if (right == -1) return -1;

        if (abs(left - right) > 1) return -1;
        return 1 + max(left, right);
    }

public:
    bool isBalanced(TreeNode* root) {
        return checkHeight(root) != -1;
    }
};
`
  },
  {
    id: 199,
    title: 'Binary Tree Right Side View',
    folder: '07-trees-and-tries',
    fileName: '0199-binary-tree-right-side-view.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 199. Binary Tree Right Side View
 * Difficulty: Medium
 * Topic: Trees & Tries (BFS / Level Order)
 * LeetCode Link: https://leetcode.com/problems/binary-tree-right-side-view/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n) queue space
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
    vector<int> rightSideView(TreeNode* root) {
        vector<int> result;
        if (!root) return result;

        queue<TreeNode*> q;
        q.push(root);

        while (!q.empty()) {
            int levelSize = q.size();
            for (int i = 0; i < levelSize; ++i) {
                TreeNode* node = q.front();
                q.pop();

                if (i == levelSize - 1) {
                    result.push_back(node->val);
                }

                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
        }

        return result;
    }
};
`
  },
  {
    id: 1448,
    title: 'Count Good Nodes in Binary Tree',
    folder: '07-trees-and-tries',
    fileName: '1448-count-good-nodes-in-binary-tree.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 1448. Count Good Nodes in Binary Tree
 * Difficulty: Medium
 * Topic: Trees & Tries (DFS Preorder)
 * LeetCode Link: https://leetcode.com/problems/count-good-nodes-in-binary-tree/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(h) recursion stack
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
private:
    int dfs(TreeNode* node, int maxVal) {
        if (!node) return 0;

        int good = 0;
        if (node->val >= maxVal) {
            good = 1;
            maxVal = node->val;
        }

        return good + dfs(node->left, maxVal) + dfs(node->right, maxVal);
    }

public:
    int goodNodes(TreeNode* root) {
        if (!root) return 0;
        return dfs(root, root->val);
    }
};
`
  },
  {
    id: 973,
    title: 'K Closest Points to Origin',
    folder: '08-heap-priority-queue',
    fileName: '0973-k-closest-points-to-origin.cpp',
    difficulty: 'Medium',
    topic: 'Heap / Priority Queue',
    time: 'O(n log k)',
    space: 'O(k)',
    code: `/**
 * Problem: 973. K Closest Points to Origin
 * Difficulty: Medium
 * Topic: Heap / Priority Queue (Max-Heap)
 * LeetCode Link: https://leetcode.com/problems/k-closest-points-to-origin/
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
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        // Max-heap storing pair<distanceSquared, index>
        priority_queue<pair<int, int>> maxHeap;

        for (int i = 0; i < points.size(); ++i) {
            int distSq = points[i][0] * points[i][0] + points[i][1] * points[i][1];
            maxHeap.push({distSq, i});
            if (maxHeap.size() > k) {
                maxHeap.pop();
            }
        }

        vector<vector<int>> result;
        while (!maxHeap.empty()) {
            result.push_back(points[maxHeap.top().second]);
            maxHeap.pop();
        }

        return result;
    }
};
`
  },
  {
    id: 703,
    title: 'Kth Largest Element in a Stream',
    folder: '08-heap-priority-queue',
    fileName: '0703-kth-largest-element-in-a-stream.cpp',
    difficulty: 'Easy',
    topic: 'Heap / Priority Queue',
    time: 'O(log k) per add',
    space: 'O(k)',
    code: `/**
 * Problem: 703. Kth Largest Element in a Stream
 * Difficulty: Easy
 * Topic: Heap / Priority Queue (Min-Heap of size k)
 * LeetCode Link: https://leetcode.com/problems/kth-largest-element-in-a-stream/
 * 
 * Complexity:
 * - Time: O(log k) per add
 * - Space: O(k)
 */

#include <vector>
#include <queue>

using namespace std;

class KthLargest {
private:
    int k;
    priority_queue<int, vector<int>, greater<int>> minHeap;

public:
    KthLargest(int k, vector<int>& nums) : k(k) {
        for (int num : nums) {
            add(num);
        }
    }

    int add(int val) {
        minHeap.push(val);
        if (minHeap.size() > k) {
            minHeap.pop();
        }
        return minHeap.top();
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

  const relFilePath = path.join('solutions', p.folder, p.fileName);
  const commitMsg = `feat(solutions): add ${p.id}. ${p.title} (${p.difficulty})`;

  // Strictly stage only this solution file, solutions/README.md, and this batch script
  execSync(`git add "${relFilePath}" solutions/README.md scripts/commit-batch-10.js`, { cwd: rootDir });
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
