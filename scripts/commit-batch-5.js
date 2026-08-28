const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 271,
    title: 'Encode and Decode Strings',
    folder: '01-arrays-and-hashing',
    fileName: '0271-encode-and-decode-strings.cpp',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 271. Encode and Decode Strings
 * Difficulty: Medium
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/encode-and-decode-strings/
 * 
 * Complexity:
 * - Time: O(n) for both encode and decode
 * - Space: O(1) auxiliary space
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    string encode(vector<string>& strs) {
        string encoded = "";
        for (const string& s : strs) {
            encoded += to_string(s.length()) + "#" + s;
        }
        return encoded;
    }

    vector<string> decode(string s) {
        vector<string> result;
        int i = 0;
        while (i < s.length()) {
            int j = i;
            while (s[j] != '#') {
                j++;
            }
            int length = stoi(s.substr(i, j - i));
            string str = s.substr(j + 1, length);
            result.push_back(str);
            i = j + 1 + length;
        }
        return result;
    }
};
`
  },
  {
    id: 153,
    title: 'Find Minimum in Rotated Sorted Array',
    folder: '05-binary-search',
    fileName: '0153-find-minimum-in-rotated-sorted-array.cpp',
    difficulty: 'Medium',
    topic: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    code: `/**
 * Problem: 153. Find Minimum in Rotated Sorted Array
 * Difficulty: Medium
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/
 * 
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int findMin(vector<int>& nums) {
        int left = 0, right = nums.size() - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return nums[left];
    }
};
`
  },
  {
    id: 98,
    title: 'Validate Binary Search Tree',
    folder: '07-trees-and-tries',
    fileName: '0098-validate-binary-search-tree.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 98. Validate Binary Search Tree
 * Difficulty: Medium
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/validate-binary-search-tree/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(h) recursion stack
 */

#include <climits>

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
    bool validate(TreeNode* node, long minVal, long maxVal) {
        if (!node) return true;
        if (node->val <= minVal || node->val >= maxVal) return false;
        return validate(node->left, minVal, node->val) && validate(node->right, node->val, maxVal);
    }

public:
    bool isValidBST(TreeNode* root) {
        return validate(root, LONG_MIN, LONG_MAX);
    }
};
`
  },
  {
    id: 230,
    title: 'Kth Smallest Element in a BST',
    folder: '07-trees-and-tries',
    fileName: '0230-kth-smallest-element-in-a-bst.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries',
    time: 'O(H + k)',
    space: 'O(H)',
    code: `/**
 * Problem: 230. Kth Smallest Element in a BST
 * Difficulty: Medium
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/kth-smallest-element-in-a-bst/
 * 
 * Complexity:
 * - Time: O(H + k)
 * - Space: O(H) stack frames
 */

#include <stack>

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

using namespace std;

class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        stack<TreeNode*> st;
        TreeNode* curr = root;
        
        while (curr != nullptr || !st.empty()) {
            while (curr != nullptr) {
                st.push(curr);
                curr = curr->left;
            }
            curr = st.top();
            st.pop();
            if (--k == 0) return curr->val;
            curr = curr->right;
        }
        return -1;
    }
};
`
  },
  {
    id: 105,
    title: 'Construct Binary Tree from Preorder and Inorder Traversal',
    folder: '07-trees-and-tries',
    fileName: '0105-construct-binary-tree-from-preorder-and-inorder-traversal.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 105. Construct Binary Tree from Preorder and Inorder Traversal
 * Difficulty: Medium
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n) hash map + recursion stack
 */

#include <vector>
#include <unordered_map>

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
    unordered_map<int, int> inMap;
    int preIndex = 0;

    TreeNode* build(vector<int>& preorder, int inStart, int inEnd) {
        if (inStart > inEnd) return nullptr;

        int rootVal = preorder[preIndex++];
        TreeNode* root = new TreeNode(rootVal);
        int mid = inMap[rootVal];

        root->left = build(preorder, inStart, mid - 1);
        root->right = build(preorder, mid + 1, inEnd);
        return root;
    }

public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        preIndex = 0;
        inMap.clear();
        for (int i = 0; i < inorder.size(); ++i) {
            inMap[inorder[i]] = i;
        }
        return build(preorder, 0, inorder.size() - 1);
    }
};
`
  },
  {
    id: 133,
    title: 'Clone Graph',
    folder: '10-graphs',
    fileName: '0133-clone-graph.cpp',
    difficulty: 'Medium',
    topic: 'Graphs',
    time: 'O(V + E)',
    space: 'O(V)',
    code: `/**
 * Problem: 133. Clone Graph
 * Difficulty: Medium
 * Topic: Graphs
 * LeetCode Link: https://leetcode.com/problems/clone-graph/
 * 
 * Complexity:
 * - Time: O(V + E)
 * - Space: O(V)
 */

#include <vector>
#include <unordered_map>

using namespace std;

class Node {
public:
    int val;
    vector<Node*> neighbors;
    Node() { val = 0; neighbors = vector<Node*>(); }
    Node(int _val) { val = _val; neighbors = vector<Node*>(); }
    Node(int _val, vector<Node*> _neighbors) { val = _val; neighbors = _neighbors; }
};

class Solution {
private:
    unordered_map<Node*, Node*> visited;

public:
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        if (visited.count(node)) return visited[node];

        Node* clone = new Node(node->val);
        visited[node] = clone;

        for (Node* neighbor : node->neighbors) {
            clone->neighbors.push_back(cloneGraph(neighbor));
        }
        return clone;
    }
};
`
  },
  {
    id: 417,
    title: 'Pacific Atlantic Water Flow',
    folder: '10-graphs',
    fileName: '0417-pacific-atlantic-water-flow.cpp',
    difficulty: 'Medium',
    topic: 'Graphs',
    time: 'O(M * N)',
    space: 'O(M * N)',
    code: `/**
 * Problem: 417. Pacific Atlantic Water Flow
 * Difficulty: Medium
 * Topic: Graphs
 * LeetCode Link: https://leetcode.com/problems/pacific-atlantic-water-flow/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M * N)
 */

#include <vector>

using namespace std;

class Solution {
private:
    void dfs(vector<vector<int>>& heights, vector<vector<bool>>& visited, int r, int c) {
        visited[r][c] = true;
        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (auto& d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nr < heights.size() && nc >= 0 && nc < heights[0].size() &&
                !visited[nr][nc] && heights[nr][nc] >= heights[r][c]) {
                dfs(heights, visited, nr, nc);
            }
        }
    }

public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        int m = heights.size(), n = heights[0].size();
        vector<vector<bool>> pacific(m, vector<bool>(n, false));
        vector<vector<bool>> atlantic(m, vector<bool>(n, false));

        for (int i = 0; i < m; ++i) {
            dfs(heights, pacific, i, 0);
            dfs(heights, atlantic, i, n - 1);
        }
        for (int j = 0; j < n; ++j) {
            dfs(heights, pacific, 0, j);
            dfs(heights, atlantic, m - 1, j);
        }

        vector<vector<int>> result;
        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < n; ++j) {
                if (pacific[i][j] && atlantic[i][j]) {
                    result.push_back({i, j});
                }
            }
        }
        return result;
    }
};
`
  },
  {
    id: 198,
    title: 'House Robber',
    folder: '11-dynamic-programming',
    fileName: '0198-house-robber.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 198. House Robber
 * Difficulty: Medium
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/house-robber/
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
    int rob(vector<int>& nums) {
        int rob1 = 0, rob2 = 0;
        for (int n : nums) {
            int temp = max(n + rob1, rob2);
            rob1 = rob2;
            rob2 = temp;
        }
        return rob2;
    }
};
`
  },
  {
    id: 213,
    title: 'House Robber II',
    folder: '11-dynamic-programming',
    fileName: '0213-house-robber-ii.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 213. House Robber II
 * Difficulty: Medium
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/house-robber-ii/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
private:
    int robHelper(vector<int>& nums, int start, int end) {
        int rob1 = 0, rob2 = 0;
        for (int i = start; i <= end; ++i) {
            int temp = max(nums[i] + rob1, rob2);
            rob1 = rob2;
            rob2 = temp;
        }
        return rob2;
    }

public:
    int rob(vector<int>& nums) {
        int n = nums.size();
        if (n == 1) return nums[0];
        return max(robHelper(nums, 0, n - 2), robHelper(nums, 1, n - 1));
    }
};
`
  },
  {
    id: 5,
    title: 'Longest Palindromic Substring',
    folder: '11-dynamic-programming',
    fileName: '0005-longest-palindromic-substring.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n^2)',
    space: 'O(1)',
    code: `/**
 * Problem: 5. Longest Palindromic Substring
 * Difficulty: Medium
 * Topic: Dynamic Programming / Expand Around Center
 * LeetCode Link: https://leetcode.com/problems/longest-palindromic-substring/
 * 
 * Complexity:
 * - Time: O(n^2)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
private:
    int expandAroundCenter(const string& s, int left, int right) {
        while (left >= 0 && right < s.length() && s[left] == s[right]) {
            left--;
            right++;
        }
        return right - left - 1;
    }

public:
    string longestPalindrome(string s) {
        if (s.empty()) return "";
        int start = 0, maxLen = 0;

        for (int i = 0; i < s.length(); ++i) {
            int len1 = expandAroundCenter(s, i, i);
            int len2 = expandAroundCenter(s, i, i + 1);
            int len = max(len1, len2);

            if (len > maxLen) {
                maxLen = len;
                start = i - (len - 1) / 2;
            }
        }
        return s.substr(start, maxLen);
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
