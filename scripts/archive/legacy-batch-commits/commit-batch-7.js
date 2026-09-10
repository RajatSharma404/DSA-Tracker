const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 79,
    title: 'Word Search',
    folder: '09-backtracking',
    fileName: '0079-word-search.cpp',
    difficulty: 'Medium',
    topic: 'Recursion & Backtracking',
    time: 'O(N * 4^L)',
    space: 'O(L)',
    code: `/**
 * Problem: 79. Word Search
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/word-search/
 * 
 * Complexity:
 * - Time: O(M * N * 4^L) where L is length of word
 * - Space: O(L) recursion stack
 */

#include <vector>
#include <string>

using namespace std;

class Solution {
private:
    bool dfs(vector<vector<char>>& board, const string& word, int index, int r, int c) {
        if (index == word.length()) return true;
        if (r < 0 || c < 0 || r >= board.size() || c >= board[0].size() || board[r][c] != word[index]) {
            return false;
        }

        char temp = board[r][c];
        board[r][c] = '#'; // mark visited

        bool found = dfs(board, word, index + 1, r + 1, c) ||
                     dfs(board, word, index + 1, r - 1, c) ||
                     dfs(board, word, index + 1, r, c + 1) ||
                     dfs(board, word, index + 1, r, c - 1);

        board[r][c] = temp; // backtrack
        return found;
    }

public:
    bool exist(vector<vector<char>>& board, string word) {
        for (int r = 0; r < board.size(); ++r) {
            for (int c = 0; c < board[0].size(); ++c) {
                if (board[r][c] == word[0] && dfs(board, word, 0, r, c)) {
                    return true;
                }
            }
        }
        return false;
    }
};
`
  },
  {
    id: 131,
    title: 'Palindrome Partitioning',
    folder: '09-backtracking',
    fileName: '0131-palindrome-partitioning.cpp',
    difficulty: 'Medium',
    topic: 'Recursion & Backtracking',
    time: 'O(n * 2^n)',
    space: 'O(n)',
    code: `/**
 * Problem: 131. Palindrome Partitioning
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/palindrome-partitioning/
 * 
 * Complexity:
 * - Time: O(n * 2^n)
 * - Space: O(n) recursion stack
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
private:
    bool isPalindrome(const string& s, int l, int r) {
        while (l < r) {
            if (s[l++] != s[r--]) return false;
        }
        return true;
    }

    void backtrack(const string& s, int start, vector<string>& current, vector<vector<string>>& result) {
        if (start == s.length()) {
            result.push_back(current);
            return;
        }

        for (int end = start; end < s.length(); ++end) {
            if (isPalindrome(s, start, end)) {
                current.push_back(s.substr(start, end - start + 1));
                backtrack(s, end + 1, current, result);
                current.pop_back();
            }
        }
    }

public:
    vector<vector<string>> partition(string s) {
        vector<vector<string>> result;
        vector<string> current;
        backtrack(s, 0, current, result);
        return result;
    }
};
`
  },
  {
    id: 695,
    title: 'Max Area of Island',
    folder: '10-graphs',
    fileName: '0695-max-area-of-island.cpp',
    difficulty: 'Medium',
    topic: 'Graphs',
    time: 'O(M * N)',
    space: 'O(M * N)',
    code: `/**
 * Problem: 695. Max Area of Island
 * Difficulty: Medium
 * Topic: Graphs (DFS)
 * LeetCode Link: https://leetcode.com/problems/max-area-of-island/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M * N) recursion stack
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
private:
    int dfs(vector<vector<int>>& grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.size() || c >= grid[0].size() || grid[r][c] == 0) {
            return 0;
        }

        grid[r][c] = 0; // mark visited
        return 1 + dfs(grid, r + 1, c) + dfs(grid, r - 1, c) + dfs(grid, r, c + 1) + dfs(grid, r, c - 1);
    }

public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int maxArea = 0;
        for (int r = 0; r < grid.size(); ++r) {
            for (int c = 0; c < grid[0].size(); ++c) {
                if (grid[r][c] == 1) {
                    maxArea = max(maxArea, dfs(grid, r, c));
                }
            }
        }
        return maxArea;
    }
};
`
  },
  {
    id: 994,
    title: 'Rotting Oranges',
    folder: '10-graphs',
    fileName: '0994-rotting-oranges.cpp',
    difficulty: 'Medium',
    topic: 'Graphs',
    time: 'O(M * N)',
    space: 'O(M * N)',
    code: `/**
 * Problem: 994. Rotting Oranges
 * Difficulty: Medium
 * Topic: Graphs (Multi-Source BFS)
 * LeetCode Link: https://leetcode.com/problems/rotting-oranges/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M * N) queue space
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        queue<pair<int, int>> q;
        int fresh = 0;

        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                if (grid[r][c] == 2) q.push({r, c});
                else if (grid[r][c] == 1) fresh++;
            }
        }

        if (fresh == 0) return 0;

        int minutes = 0;
        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        while (!q.empty() && fresh > 0) {
            int sz = q.size();
            minutes++;

            for (int i = 0; i < sz; ++i) {
                auto [r, c] = q.front();
                q.pop();

                for (auto& d : dirs) {
                    int nr = r + d[0], nc = c + d[1];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2;
                        fresh--;
                        q.push({nr, nc});
                    }
                }
            }
        }

        return fresh == 0 ? minutes : -1;
    }
};
`
  },
  {
    id: 286,
    title: 'Walls and Gates',
    folder: '10-graphs',
    fileName: '0286-walls-and-gates.cpp',
    difficulty: 'Medium',
    topic: 'Graphs',
    time: 'O(M * N)',
    space: 'O(M * N)',
    code: `/**
 * Problem: 286. Walls and Gates
 * Difficulty: Medium
 * Topic: Graphs (Multi-Source BFS)
 * LeetCode Link: https://leetcode.com/problems/walls-and-gates/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M * N)
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    void wallsAndGates(vector<vector<int>>& rooms) {
        if (rooms.empty()) return;
        int m = rooms.size(), n = rooms[0].size();
        queue<pair<int, int>> q;

        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                if (rooms[r][c] == 0) {
                    q.push({r, c});
                }
            }
        }

        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        while (!q.empty()) {
            auto [r, c] = q.front();
            q.pop();

            for (auto& d : dirs) {
                int nr = r + d[0], nc = c + d[1];
                if (nr >= 0 && nr < m && nc >= 0 && nc < n && rooms[nr][nc] == 2147483647) {
                    rooms[nr][nc] = rooms[r][c] + 1;
                    q.push({nr, nc});
                }
            }
        }
    }
};
`
  },
  {
    id: 207,
    title: 'Course Schedule',
    folder: '10-graphs',
    fileName: '0207-course-schedule.cpp',
    difficulty: 'Medium',
    topic: 'Graphs',
    time: 'O(V + E)',
    space: 'O(V + E)',
    code: `/**
 * Problem: 207. Course Schedule
 * Difficulty: Medium
 * Topic: Graphs (Topological Sort / Cycle Detection)
 * LeetCode Link: https://leetcode.com/problems/course-schedule/
 * 
 * Complexity:
 * - Time: O(V + E)
 * - Space: O(V + E)
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> inDegree(numCourses, 0);

        for (const auto& pre : prerequisites) {
            adj[pre[1]].push_back(pre[0]);
            inDegree[pre[0]]++;
        }

        queue<int> q;
        for (int i = 0; i < numCourses; ++i) {
            if (inDegree[i] == 0) q.push(i);
        }

        int completed = 0;
        while (!q.empty()) {
            int course = q.front();
            q.pop();
            completed++;

            for (int neighbor : adj[course]) {
                if (--inDegree[neighbor] == 0) {
                    q.push(neighbor);
                }
            }
        }

        return completed == numCourses;
    }
};
`
  },
  {
    id: 210,
    title: 'Course Schedule II',
    folder: '10-graphs',
    fileName: '0210-course-schedule-ii.cpp',
    difficulty: 'Medium',
    topic: 'Graphs',
    time: 'O(V + E)',
    space: 'O(V + E)',
    code: `/**
 * Problem: 210. Course Schedule II
 * Difficulty: Medium
 * Topic: Graphs (Kahn's Algorithm / BFS Topological Sort)
 * LeetCode Link: https://leetcode.com/problems/course-schedule-ii/
 * 
 * Complexity:
 * - Time: O(V + E)
 * - Space: O(V + E)
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> inDegree(numCourses, 0);

        for (const auto& pre : prerequisites) {
            adj[pre[1]].push_back(pre[0]);
            inDegree[pre[0]]++;
        }

        queue<int> q;
        for (int i = 0; i < numCourses; ++i) {
            if (inDegree[i] == 0) q.push(i);
        }

        vector<int> order;
        while (!q.empty()) {
            int course = q.front();
            q.pop();
            order.push_back(course);

            for (int neighbor : adj[course]) {
                if (--inDegree[neighbor] == 0) {
                    q.push(neighbor);
                }
            }
        }

        return order.size() == numCourses ? order : vector<int>();
    }
};
`
  },
  {
    id: 684,
    title: 'Redundant Connection',
    folder: '10-graphs',
    fileName: '0684-redundant-connection.cpp',
    difficulty: 'Medium',
    topic: 'Graphs',
    time: 'O(N * alpha(N))',
    space: 'O(N)',
    code: `/**
 * Problem: 684. Redundant Connection
 * Difficulty: Medium
 * Topic: Graphs (Union-Find / Disjoint Set)
 * LeetCode Link: https://leetcode.com/problems/redundant-connection/
 * 
 * Complexity:
 * - Time: O(N * alpha(N))
 * - Space: O(N)
 */

#include <vector>

using namespace std;

class Solution {
private:
    int find(vector<int>& parent, int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent, parent[i]);
    }

    bool unite(vector<int>& parent, vector<int>& rank, int u, int v) {
        int rootU = find(parent, u);
        int rootV = find(parent, v);
        if (rootU == rootV) return false;

        if (rank[rootU] < rank[rootV]) {
            parent[rootU] = rootV;
        } else if (rank[rootU] > rank[rootV]) {
            parent[rootV] = rootU;
        } else {
            parent[rootV] = rootU;
            rank[rootU]++;
        }
        return true;
    }

public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        int n = edges.size();
        vector<int> parent(n + 1), rank(n + 1, 0);
        for (int i = 1; i <= n; ++i) parent[i] = i;

        for (const auto& edge : edges) {
            if (!unite(parent, rank, edge[0], edge[1])) {
                return edge;
            }
        }
        return {};
    }
};
`
  },
  {
    id: 55,
    title: 'Jump Game',
    folder: '12-greedy',
    fileName: '0055-jump-game.cpp',
    difficulty: 'Medium',
    topic: 'Greedy',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 55. Jump Game
 * Difficulty: Medium
 * Topic: Greedy
 * LeetCode Link: https://leetcode.com/problems/jump-game/
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
    bool canJump(vector<int>& nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.size(); ++i) {
            if (i > maxReach) return false;
            maxReach = max(maxReach, i + nums[i]);
        }
        return true;
    }
};
`
  },
  {
    id: 45,
    title: 'Jump Game II',
    folder: '12-greedy',
    fileName: '0045-jump-game-ii.cpp',
    difficulty: 'Medium',
    topic: 'Greedy',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 45. Jump Game II
 * Difficulty: Medium
 * Topic: Greedy (BFS Window)
 * LeetCode Link: https://leetcode.com/problems/jump-game-ii/
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
    int jump(vector<int>& nums) {
        int jumps = 0, currentEnd = 0, farthest = 0;

        for (int i = 0; i < nums.size() - 1; ++i) {
            farthest = max(farthest, i + nums[i]);
            if (i == currentEnd) {
                jumps++;
                currentEnd = farthest;
            }
        }
        return jumps;
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
