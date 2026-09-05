const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 295,
    title: 'Find Median from Data Stream',
    folder: '08-heap-priority-queue',
    fileName: '0295-find-median-from-data-stream.cpp',
    difficulty: 'Hard',
    topic: 'Heap / Priority Queue',
    time: 'O(log n) add, O(1) find',
    space: 'O(n)',
    code: `/**
 * Problem: 295. Find Median from Data Stream
 * Difficulty: Hard
 * Topic: Heap / Priority Queue (Two Heaps)
 * LeetCode Link: https://leetcode.com/problems/find-median-from-data-stream/
 * 
 * Complexity:
 * - Time: O(log n) for addNum, O(1) for findMedian
 * - Space: O(n)
 */

#include <queue>
#include <vector>

using namespace std;

class MedianFinder {
private:
    priority_queue<int> maxHeap; // stores smaller half
    priority_queue<int, vector<int>, greater<int>> minHeap; // stores larger half

public:
    MedianFinder() {}

    void addNum(int num) {
        maxHeap.push(num);
        minHeap.push(maxHeap.top());
        maxHeap.pop();

        if (maxHeap.size() < minHeap.size()) {
            maxHeap.push(minHeap.top());
            minHeap.pop();
        }
    }

    double findMedian() {
        if (maxHeap.size() > minHeap.size()) {
            return maxHeap.top();
        }
        return (maxHeap.top() + minHeap.top()) / 2.0;
    }
};
`
  },
  {
    id: 23,
    title: 'Merge k Sorted Lists',
    folder: '06-linked-list',
    fileName: '0023-merge-k-sorted-lists.cpp',
    difficulty: 'Hard',
    topic: 'Linked List',
    time: 'O(N log k)',
    space: 'O(k)',
    code: `/**
 * Problem: 23. Merge k Sorted Lists
 * Difficulty: Hard
 * Topic: Linked List (Min-Heap / Priority Queue)
 * LeetCode Link: https://leetcode.com/problems/merge-k-sorted-lists/
 * 
 * Complexity:
 * - Time: O(N log k) where N is total nodes and k is number of linked lists
 * - Space: O(k) min-heap space
 */

#include <vector>
#include <queue>

using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

class Solution {
private:
    struct Compare {
        bool operator()(ListNode* a, ListNode* b) {
            return a->val > b->val;
        }
    };

public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        priority_queue<ListNode*, vector<ListNode*>, Compare> minHeap;

        for (ListNode* list : lists) {
            if (list) minHeap.push(list);
        }

        ListNode dummy(0);
        ListNode* tail = &dummy;

        while (!minHeap.empty()) {
            ListNode* node = minHeap.top();
            minHeap.pop();

            tail->next = node;
            tail = tail->next;

            if (node->next) {
                minHeap.push(node->next);
            }
        }

        return dummy.next;
    }
};
`
  },
  {
    id: 42,
    title: 'Trapping Rain Water',
    folder: '02-two-pointers',
    fileName: '0042-trapping-rain-water.cpp',
    difficulty: 'Hard',
    topic: 'Two Pointers',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 42. Trapping Rain Water
 * Difficulty: Hard
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/trapping-rain-water/
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
    int trap(vector<int>& height) {
        if (height.empty()) return 0;

        int left = 0, right = height.size() - 1;
        int leftMax = height[left], rightMax = height[right];
        int water = 0;

        while (left < right) {
            if (leftMax < rightMax) {
                left++;
                leftMax = max(leftMax, height[left]);
                water += leftMax - height[left];
            } else {
                right--;
                rightMax = max(rightMax, height[right]);
                water += rightMax - height[right];
            }
        }

        return water;
    }
};
`
  },
  {
    id: 84,
    title: 'Largest Rectangle in Histogram',
    folder: '04-stack',
    fileName: '0084-largest-rectangle-in-histogram.cpp',
    difficulty: 'Hard',
    topic: 'Stack',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 84. Largest Rectangle in Histogram
 * Difficulty: Hard
 * Topic: Stack (Monotonic Stack)
 * LeetCode Link: https://leetcode.com/problems/largest-rectangle-in-histogram/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <stack>
#include <algorithm>

using namespace std;

class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        int n = heights.size();
        stack<int> st;
        int maxArea = 0;

        for (int i = 0; i <= n; ++i) {
            int h = (i == n) ? 0 : heights[i];
            while (!st.empty() && h < heights[st.top()]) {
                int height = heights[st.top()];
                st.pop();
                int width = st.empty() ? i : i - st.top() - 1;
                maxArea = max(maxArea, height * width);
            }
            st.push(i);
        }

        return maxArea;
    }
};
`
  },
  {
    id: 76,
    title: 'Minimum Window Substring',
    folder: '03-sliding-window',
    fileName: '0076-minimum-window-substring.cpp',
    difficulty: 'Hard',
    topic: 'Sliding Window',
    time: 'O(m + n)',
    space: 'O(k)',
    code: `/**
 * Problem: 76. Minimum Window Substring
 * Difficulty: Hard
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/minimum-window-substring/
 * 
 * Complexity:
 * - Time: O(m + n)
 * - Space: O(k) where k is size of alphabet
 */

#include <string>
#include <vector>
#include <climits>

using namespace std;

class Solution {
public:
    string minWindow(string s, string t) {
        if (s.empty() || t.empty()) return "";

        vector<int> targetCount(128, 0);
        for (char c : t) targetCount[c]++;

        int required = 0;
        for (int c : targetCount) if (c > 0) required++;

        int left = 0, right = 0, formed = 0;
        vector<int> windowCount(128, 0);

        int minLen = INT_MAX, startIdx = 0;

        while (right < s.length()) {
            char c = s[right];
            windowCount[c]++;

            if (targetCount[c] > 0 && windowCount[c] == targetCount[c]) {
                formed++;
            }

            while (left <= right && formed == required) {
                c = s[left];

                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    startIdx = left;
                }

                windowCount[c]--;
                if (targetCount[c] > 0 && windowCount[c] < targetCount[c]) {
                    formed--;
                }
                left++;
            }
            right++;
        }

        return minLen == INT_MAX ? "" : s.substr(startIdx, minLen);
    }
};
`
  },
  {
    id: 239,
    title: 'Sliding Window Maximum',
    folder: '03-sliding-window',
    fileName: '0239-sliding-window-maximum.cpp',
    difficulty: 'Hard',
    topic: 'Sliding Window',
    time: 'O(n)',
    space: 'O(k)',
    code: `/**
 * Problem: 239. Sliding Window Maximum
 * Difficulty: Hard
 * Topic: Sliding Window (Monotonic Deque)
 * LeetCode Link: https://leetcode.com/problems/sliding-window-maximum/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(k) deque space
 */

#include <vector>
#include <deque>

using namespace std;

class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> dq; // stores indices
        vector<int> result;

        for (int i = 0; i < nums.size(); ++i) {
            // Remove indices that are out of the current window
            if (!dq.empty() && dq.front() == i - k) {
                dq.pop_front();
            }

            // Remove smaller elements from back of deque
            while (!dq.empty() && nums[dq.back()] < nums[i]) {
                dq.pop_back();
            }

            dq.push_back(i);

            if (i >= k - 1) {
                result.push_back(nums[dq.front()]);
            }
        }

        return result;
    }
};
`
  },
  {
    id: 124,
    title: 'Binary Tree Maximum Path Sum',
    folder: '07-trees-and-tries',
    fileName: '0124-binary-tree-maximum-path-sum.cpp',
    difficulty: 'Hard',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 124. Binary Tree Maximum Path Sum
 * Difficulty: Hard
 * Topic: Trees & Tries (Postorder DFS)
 * LeetCode Link: https://leetcode.com/problems/binary-tree-maximum-path-sum/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(h) recursion stack
 */

#include <algorithm>
#include <climits>

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
    int maxSum = INT_MIN;

    int maxGain(TreeNode* node) {
        if (!node) return 0;

        int leftGain = max(maxGain(node->left), 0);
        int rightGain = max(maxGain(node->right), 0);

        int currentPathSum = node->val + leftGain + rightGain;
        maxSum = max(maxSum, currentPathSum);

        return node->val + max(leftGain, rightGain);
    }

public:
    int maxPathSum(TreeNode* root) {
        maxGain(root);
        return maxSum;
    }
};
`
  },
  {
    id: 297,
    title: 'Serialize and Deserialize Binary Tree',
    folder: '07-trees-and-tries',
    fileName: '0297-serialize-and-deserialize-binary-tree.cpp',
    difficulty: 'Hard',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 297. Serialize and Deserialize Binary Tree
 * Difficulty: Hard
 * Topic: Trees & Tries (Preorder Traversal)
 * LeetCode Link: https://leetcode.com/problems/serialize-and-deserialize-binary-tree/
 * 
 * Complexity:
 * - Time: O(n) for both serialize and deserialize
 * - Space: O(n)
 */

#include <string>
#include <sstream>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Codec {
private:
    void serializeHelper(TreeNode* root, ostringstream& out) {
        if (!root) {
            out << "# ";
            return;
        }
        out << root->val << " ";
        serializeHelper(root->left, out);
        serializeHelper(root->right, out);
    }

    TreeNode* deserializeHelper(istringstream& in) {
        string val;
        in >> val;
        if (val == "#") return nullptr;

        TreeNode* root = new TreeNode(stoi(val));
        root->left = deserializeHelper(in);
        root->right = deserializeHelper(in);
        return root;
    }

public:
    string serialize(TreeNode* root) {
        ostringstream out;
        serializeHelper(root, out);
        return out.str();
    }

    TreeNode* deserialize(string data) {
        istringstream in(data);
        return deserializeHelper(in);
    }
};
`
  },
  {
    id: 127,
    title: 'Word Ladder',
    folder: '10-graphs',
    fileName: '0127-word-ladder.cpp',
    difficulty: 'Hard',
    topic: 'Graphs',
    time: 'O(M^2 * N)',
    space: 'O(M * N)',
    code: `/**
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
`
  },
  {
    id: 269,
    title: 'Alien Dictionary',
    folder: '10-graphs',
    fileName: '0269-alien-dictionary.cpp',
    difficulty: 'Hard',
    topic: 'Graphs',
    time: 'O(C)',
    space: 'O(1)',
    code: `/**
 * Problem: 269. Alien Dictionary
 * Difficulty: Hard
 * Topic: Graphs (Topological Sort / Kahn's Algorithm)
 * LeetCode Link: https://leetcode.com/problems/alien-dictionary/
 * 
 * Complexity:
 * - Time: O(C) where C is total length of all words
 * - Space: O(1) (at most 26 unique characters)
 */

#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <algorithm>

using namespace std;

class Solution {
public:
    string alienOrder(vector<string>& words) {
        unordered_map<char, unordered_set<char>> adj;
        unordered_map<char, int> inDegree;

        for (const string& w : words) {
            for (char c : w) {
                inDegree[c] = 0;
            }
        }

        for (int i = 0; i < words.size() - 1; ++i) {
            string w1 = words[i], w2 = words[i + 1];
            if (w1.length() > w2.length() && w1.rfind(w2, 0) == 0) {
                return ""; // invalid prefix order
            }

            int minLen = min(w1.length(), w2.length());
            for (int j = 0; j < minLen; ++j) {
                if (w1[j] != w2[j]) {
                    if (!adj[w1[j]].count(w2[j])) {
                        adj[w1[j]].insert(w2[j]);
                        inDegree[w2[j]]++;
                    }
                    break;
                }
            }
        }

        queue<char> q;
        for (auto& [c, deg] : inDegree) {
            if (deg == 0) q.push(c);
        }

        string result = "";
        while (!q.empty()) {
            char c = q.front();
            q.pop();
            result += c;

            for (char neighbor : adj[c]) {
                if (--inDegree[neighbor] == 0) {
                    q.push(neighbor);
                }
            }
        }

        return result.length() == inDegree.size() ? result : "";
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
  execSync(`git add "${relFilePath}" solutions/README.md scripts/commit-batch-13.js`, { cwd: rootDir });
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
