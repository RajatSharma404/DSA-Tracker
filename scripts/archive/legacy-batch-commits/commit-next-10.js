const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 49,
    title: 'Group Anagrams',
    folder: '01-arrays-and-hashing',
    fileName: '0049-group-anagrams.cpp',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    time: 'O(N * K log K)',
    space: 'O(N * K)',
    code: `/**
 * Problem: 49. Group Anagrams
 * Difficulty: Medium
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/group-anagrams/
 * 
 * Complexity:
 * - Time: O(N * K log K) where N is the number of strings and K is the maximum length of a string
 * - Space: O(N * K)
 */

#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (const string& s : strs) {
            string key = s;
            sort(key.begin(), key.end());
            groups[key].push_back(s);
        }
        
        vector<vector<string>> result;
        for (auto& pair : groups) {
            result.push_back(move(pair.second));
        }
        return result;
    }
};
`
  },
  {
    id: 347,
    title: 'Top K Frequent Elements',
    folder: '08-heap-priority-queue',
    fileName: '0347-top-k-frequent-elements.cpp',
    difficulty: 'Medium',
    topic: 'Heap / Priority Queue',
    time: 'O(N log k)',
    space: 'O(N)',
    code: `/**
 * Problem: 347. Top K Frequent Elements
 * Difficulty: Medium
 * Topic: Heap / Priority Queue
 * LeetCode Link: https://leetcode.com/problems/top-k-frequent-elements/
 * 
 * Complexity:
 * - Time: O(N log k)
 * - Space: O(N)
 */

#include <vector>
#include <unordered_map>
#include <queue>

using namespace std;

class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int num : nums) count[num]++;
        
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> minHeap;
        
        for (auto& [num, freq] : count) {
            minHeap.push({freq, num});
            if (minHeap.size() > k) {
                minHeap.pop();
            }
        }
        
        vector<int> result;
        while (!minHeap.empty()) {
            result.push_back(minHeap.top().second);
            minHeap.pop();
        }
        return result;
    }
};
`
  },
  {
    id: 15,
    title: '3Sum',
    folder: '02-two-pointers',
    fileName: '0015-3sum.cpp',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    time: 'O(n^2)',
    space: 'O(1)',
    code: `/**
 * Problem: 15. 3Sum
 * Difficulty: Medium
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/3sum/
 * 
 * Complexity:
 * - Time: O(n^2)
 * - Space: O(1) extra space excluding result
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<vector<int>> result;
        sort(nums.begin(), nums.end());
        int n = nums.size();
        
        for (int i = 0; i < n - 2; ++i) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int left = i + 1, right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.push_back({nums[i], nums[left], nums[right]});
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return result;
    }
};
`
  },
  {
    id: 11,
    title: 'Container With Most Water',
    folder: '02-two-pointers',
    fileName: '0011-container-with-most-water.cpp',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 11. Container With Most Water
 * Difficulty: Medium
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/container-with-most-water/
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
    int maxArea(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int maxWater = 0;
        
        while (left < right) {
            int h = min(height[left], height[right]);
            maxWater = max(maxWater, h * (right - left));
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        return maxWater;
    }
};
`
  },
  {
    id: 3,
    title: 'Longest Substring Without Repeating Characters',
    folder: '03-sliding-window',
    fileName: '0003-longest-substring-without-repeating-characters.cpp',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    time: 'O(n)',
    space: 'O(min(n, m))',
    code: `/**
 * Problem: 3. Longest Substring Without Repeating Characters
 * Difficulty: Medium
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/longest-substring-without-repeating-characters/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(min(n, m))
 */

#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> lastIndex(128, -1);
        int maxLen = 0, start = 0;
        
        for (int end = 0; end < s.length(); ++end) {
            if (lastIndex[s[end]] >= start) {
                start = lastIndex[s[end]] + 1;
            }
            lastIndex[s[end]] = end;
            maxLen = max(maxLen, end - start + 1);
        }
        return maxLen;
    }
};
`
  },
  {
    id: 155,
    title: 'Min Stack',
    folder: '04-stack',
    fileName: '0155-min-stack.cpp',
    difficulty: 'Medium',
    topic: 'Stack',
    time: 'O(1) all ops',
    space: 'O(n)',
    code: `/**
 * Problem: 155. Min Stack
 * Difficulty: Medium
 * Topic: Stack
 * LeetCode Link: https://leetcode.com/problems/min-stack/
 * 
 * Complexity:
 * - Time: O(1) for push, pop, top, getMin
 * - Space: O(n)
 */

#include <stack>
#include <algorithm>

using namespace std;

class MinStack {
private:
    stack<int> mainStack;
    stack<int> minStack;
public:
    MinStack() {}
    
    void push(int val) {
        mainStack.push(val);
        if (minStack.empty() || val <= minStack.top()) {
            minStack.push(val);
        }
    }
    
    void pop() {
        if (mainStack.top() == minStack.top()) {
            minStack.pop();
        }
        mainStack.pop();
    }
    
    int top() {
        return mainStack.top();
    }
    
    int getMin() {
        return minStack.top();
    }
};
`
  },
  {
    id: 33,
    title: 'Search in Rotated Sorted Array',
    folder: '05-binary-search',
    fileName: '0033-search-in-rotated-sorted-array.cpp',
    difficulty: 'Medium',
    topic: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    code: `/**
 * Problem: 33. Search in Rotated Sorted Array
 * Difficulty: Medium
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/search-in-rotated-sorted-array/
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
            
            if (nums[left] <= nums[mid]) {
                if (target >= nums[left] && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (target > nums[mid] && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
};
`
  },
  {
    id: 141,
    title: 'Linked List Cycle',
    folder: '06-linked-list',
    fileName: '0141-linked-list-cycle.cpp',
    difficulty: 'Easy',
    topic: 'Linked List',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 141. Linked List Cycle
 * Difficulty: Easy
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/linked-list-cycle/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    bool hasCycle(ListNode *head) {
        if (!head || !head->next) return false;
        ListNode *slow = head;
        ListNode *fast = head;
        
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};
`
  },
  {
    id: 104,
    title: 'Maximum Depth of Binary Tree',
    folder: '07-trees-and-tries',
    fileName: '0104-maximum-depth-of-binary-tree.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 104. Maximum Depth of Binary Tree
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/maximum-depth-of-binary-tree/
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
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};
`
  },
  {
    id: 53,
    title: 'Maximum Subarray',
    folder: '11-dynamic-programming',
    fileName: '0053-maximum-subarray.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 53. Maximum Subarray
 * Difficulty: Medium
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/maximum-subarray/
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
    int maxSubArray(vector<int>& nums) {
        int maxSum = nums[0];
        int currSum = nums[0];
        
        for (int i = 1; i < nums.size(); ++i) {
            currSum = max(nums[i], currSum + nums[i]);
            maxSum = max(maxSum, currSum);
        }
        return maxSum;
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

console.log('\n🎉 Successfully committed the 10 questions in 10 individual commits!');
