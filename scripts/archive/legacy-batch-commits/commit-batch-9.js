const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 371,
    title: 'Sum of Two Integers',
    folder: '13-bit-manipulation',
    fileName: '0371-sum-of-two-integers.cpp',
    difficulty: 'Medium',
    topic: 'Bit Manipulation',
    time: 'O(1)',
    space: 'O(1)',
    code: `/**
 * Problem: 371. Sum of Two Integers
 * Difficulty: Medium
 * Topic: Bit Manipulation (Half Adder Logic)
 * LeetCode Link: https://leetcode.com/problems/sum-of-two-integers/
 * 
 * Complexity:
 * - Time: O(1) (at most 32 bits)
 * - Space: O(1)
 */

class Solution {
public:
    int getSum(int a, int b) {
        while (b != 0) {
            unsigned int carry = (unsigned int)(a & b) << 1;
            a = a ^ b;
            b = carry;
        }
        return a;
    }
};
`
  },
  {
    id: 7,
    title: 'Reverse Integer',
    folder: '14-math-and-geometry',
    fileName: '0007-reverse-integer.cpp',
    difficulty: 'Medium',
    topic: 'Math & Number Theory',
    time: 'O(log x)',
    space: 'O(1)',
    code: `/**
 * Problem: 7. Reverse Integer
 * Difficulty: Medium
 * Topic: Math & Number Theory
 * LeetCode Link: https://leetcode.com/problems/reverse-integer/
 * 
 * Complexity:
 * - Time: O(log10(x))
 * - Space: O(1)
 */

#include <climits>

class Solution {
public:
    int reverse(int x) {
        int result = 0;
        while (x != 0) {
            int pop = x % 10;
            x /= 10;

            if (result > INT_MAX / 10 || (result == INT_MAX / 10 && pop > 7)) return 0;
            if (result < INT_MIN / 10 || (result == INT_MIN / 10 && pop < -8)) return 0;

            result = result * 10 + pop;
        }
        return result;
    }
};
`
  },
  {
    id: 48,
    title: 'Rotate Image',
    folder: '14-math-and-geometry',
    fileName: '0048-rotate-image.cpp',
    difficulty: 'Medium',
    topic: 'Math & Number Theory',
    time: 'O(N^2)',
    space: 'O(1)',
    code: `/**
 * Problem: 48. Rotate Image
 * Difficulty: Medium
 * Topic: Math & Geometry (Matrix Rotation)
 * LeetCode Link: https://leetcode.com/problems/rotate-image/
 * 
 * Complexity:
 * - Time: O(N^2)
 * - Space: O(1) in-place
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();

        // 1. Transpose the matrix
        for (int i = 0; i < n; ++i) {
            for (int j = i + 1; j < n; ++j) {
                swap(matrix[i][j], matrix[j][i]);
            }
        }

        // 2. Reverse each row
        for (int i = 0; i < n; ++i) {
            std::reverse(matrix[i].begin(), matrix[i].end());
        }
    }
};
`
  },
  {
    id: 54,
    title: 'Spiral Matrix',
    folder: '14-math-and-geometry',
    fileName: '0054-spiral-matrix.cpp',
    difficulty: 'Medium',
    topic: 'Math & Number Theory',
    time: 'O(M * N)',
    space: 'O(1) excluding output',
    code: `/**
 * Problem: 54. Spiral Matrix
 * Difficulty: Medium
 * Topic: Math & Geometry (Matrix Traversal)
 * LeetCode Link: https://leetcode.com/problems/spiral-matrix/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(1) auxiliary space
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        vector<int> result;
        if (matrix.empty()) return result;

        int top = 0, bottom = matrix.size() - 1;
        int left = 0, right = matrix[0].size() - 1;

        while (top <= bottom && left <= right) {
            // Traverse Right
            for (int col = left; col <= right; ++col) {
                result.push_back(matrix[top][col]);
            }
            top++;

            // Traverse Down
            for (int row = top; row <= bottom; ++row) {
                result.push_back(matrix[row][right]);
            }
            right--;

            // Traverse Left
            if (top <= bottom) {
                for (int col = right; col >= left; --col) {
                    result.push_back(matrix[bottom][col]);
                }
                bottom--;
            }

            // Traverse Up
            if (left <= right) {
                for (int row = bottom; row >= top; --row) {
                    result.push_back(matrix[row][left]);
                }
                left++;
            }
        }
        return result;
    }
};
`
  },
  {
    id: 73,
    title: 'Set Matrix Zeroes',
    folder: '14-math-and-geometry',
    fileName: '0073-set-matrix-zeroes.cpp',
    difficulty: 'Medium',
    topic: 'Math & Number Theory',
    time: 'O(M * N)',
    space: 'O(1)',
    code: `/**
 * Problem: 73. Set Matrix Zeroes
 * Difficulty: Medium
 * Topic: Math & Geometry (In-Place Array Markers)
 * LeetCode Link: https://leetcode.com/problems/set-matrix-zeroes/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(1) in-place
 */

#include <vector>

using namespace std;

class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        bool firstRowZero = false, firstColZero = false;

        for (int i = 0; i < m; ++i) {
            if (matrix[i][0] == 0) firstColZero = true;
        }
        for (int j = 0; j < n; ++j) {
            if (matrix[0][j] == 0) firstRowZero = true;
        }

        for (int i = 1; i < m; ++i) {
            for (int j = 1; j < n; ++j) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }

        for (int i = 1; i < m; ++i) {
            for (int j = 1; j < n; ++j) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                    matrix[i][j] = 0;
                }
            }
        }

        if (firstColZero) {
            for (int i = 0; i < m; ++i) matrix[i][0] = 0;
        }
        if (firstRowZero) {
            for (int j = 0; j < n; ++j) matrix[0][j] = 0;
        }
    }
};
`
  },
  {
    id: 202,
    title: 'Happy Number',
    folder: '14-math-and-geometry',
    fileName: '0202-happy-number.cpp',
    difficulty: 'Easy',
    topic: 'Math & Number Theory',
    time: 'O(log n)',
    space: 'O(1)',
    code: `/**
 * Problem: 202. Happy Number
 * Difficulty: Easy
 * Topic: Math & Number Theory / Floyd's Cycle Detection
 * LeetCode Link: https://leetcode.com/problems/happy-number/
 * 
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

class Solution {
private:
    int getNext(int n) {
        int totalSum = 0;
        while (n > 0) {
            int d = n % 10;
            n = n / 10;
            totalSum += d * d;
        }
        return totalSum;
    }

public:
    bool isHappy(int n) {
        int slow = n;
        int fast = getNext(n);

        while (fast != 1 && slow != fast) {
            slow = getNext(slow);
            fast = getNext(getNext(fast));
        }

        return fast == 1;
    }
};
`
  },
  {
    id: 66,
    title: 'Plus One',
    folder: '14-math-and-geometry',
    fileName: '0066-plus-one.cpp',
    difficulty: 'Easy',
    topic: 'Math & Number Theory',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 66. Plus One
 * Difficulty: Easy
 * Topic: Math & Number Theory
 * LeetCode Link: https://leetcode.com/problems/plus-one/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        int n = digits.size();
        for (int i = n - 1; i >= 0; --i) {
            if (digits[i] < 9) {
                digits[i]++;
                return digits;
            }
            digits[i] = 0;
        }

        digits.insert(digits.begin(), 1);
        return digits;
    }
};
`
  },
  {
    id: 50,
    title: 'Pow(x, n)',
    folder: '14-math-and-geometry',
    fileName: '0050-powx-n.cpp',
    difficulty: 'Medium',
    topic: 'Math & Number Theory',
    time: 'O(log n)',
    space: 'O(1)',
    code: `/**
 * Problem: 50. Pow(x, n)
 * Difficulty: Medium
 * Topic: Math & Number Theory (Binary Exponentiation)
 * LeetCode Link: https://leetcode.com/problems/powx-n/
 * 
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

class Solution {
public:
    double myPow(double x, int n) {
        long long N = n;
        if (N < 0) {
            x = 1 / x;
            N = -N;
        }

        double result = 1.0;
        double currentProduct = x;

        while (N > 0) {
            if (N % 2 == 1) {
                result *= currentProduct;
            }
            currentProduct *= currentProduct;
            N /= 2;
        }

        return result;
    }
};
`
  },
  {
    id: 43,
    title: 'Multiply Strings',
    folder: '14-math-and-geometry',
    fileName: '0043-multiply-strings.cpp',
    difficulty: 'Medium',
    topic: 'Math & Number Theory',
    time: 'O(M * N)',
    space: 'O(M + N)',
    code: `/**
 * Problem: 43. Multiply Strings
 * Difficulty: Medium
 * Topic: Math & Number Theory (Big Integer Multiplication)
 * LeetCode Link: https://leetcode.com/problems/multiply-strings/
 * 
 * Complexity:
 * - Time: O(M * N)
 * - Space: O(M + N)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    string multiply(string num1, string num2) {
        if (num1 == "0" || num2 == "0") return "0";

        int m = num1.size(), n = num2.size();
        vector<int> pos(m + n, 0);

        for (int i = m - 1; i >= 0; --i) {
            for (int j = n - 1; j >= 0; --j) {
                int mul = (num1[i] - '0') * (num2[j] - '0');
                int p1 = i + j, p2 = i + j + 1;
                int sum = mul + pos[p2];

                pos[p2] = sum % 10;
                pos[p1] += sum / 10;
            }
        }

        string result = "";
        for (int p : pos) {
            if (!(result.empty() && p == 0)) {
                result.push_back(p + '0');
            }
        }

        return result.empty() ? "0" : result;
    }
};
`
  },
  {
    id: 146,
    title: 'LRU Cache',
    folder: '06-linked-list',
    fileName: '0146-lru-cache.cpp',
    difficulty: 'Medium',
    topic: 'Linked List',
    time: 'O(1) per op',
    space: 'O(capacity)',
    code: `/**
 * Problem: 146. LRU Cache
 * Difficulty: Medium
 * Topic: Linked List & Hash Map (Design)
 * LeetCode Link: https://leetcode.com/problems/lru-cache/
 * 
 * Complexity:
 * - Time: O(1) for both get and put
 * - Space: O(capacity)
 */

#include <unordered_map>

using namespace std;

class LRUCache {
private:
    struct Node {
        int key, val;
        Node* prev;
        Node* next;
        Node(int k, int v) : key(k), val(v), prev(nullptr), next(nullptr) {}
    };

    int cap;
    unordered_map<int, Node*> map;
    Node* head;
    Node* tail;

    void addNode(Node* node) {
        node->next = head->next;
        node->prev = head;
        head->next->prev = node;
        head->next = node;
    }

    void removeNode(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }

    void moveToHead(Node* node) {
        removeNode(node);
        addNode(node);
    }

    Node* popTail() {
        Node* res = tail->prev;
        removeNode(res);
        return res;
    }

public:
    LRUCache(int capacity) : cap(capacity) {
        head = new Node(-1, -1);
        tail = new Node(-1, -1);
        head->next = tail;
        tail->prev = head;
    }

    int get(int key) {
        if (!map.count(key)) return -1;
        Node* node = map[key];
        moveToHead(node);
        return node->val;
    }

    void put(int key, int value) {
        if (map.count(key)) {
            Node* node = map[key];
            node->val = value;
            moveToHead(node);
        } else {
            Node* newNode = new Node(key, value);
            map[key] = newNode;
            addNode(newNode);

            if (map.size() > cap) {
                Node* tailNode = popTail();
                map.erase(tailNode->key);
                delete tailNode;
            }
        }
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
  const relFilePath = path.join('solutions', p.folder, p.fileName);
  execSync(`git add "${relFilePath}" solutions/README.md scripts/commit-batch-9.js`, { cwd: rootDir });
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
