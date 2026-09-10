const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 18,
    title: '4Sum',
    folder: '02-two-pointers',
    fileName: '0018-4sum.cpp',
    difficulty: 'Medium',
    topic: 'Two Pointers / Arrays',
    time: 'O(n^3)',
    space: 'O(1) extra space',
    code: `/**
 * Problem: 18. 4Sum
 * Difficulty: Medium
 * Topic: Two Pointers / Arrays
 * LeetCode Link: https://leetcode.com/problems/4sum/
 * 
 * Complexity:
 * - Time: O(n^3)
 * - Space: O(1) excluding output space
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<vector<int>> fourSum(vector<int>& nums, int target) {
        vector<vector<int>> result;
        int n = nums.size();
        if (n < 4) return result;

        sort(nums.begin(), nums.end());

        for (int i = 0; i < n - 3; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;

            for (int j = i + 1; j < n - 2; j++) {
                if (j > i + 1 && nums[j] == nums[j - 1]) continue;

                int left = j + 1;
                int right = n - 1;

                while (left < right) {
                    long long sum = (long long)nums[i] + nums[j] + nums[left] + nums[right];

                    if (sum == target) {
                        result.push_back({nums[i], nums[j], nums[left], nums[right]});
                        while (left < right && nums[left] == nums[left + 1]) left++;
                        while (left < right && nums[right] == nums[right - 1]) right--;
                        left++;
                        right--;
                    } else if (sum < target) {
                        left++;
                    } else {
                        right--;
                    }
                }
            }
        }

        return result;
    }
};
`
  },
  {
    id: 41,
    title: 'First Missing Positive',
    folder: '01-arrays-and-hashing',
    fileName: '0041-first-missing-positive.cpp',
    difficulty: 'Hard',
    topic: 'Arrays & Hashing / Cyclic Sort',
    time: 'O(n)',
    space: 'O(1) in-place',
    code: `/**
 * Problem: 41. First Missing Positive
 * Difficulty: Hard
 * Topic: Arrays & Hashing / Cyclic Sort
 * LeetCode Link: https://leetcode.com/problems/first-missing-positive/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) auxiliary space
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();

        // Place each number at its corresponding index if 1 <= nums[i] <= n
        for (int i = 0; i < n; i++) {
            while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                swap(nums[i], nums[nums[i] - 1]);
            }
        }

        // Find the first index missing its correct number
        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1) {
                return i + 1;
            }
        }

        return n + 1;
    }
};
`
  },
  {
    id: 75,
    title: 'Sort Colors',
    folder: '02-two-pointers',
    fileName: '0075-sort-colors.cpp',
    difficulty: 'Medium',
    topic: 'Two Pointers / Dutch National Flag',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 75. Sort Colors
 * Difficulty: Medium
 * Topic: Two Pointers / Dutch National Flag
 * LeetCode Link: https://leetcode.com/problems/sort-colors/
 * 
 * Complexity:
 * - Time: O(n) single pass
 * - Space: O(1) in-place
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    void sortColors(vector<int>& nums) {
        int low = 0;
        int mid = 0;
        int high = nums.size() - 1;

        while (mid <= high) {
            if (nums[mid] == 0) {
                swap(nums[low], nums[mid]);
                low++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                swap(nums[mid], nums[high]);
                high--;
            }
        }
    }
};
`
  },
  {
    id: 80,
    title: 'Remove Duplicates from Sorted Array II',
    folder: '02-two-pointers',
    fileName: '0080-remove-duplicates-from-sorted-array-ii.cpp',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 80. Remove Duplicates from Sorted Array II
 * Difficulty: Medium
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) in-place
 */

#include <vector>

using namespace std;

class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.size() <= 2) return nums.size();

        int k = 2;
        for (size_t i = 2; i < nums.size(); i++) {
            if (nums[i] != nums[k - 2]) {
                nums[k++] = nums[i];
            }
        }

        return k;
    }
};
`
  },
  {
    id: 130,
    title: 'Surrounded Regions',
    folder: '10-graphs',
    fileName: '0130-surrounded-regions.cpp',
    difficulty: 'Medium',
    topic: 'Graphs / DFS (Matrix Traversal)',
    time: 'O(M * N)',
    space: 'O(M * N)',
    code: `/**
 * Problem: 130. Surrounded Regions
 * Difficulty: Medium
 * Topic: Graphs / DFS (Matrix Traversal)
 * LeetCode Link: https://leetcode.com/problems/surrounded-regions/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M * N) recursion stack
 */

#include <vector>

using namespace std;

class Solution {
private:
    void dfs(vector<vector<char>>& board, int r, int c) {
        int rows = board.size();
        int cols = board[0].size();

        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] != 'O') {
            return;
        }

        board[r][c] = 'T'; // Temporary mark for border-connected 'O'

        dfs(board, r + 1, c);
        dfs(board, r - 1, c);
        dfs(board, r, c + 1);
        dfs(board, r, c - 1);
    }

public:
    void solve(vector<vector<char>>& board) {
        if (board.empty() || board[0].empty()) return;

        int rows = board.size();
        int cols = board[0].size();

        // 1. Mark unsurrounded regions starting from border
        for (int r = 0; r < rows; r++) {
            if (board[r][0] == 'O') dfs(board, r, 0);
            if (board[r][cols - 1] == 'O') dfs(board, r, cols - 1);
        }
        for (int c = 0; c < cols; c++) {
            if (board[0][c] == 'O') dfs(board, 0, c);
            if (board[rows - 1][c] == 'O') dfs(board, rows - 1, c);
        }

        // 2. Flip all remaining 'O' to 'X', and 'T' back to 'O'
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (board[r][c] == 'O') {
                    board[r][c] = 'X';
                } else if (board[r][c] == 'T') {
                    board[r][c] = 'O';
                }
            }
        }
    }
};
`
  },
  {
    id: 142,
    title: 'Linked List Cycle II',
    folder: '06-linked-list',
    fileName: '0142-linked-list-cycle-ii.cpp',
    difficulty: 'Medium',
    topic: "Linked List / Floyd's Cycle Detection",
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 142. Linked List Cycle II
 * Difficulty: Medium
 * Topic: Linked List / Floyd's Cycle Detection (Fast & Slow Pointers)
 * LeetCode Link: https://leetcode.com/problems/linked-list-cycle-ii/
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
    ListNode *detectCycle(ListNode *head) {
        if (!head || !head->next) return nullptr;

        ListNode *slow = head;
        ListNode *fast = head;

        // Step 1: Detect if a cycle exists
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) {
                // Step 2: Find cycle starting node
                ListNode *entry = head;
                while (entry != slow) {
                    entry = entry->next;
                    slow = slow->next;
                }
                return entry;
            }
        }

        return nullptr;
    }
};
`
  },
  {
    id: 289,
    title: 'Game of Life',
    folder: '14-math-and-geometry',
    fileName: '0289-game-of-life.cpp',
    difficulty: 'Medium',
    topic: 'Math & Geometry / In-Place State Machine',
    time: 'O(M * N)',
    space: 'O(1) in-place',
    code: `/**
 * Problem: 289. Game of Life
 * Difficulty: Medium
 * Topic: Math & Geometry / In-Place State Transitions
 * LeetCode Link: https://leetcode.com/problems/game-of-life/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(1) auxiliary space (using bit/state encoding)
 */

#include <vector>
#include <cstdlib>

using namespace std;

class Solution {
public:
    void gameOfLife(vector<vector<int>>& board) {
        int m = board.size();
        int n = board[0].size();

        // State encoding:
        // 0: dead -> dead (0)
        // 1: live -> live (1)
        // 2: live -> dead (was 1, becomes 0)
        // 3: dead -> live (was 0, becomes 1)

        int dirs[8][2] = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};

        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                int liveNeighbors = 0;
                for (auto& d : dirs) {
                    int nr = r + d[0];
                    int nc = c + d[1];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
                        if (board[nr][nc] == 1 || board[nr][nc] == 2) {
                            liveNeighbors++;
                        }
                    }
                }

                if (board[r][c] == 1) {
                    if (liveNeighbors < 2 || liveNeighbors > 3) {
                        board[r][c] = 2; // live -> dead
                    }
                } else {
                    if (liveNeighbors == 3) {
                        board[r][c] = 3; // dead -> live
                    }
                }
            }
        }

        // Final state update
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                if (board[r][c] == 2) board[r][c] = 0;
                else if (board[r][c] == 3) board[r][c] = 1;
            }
        }
    }
};
`
  },
  {
    id: 329,
    title: 'Longest Increasing Path in a Matrix',
    folder: '11-dynamic-programming',
    fileName: '0329-longest-increasing-path-in-a-matrix.cpp',
    difficulty: 'Hard',
    topic: 'Dynamic Programming / Graph DFS with Memoization',
    time: 'O(M * N)',
    space: 'O(M * N)',
    code: `/**
 * Problem: 329. Longest Increasing Path in a Matrix
 * Difficulty: Hard
 * Topic: Dynamic Programming / Graph DFS with Memoization
 * LeetCode Link: https://leetcode.com/problems/longest-increasing-path-in-a-matrix/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M * N) for DP memo table and recursion stack
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
private:
    int dfs(const vector<vector<int>>& matrix, int r, int c, vector<vector<int>>& memo) {
        if (memo[r][c] != 0) return memo[r][c];

        int m = matrix.size();
        int n = matrix[0].size();
        int maxLen = 1;

        int dirs[4][2] = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};

        for (auto& d : dirs) {
            int nr = r + d[0];
            int nc = c + d[1];
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] > matrix[r][c]) {
                maxLen = max(maxLen, 1 + dfs(matrix, nr, nc, memo));
            }
        }

        return memo[r][c] = maxLen;
    }

public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        if (matrix.empty() || matrix[0].empty()) return 0;

        int m = matrix.size();
        int n = matrix[0].size();
        vector<vector<int>> memo(m, vector<int>(n, 0));
        int longest = 0;

        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                longest = max(longest, dfs(matrix, r, c, memo));
            }
        }

        return longest;
    }
};
`
  },
  {
    id: 380,
    title: 'Insert Delete GetRandom O(1)',
    folder: '01-arrays-and-hashing',
    fileName: '0380-insert-delete-getrandom-o1.cpp',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing / Design',
    time: 'O(1) average for all operations',
    space: 'O(n)',
    code: `/**
 * Problem: 380. Insert Delete GetRandom O(1)
 * Difficulty: Medium
 * Topic: Arrays & Hashing / Design (Hash Map + Dynamic Array)
 * LeetCode Link: https://leetcode.com/problems/insert-delete-getrandom-o1/
 * 
 * Complexity:
 * - Time: O(1) average for insert, remove, and getRandom
 * - Space: O(n)
 */

#include <vector>
#include <unordered_map>
#include <cstdlib>

using namespace std;

class RandomizedSet {
private:
    vector<int> nums;
    unordered_map<int, int> valToIndex;

public:
    RandomizedSet() {}

    bool insert(int val) {
        if (valToIndex.count(val)) return false;

        nums.push_back(val);
        valToIndex[val] = nums.size() - 1;
        return true;
    }

    bool remove(int val) {
        if (!valToIndex.count(val)) return false;

        int idx = valToIndex[val];
        int lastVal = nums.back();

        nums[idx] = lastVal;
        valToIndex[lastVal] = idx;

        nums.pop_back();
        valToIndex.erase(val);
        return true;
    }

    int getRandom() {
        return nums[rand() % nums.size()];
    }
};
`
  },
  {
    id: 399,
    title: 'Evaluate Division',
    folder: '10-graphs',
    fileName: '0399-evaluate-division.cpp',
    difficulty: 'Medium',
    topic: 'Graphs / DFS & Weighted Graph',
    time: 'O((V + E) * Q)',
    space: 'O(V + E)',
    code: `/**
 * Problem: 399. Evaluate Division
 * Difficulty: Medium
 * Topic: Graphs / DFS on Weighted Directed Graph
 * LeetCode Link: https://leetcode.com/problems/evaluate-division/
 * 
 * Complexity:
 * - Time: O((V + E) * Q) where Q is the number of queries
 * - Space: O(V + E) for graph adjacency list
 */

#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>

using namespace std;

class Solution {
private:
    bool dfs(const string& src, const string& dst, unordered_map<string, unordered_map<string, double>>& graph,
             unordered_set<string>& visited, double& ans, double currentProd) {
        if (src == dst) {
            ans = currentProd;
            return true;
        }

        visited.insert(src);

        for (const auto& [neighbor, weight] : graph[src]) {
            if (!visited.count(neighbor)) {
                if (dfs(neighbor, dst, graph, visited, ans, currentProd * weight)) {
                    return true;
                }
            }
        }

        return false;
    }

public:
    vector<double> calcEquation(vector<vector<string>>& equations, vector<double>& values, vector<vector<string>>& queries) {
        unordered_map<string, unordered_map<string, double>> graph;

        for (size_t i = 0; i < equations.size(); i++) {
            const string& u = equations[i][0];
            const string& v = equations[i][1];
            double val = values[i];

            graph[u][v] = val;
            graph[v][u] = 1.0 / val;
        }

        vector<double> results;

        for (const auto& q : queries) {
            const string& src = q[0];
            const string& dst = q[1];

            if (!graph.count(src) || !graph.count(dst)) {
                results.push_back(-1.0);
            } else if (src == dst) {
                results.push_back(1.0);
            } else {
                unordered_set<string> visited;
                double ans = -1.0;
                dfs(src, dst, graph, visited, ans, 1.0);
                results.push_back(ans);
            }
        }

        return results;
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
  execSync(`git add "${relFilePath}" solutions/README.md scripts/commit-batch-15.js`, { cwd: rootDir });
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
