const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 8,
    title: 'String to Integer (atoi)',
    folder: '14-math-and-geometry',
    fileName: '0008-string-to-integer-atoi.cpp',
    difficulty: 'Medium',
    topic: 'Math & Geometry / String Parsing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 8. String to Integer (atoi)
 * Difficulty: Medium
 * Topic: Math & Geometry / String Parsing
 * LeetCode Link: https://leetcode.com/problems/string-to-integer-atoi/
 * 
 * Complexity:
 * - Time: O(n) single pass
 * - Space: O(1)
 */

#include <string>
#include <climits>

using namespace std;

class Solution {
public:
    int myAtoi(string s) {
        int i = 0;
        int n = s.length();

        // 1. Skip leading whitespaces
        while (i < n && s[i] == ' ') {
            i++;
        }
        if (i == n) return 0;

        // 2. Check sign
        int sign = 1;
        if (s[i] == '+' || s[i] == '-') {
            sign = (s[i] == '-') ? -1 : 1;
            i++;
        }

        // 3. Convert digits and clamp overflow
        long long result = 0;
        while (i < n && isdigit(s[i])) {
            int digit = s[i] - '0';

            // Check overflow before multiplying
            if (result > (INT_MAX - digit) / 10) {
                return (sign == 1) ? INT_MAX : INT_MIN;
            }

            result = result * 10 + digit;
            i++;
        }

        return sign * result;
    }
};
`
  },
  {
    id: 12,
    title: 'Integer to Roman',
    folder: '14-math-and-geometry',
    fileName: '0012-integer-to-roman.cpp',
    difficulty: 'Medium',
    topic: 'Math & Geometry / Greedy Mapping',
    time: 'O(1)',
    space: 'O(1)',
    code: `/**
 * Problem: 12. Integer to Roman
 * Difficulty: Medium
 * Topic: Math & Geometry / Greedy Mapping
 * LeetCode Link: https://leetcode.com/problems/integer-to-roman/
 * 
 * Complexity:
 * - Time: O(1) bounded by fixed number of Roman numerals
 * - Space: O(1)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    string intToRoman(int num) {
        const vector<pair<int, string>> valToRoman = {
            {1000, "M"}, {900, "CM"}, {500, "D"}, {400, "CD"},
            {100, "C"},   {90, "XC"},  {50, "L"},   {40, "XL"},
            {10, "X"},    {9, "IX"},   {5, "V"},    {4, "IV"},
            {1, "I"}
        };

        string result = "";
        for (const auto& [val, sym] : valToRoman) {
            while (num >= val) {
                result += sym;
                num -= val;
            }
        }

        return result;
    }
};
`
  },
  {
    id: 13,
    title: 'Roman to Integer',
    folder: '14-math-and-geometry',
    fileName: '0013-roman-to-integer.cpp',
    difficulty: 'Easy',
    topic: 'Math & Geometry / Hash Map',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 13. Roman to Integer
 * Difficulty: Easy
 * Topic: Math & Geometry / Hash Map
 * LeetCode Link: https://leetcode.com/problems/roman-to-integer/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) fixed lookup table
 */

#include <string>
#include <unordered_map>

using namespace std;

class Solution {
public:
    int romanToInt(string s) {
        unordered_map<char, int> roman = {
            {'I', 1}, {'V', 5}, {'X', 10}, {'L', 50},
            {'C', 100}, {'D', 500}, {'M', 1000}
        };

        int total = 0;
        int n = s.length();

        for (int i = 0; i < n; i++) {
            if (i + 1 < n && roman[s[i]] < roman[s[i + 1]]) {
                total -= roman[s[i]];
            } else {
                total += roman[s[i]];
            }
        }

        return total;
    }
};
`
  },
  {
    id: 22,
    title: 'Generate Parentheses',
    folder: '09-backtracking',
    fileName: '0022-generate-parentheses.cpp',
    difficulty: 'Medium',
    topic: 'Recursion & Backtracking',
    time: 'O(4^n / sqrt(n)) Catalan number',
    space: 'O(n)',
    code: `/**
 * Problem: 22. Generate Parentheses
 * Difficulty: Medium
 * Topic: Recursion & Backtracking
 * LeetCode Link: https://leetcode.com/problems/generate-parentheses/
 * 
 * Complexity:
 * - Time: O(4^n / sqrt(n)) bounded by n-th Catalan number
 * - Space: O(n) recursion stack
 */

#include <vector>
#include <string>

using namespace std;

class Solution {
private:
    void backtrack(int openCount, int closeCount, int n, string& current, vector<string>& result) {
        if (current.length() == 2 * n) {
            result.push_back(current);
            return;
        }

        if (openCount < n) {
            current.push_back('(');
            backtrack(openCount + 1, closeCount, n, current, result);
            current.pop_back();
        }

        if (closeCount < openCount) {
            current.push_back(')');
            backtrack(openCount, closeCount + 1, n, current, result);
            current.pop_back();
        }
    }

public:
    vector<string> generateParenthesis(int n) {
        vector<string> result;
        string current = "";
        backtrack(0, 0, n, current, result);
        return result;
    }
};
`
  },
  {
    id: 40,
    title: 'Combination Sum II',
    folder: '09-backtracking',
    fileName: '0040-combination-sum-ii.cpp',
    difficulty: 'Medium',
    topic: 'Recursion & Backtracking (Duplicates Handling)',
    time: 'O(2^n)',
    space: 'O(n)',
    code: `/**
 * Problem: 40. Combination Sum II
 * Difficulty: Medium
 * Topic: Recursion & Backtracking (Duplicates Handling)
 * LeetCode Link: https://leetcode.com/problems/combination-sum-ii/
 * 
 * Complexity:
 * - Time: O(2^n)
 * - Space: O(n) recursion stack
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
private:
    void backtrack(const vector<int>& candidates, int target, int start, vector<int>& current, vector<vector<int>>& result) {
        if (target == 0) {
            result.push_back(current);
            return;
        }

        for (size_t i = start; i < candidates.size(); i++) {
            if (candidates[i] > target) break; // Prune branch

            // Skip duplicate elements at the same recursion depth
            if (i > (size_t)start && candidates[i] == candidates[i - 1]) continue;

            current.push_back(candidates[i]);
            backtrack(candidates, target - candidates[i], i + 1, current, result);
            current.pop_back();
        }
    }

public:
    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<vector<int>> result;
        vector<int> current;
        backtrack(candidates, target, 0, current, result);
        return result;
    }
};
`
  },
  {
    id: 67,
    title: 'Add Binary',
    folder: '13-bit-manipulation',
    fileName: '0067-add-binary.cpp',
    difficulty: 'Easy',
    topic: 'Bit Manipulation / String Simulation',
    time: 'O(max(N, M))',
    space: 'O(max(N, M))',
    code: `/**
 * Problem: 67. Add Binary
 * Difficulty: Easy
 * Topic: Bit Manipulation / String Simulation
 * LeetCode Link: https://leetcode.com/problems/add-binary/
 * 
 * Complexity:
 * - Time: O(max(N, M))
 * - Space: O(max(N, M)) for result string
 */

#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
    string addBinary(string a, string b) {
        string result = "";
        int i = a.length() - 1;
        int j = b.length() - 1;
        int carry = 0;

        while (i >= 0 || j >= 0 || carry) {
            int sum = carry;
            if (i >= 0) sum += a[i--] - '0';
            if (j >= 0) sum += b[j--] - '0';

            result.push_back((sum % 2) + '0');
            carry = sum / 2;
        }

        reverse(result.begin(), result.end());
        return result;
    }
};
`
  },
  {
    id: 103,
    title: 'Binary Tree Zigzag Level Order Traversal',
    folder: '07-trees-and-tries',
    fileName: '0103-binary-tree-zigzag-level-order-traversal.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries / BFS',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 103. Binary Tree Zigzag Level Order Traversal
 * Difficulty: Medium
 * Topic: Trees & Tries / BFS
 * LeetCode Link: https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(n) for queue
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
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        if (!root) return {};

        vector<vector<int>> result;
        queue<TreeNode*> q;
        q.push(root);
        bool leftToRight = true;

        while (!q.empty()) {
            int size = q.size();
            vector<int> level(size);

            for (int i = 0; i < size; i++) {
                TreeNode* node = q.front();
                q.pop();

                int index = leftToRight ? i : (size - 1 - i);
                level[index] = node->val;

                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }

            result.push_back(level);
            leftToRight = !leftToRight;
        }

        return result;
    }
};
`
  },
  {
    id: 118,
    title: "Pascal's Triangle",
    folder: '01-arrays-and-hashing',
    fileName: '0118-pascals-triangle.cpp',
    difficulty: 'Easy',
    topic: "Arrays & Dynamic Programming / Pascal's Triangle",
    time: 'O(numRows^2)',
    space: 'O(numRows^2)',
    code: `/**
 * Problem: 118. Pascal's Triangle
 * Difficulty: Easy
 * Topic: Arrays & Dynamic Programming / Pascal's Triangle
 * LeetCode Link: https://leetcode.com/problems/pascals-triangle/
 * 
 * Complexity:
 * - Time: O(numRows^2)
 * - Space: O(numRows^2) for output grid
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<vector<int>> generate(int numRows) {
        vector<vector<int>> triangle;

        for (int i = 0; i < numRows; i++) {
            vector<int> row(i + 1, 1);
            for (int j = 1; j < i; j++) {
                row[j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
            }
            triangle.push_back(row);
        }

        return triangle;
    }
};
`
  },
  {
    id: 119,
    title: "Pascal's Triangle II",
    folder: '01-arrays-and-hashing',
    fileName: '0119-pascals-triangle-ii.cpp',
    difficulty: 'Easy',
    topic: "Arrays & Dynamic Programming / Pascal's Triangle",
    time: 'O(rowIndex^2)',
    space: 'O(rowIndex) 1D array',
    code: `/**
 * Problem: 119. Pascal's Triangle II
 * Difficulty: Easy
 * Topic: Arrays & Dynamic Programming / Pascal's Triangle
 * LeetCode Link: https://leetcode.com/problems/pascals-triangle-ii/
 * 
 * Complexity:
 * - Time: O(rowIndex^2)
 * - Space: O(rowIndex) auxiliary space
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<int> getRow(int rowIndex) {
        vector<int> row(rowIndex + 1, 0);
        row[0] = 1;

        for (int i = 1; i <= rowIndex; i++) {
            for (int j = i; j >= 1; j--) {
                row[j] += row[j - 1];
            }
        }

        return row;
    }
};
`
  },
  {
    id: 120,
    title: 'Triangle',
    folder: '11-dynamic-programming',
    fileName: '0120-triangle.cpp',
    difficulty: 'Medium',
    topic: 'Dynamic Programming / Bottom-Up Grid DP',
    time: 'O(n^2)',
    space: 'O(n) space-optimized',
    code: `/**
 * Problem: 120. Triangle
 * Difficulty: Medium
 * Topic: Dynamic Programming / Bottom-Up Grid DP
 * LeetCode Link: https://leetcode.com/problems/triangle/
 * 
 * Complexity:
 * - Time: O(n^2) where n is number of rows
 * - Space: O(n) auxiliary 1D DP array
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minimumTotal(vector<vector<int>>& triangle) {
        int n = triangle.size();
        vector<int> dp = triangle.back();

        for (int i = n - 2; i >= 0; i--) {
            for (int j = 0; j <= i; j++) {
                dp[j] = triangle[i][j] + min(dp[j], dp[j + 1]);
            }
        }

        return dp[0];
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
  execSync(`git add "${relFilePath}" solutions/README.md scripts/commit-batch-16.js`, { cwd: rootDir });
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
