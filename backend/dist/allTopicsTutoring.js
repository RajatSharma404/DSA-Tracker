"use strict";
/**
 * Complete DSA tutoring content for the bootcamp.
 * Every topic follows the same seven-part format:
 * 1. What is it?
 * 2. Core concept with diagram
 * 3. C++ implementation
 * 4. Dry run
 * 5. Complexity analysis
 * 6. Three classic problems
 * 7. Tricks, edge cases & checkpoint
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTopicContent = exports.ALL_19_DSA_TOPICS = void 0;
exports.ALL_19_DSA_TOPICS = [
    {
        idx: 1,
        name: "Complexity Analysis",
        shortDesc: "Big-O notation and algorithm analysis",
    },
    {
        idx: 2,
        name: "Arrays",
        shortDesc: "Fixed-size contiguous memory operations",
    },
    { idx: 3, name: "Strings", shortDesc: "Character sequences and patterns" },
    {
        idx: 4,
        name: "Linked Lists",
        shortDesc: "Pointer-based dynamic data structures",
    },
    { idx: 5, name: "Stack & Queue", shortDesc: "LIFO and FIFO collections" },
    {
        idx: 6,
        name: "Hashing",
        shortDesc: "Hash tables, sets, and hash functions",
    },
    { idx: 7, name: "Binary Trees", shortDesc: "Tree traversals and recursion" },
    {
        idx: 8,
        name: "Binary Search Trees",
        shortDesc: "Ordered binary search trees",
    },
    {
        idx: 9,
        name: "Heaps & Priority Queues",
        shortDesc: "Priority queues and heap operations",
    },
    { idx: 10, name: "Tries", shortDesc: "Prefix trees and autocomplete" },
    {
        idx: 11,
        name: "Graphs Basics",
        shortDesc: "Graph representations and traversals",
    },
    {
        idx: 12,
        name: "Sorting Algorithms",
        shortDesc: "Comparison and non-comparison sorting",
    },
    {
        idx: 13,
        name: "Binary Search",
        shortDesc: "Logarithmic search and bisection",
    },
    {
        idx: 14,
        name: "Recursion Fundamentals",
        shortDesc: "Recursive problem solving",
    },
    {
        idx: 15,
        name: "Backtracking Strategies",
        shortDesc: "Search with pruning and undo",
    },
    {
        idx: 16,
        name: "Greedy Algorithms",
        shortDesc: "Locally optimal choices",
    },
    {
        idx: 17,
        name: "Dynamic Programming",
        shortDesc: "Overlapping subproblems and memoization",
    },
    {
        idx: 18,
        name: "Advanced DSU/Segment Trees/BIT",
        shortDesc: "Union-Find, Segment Tree, BIT",
    },
    {
        idx: 19,
        name: "Bit Manipulation",
        shortDesc: "Bitwise operations and tricks",
    },
    {
        idx: 20,
        name: "Advanced Graphs",
        shortDesc: "Shortest paths, MST, topo sort",
    },
];
const TOPIC_CONTENTS = {
    1: {
        title: "Complexity Analysis",
        whatIsIt: "Complexity analysis tells us how runtime and memory grow as input grows. It is the first filter for deciding whether a solution will survive interview constraints.",
        concept: `
O(1) -> O(log n) -> O(n) -> O(n log n) -> O(n^2)
Fastest                                         Slowest

Think of it like serving customers:
- O(1): one fixed action
- O(log n): keep cutting work in half
- O(n): inspect every item once
- O(n^2): compare every pair`,
        code: `
#include <bits/stdc++.h>
using namespace std;

int sumArray(const vector<int>& a) {
    int sum = 0;
    for (int x : a) sum += x; // O(n)
    return sum;
}

bool binarySearch(const vector<int>& a, int target) {
    int l = 0, r = (int)a.size() - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (a[m] == target) return true;
        if (a[m] < target) l = m + 1;
        else r = m - 1;
    }
    return false;
}
`,
        dryRun: `
Input: [2, 4, 6, 8]
Loop count for sumArray:
- one pass over 4 items
- total operations grow linearly
So time = O(n)

For binary search on [2,4,6,8] looking for 6:
- middle = 4 -> go right
- middle = 6 -> found
Only 2 checks, so O(log n)`,
        complexity: `
| Pattern | Time | Space |
|---|---:|---:|
| Single loop | O(n) | O(1) |
| Nested loop | O(n^2) | O(1) |
| Binary search | O(log n) | O(1) |
| Merge sort | O(n log n) | O(n) |`,
        problems: `
- Easy: Identify complexity of a given loop snippet.
- Medium: Convert an O(n^2) solution into O(n log n) using sorting or hashing.
- Hard: Estimate the maximum input size allowed under a 1 second time limit.
`,
        tricks: `
- Drop constants and lower-order terms.
- Recursion depth counts as extra space.
- Amortized O(1) can hide occasional O(n) work.

Checkpoint: If an O(n^2) solution passes for n = 1000, how much slower is it at n = 10000?
Answer: about 100 times slower.`,
    },
    2: {
        title: "Arrays",
        whatIsIt: "An array stores same-type elements in contiguous memory. That makes random access instant, but inserting in the middle expensive because elements must shift.",
        concept: `
Index:  0   1   2   3   4
Value: [10, 20, 30, 40, 50]

arr[i] is computed directly from base address + i * element size.
That is why access is O(1).`,
        code: `
#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> a = {10, 20, 30, 40, 50};
    a.push_back(60);               // O(1) amortized
    a.insert(a.begin() + 2, 25);   // O(n)
    a.erase(a.begin() + 3);        // O(n)
    sort(a.begin(), a.end());      // O(n log n)
}
`,
        dryRun: `
Input: [3, 7, 2, 9, 1]
Find maximum:
- max = 3
- compare with 7 -> max = 7
- compare with 2 -> max = 7
- compare with 9 -> max = 9
- compare with 1 -> max = 9
Result = 9`,
        complexity: `
| Operation | Time | Space |
|---|---:|---:|
| Access by index | O(1) | O(1) |
| Search | O(n) | O(1) |
| Insert/delete middle | O(n) | O(1) |
| Sort | O(n log n) | depends |
`,
        problems: `
- Easy: Two Sum
- Medium: Trapping Rain Water
- Hard: Maximum subarray with advanced optimization
`,
        tricks: `
- Use prefix sums for range queries.
- Use two pointers when the array is sorted.
- Watch out for off-by-one indexing.

Checkpoint: Why is arr.insert in the middle slow?
Answer: because every element to the right must shift.`,
    },
    3: {
        title: "Strings",
        whatIsIt: "A string is an ordered sequence of characters. In DSA, strings are usually solved with two pointers, hashing, or sliding windows.",
        concept: `
String:  h  e  l  l  o
Index:   0  1  2  3  4

Useful ideas:
- compare characters from both ends
- count frequencies with a map
- expand/contract a window`,
        code: `
#include <bits/stdc++.h>
using namespace std;

bool isPalindrome(string s) {
    int l = 0, r = (int)s.size() - 1;
    while (l < r) {
        if (s[l++] != s[r--]) return false;
    }
    return true;
}

int longestUniqueSubstring(string s) {
    vector<int> last(256, -1);
    int best = 0, left = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        left = max(left, last[(unsigned char)s[right]] + 1);
        last[(unsigned char)s[right]] = right;
        best = max(best, right - left + 1);
    }
    return best;
}
`,
        dryRun: `
Input: "abca"
Palindrome check:
- a == a
- b == c? no, so false

Input: "abcabcbb"
Longest unique window grows and shrinks while repeating characters are removed from the left.
`,
        complexity: `
| Pattern | Time | Space |
|---|---:|---:|
| Two pointers | O(n) | O(1) |
| Frequency map | O(n) | O(1) or O(26/256) |
| Naive substring search | O(n^2) | O(1) |
`,
        problems: `
- Easy: Valid Palindrome
- Medium: Longest Substring Without Repeating Characters
- Hard: Minimum Window Substring
`,
        tricks: `
- Cast to unsigned char when indexing frequency arrays.
- Use sliding window for substring problems.
- String concatenation inside loops can be quadratic.

Checkpoint: Why is a frequency array often faster than a map for lowercase strings?
Answer: fixed-size arrays avoid hashing overhead.`,
    },
    4: {
        title: "Linked Lists",
        whatIsIt: "A linked list stores nodes that point to the next node. It is flexible for insertions and deletions, but you cannot jump directly to an index like in an array.",
        concept: `
head -> [1|*] -> [2|*] -> [3|null]

Each node has:
- value
- next pointer

Good for:
- constant-time insert after a known node
- easy reversal with pointers`,
        code: `
#include <bits/stdc++.h>
using namespace std;

struct Node {
    int val;
    Node* next;
    Node(int v) : val(v), next(nullptr) {}
};

Node* reverseList(Node* head) {
    Node* prev = nullptr;
    while (head) {
        Node* nxt = head->next;
        head->next = prev;
        prev = head;
        head = nxt;
    }
    return prev;
}
`,
        dryRun: `
List: 1 -> 2 -> 3
Reverse steps:
- prev = null, curr = 1
- point 1 to null
- move to 2
- point 2 to 1
- move to 3
- point 3 to 2
Result: 3 -> 2 -> 1
`,
        complexity: `
| Operation | Time | Space |
|---|---:|---:|
| Traverse | O(n) | O(1) |
| Insert/delete at known node | O(1) | O(1) |
| Search by value | O(n) | O(1) |
| Reverse | O(n) | O(1) |
`,
        problems: `
- Easy: Reverse Linked List
- Medium: Detect Cycle
- Hard: Reverse Nodes in k-Group
`,
        tricks: `
- Always store next before rewiring pointers.
- Use dummy nodes for clean edge handling.
- Slow/fast pointers are the default for cycle and middle-node problems.

Checkpoint: Why is linked list access by index O(n)?
Answer: you must follow pointers one node at a time.`,
    },
    5: {
        title: "Stack & Queue",
        whatIsIt: "A stack is LIFO and a queue is FIFO. They model real processes like undo stacks, browser history, ticket lines, and BFS traversal.",
        concept: `
Stack: push/pop on top only
Queue: push at back, pop from front

Stack: [1,2,3] -> pop returns 3
Queue: [1,2,3] -> pop returns 1`,
        code: `
#include <bits/stdc++.h>
using namespace std;

bool validParentheses(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) return false;
            char t = st.top(); st.pop();
            if ((c == ')' && t != '(') || (c == '}' && t != '{') || (c == ']' && t != '[')) return false;
        }
    }
    return st.empty();
}
`,
        dryRun: `
Input: "()[]{}"
- push '(' then pop on ')'
- push '[' then pop on ']'
- push '{' then pop on '}'
Stack ends empty => valid
`,
        complexity: `
| Structure | Push | Pop | Top/Front | Space |
|---|---:|---:|---:|---:|
| Stack | O(1) | O(1) | O(1) | O(n) |
| Queue | O(1) | O(1) | O(1) | O(n) |
`,
        problems: `
- Easy: Valid Parentheses
- Medium: Min Stack
- Hard: Sliding Window Maximum
`,
        tricks: `
- Monotonic stacks solve next greater/smaller problems.
- Use deque for sliding window maximum.
- If the problem says reverse order, think stack first.

Checkpoint: What is the difference between stack and queue order?
Answer: stack is LIFO, queue is FIFO.`,
    },
    6: {
        title: "Hashing",
        whatIsIt: "Hashing converts a key into a table index so we can store and find values quickly. In interviews it is the fastest way to trade memory for speed.",
        concept: `
key -> hash function -> bucket/index

Example:
"apple" -> 4
"banana" -> 1

Collisions happen when two keys map to the same bucket.`,
        code: `
#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int,int> pos;
    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];
        if (pos.count(need)) return {pos[need], i};
        pos[nums[i]] = i;
    }
    return {};
}
`,
        dryRun: `
nums = [2,7,11,15], target = 9
- see 2, store 2->0
- see 7, need 2, found at 0
Return [0,1]
`,
        complexity: `
| Operation | Average | Worst |
|---|---:|---:|
| insert/find | O(1) | O(n) |
| iteration | O(n) | O(n) |
`,
        problems: `
- Easy: Two Sum
- Medium: Group Anagrams
- Hard: Longest Consecutive Sequence
`,
        tricks: `
- unordered_map / unordered_set are usually O(1) average.
- Beware bad hash behavior in adversarial cases.
- Hash maps are great for prefix-sum problems.

Checkpoint: Why can hash collisions slow things down?
Answer: multiple keys end up in the same bucket, so lookups take longer.`,
    },
    7: {
        title: "Binary Trees",
        whatIsIt: "A binary tree is a hierarchical structure where each node has at most two children. Traversals are the main skill: preorder, inorder, postorder, and level order.",
        concept: `
      1
     / \
    2   3
   / \   \
  4   5   6

Traversals:
- preorder: root, left, right
- inorder: left, root, right
- postorder: left, right, root`,
        code: `
#include <bits/stdc++.h>
using namespace std;

struct TreeNode {
    int val; TreeNode *left, *right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

void inorder(TreeNode* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << ' ';
    inorder(root->right);
}
`,
        dryRun: `
For tree 1-2-3:
- inorder(left of 1) => 2's left subtree
- visit 1
- inorder(right of 1) => 3 subtree
This produces sorted order only when the tree is a BST.
`,
        complexity: `
| Traversal | Time | Space |
|---|---:|---:|
| DFS recursion | O(n) | O(h) |
| BFS level order | O(n) | O(w) |
`,
        problems: `
- Easy: Maximum Depth of Binary Tree
- Medium: Level Order Traversal
- Hard: Diameter of Binary Tree
`,
        tricks: `
- Base case is always if (root == nullptr).
- Height drives recursion stack usage.
- Use BFS for level-wise questions.

Checkpoint: Why does inorder traversal not always mean sorted order?
Answer: only BSTs guarantee sorted inorder.`,
    },
    8: {
        title: "Binary Search Trees",
        whatIsIt: "A binary search tree keeps left subtree values smaller and right subtree values larger than the root. That ordering gives fast search, insert, and delete when balanced.",
        concept: `
      8
     / \
    3   10
   / \    \
  1   6    14

Rule: left < root < right
Inorder traversal of a BST is sorted.`,
        code: `
#include <bits/stdc++.h>
using namespace std;

struct Node { int val; Node *l, *r; Node(int v): val(v), l(nullptr), r(nullptr) {} };

Node* insert(Node* root, int v) {
    if (!root) return new Node(v);
    if (v < root->val) root->l = insert(root->l, v);
    else root->r = insert(root->r, v);
    return root;
}
`,
        dryRun: `
Insert 7 into BST rooted at 8:
- 7 < 8 -> go left
- 7 > 3 -> go right
- 7 > 6 -> go right
- insert at empty child
`,
        complexity: `
| Operation | Balanced | Skewed |
|---|---:|---:|
| Search/Insert/Delete | O(log n) | O(n) |
`,
        problems: `
- Easy: Validate BST
- Medium: Kth Smallest in BST
- Hard: Serialize/Deserialize BST
`,
        tricks: `
- Always store lower and upper bounds for validation.
- BSTs can degrade into linked lists if unbalanced.
- Inorder predecessor/successor are common delete helpers.

Checkpoint: Why is BST search fast when the tree is balanced?
Answer: every comparison cuts the search space roughly in half.`,
    },
    9: {
        title: "Heaps & Priority Queues",
        whatIsIt: "A heap is a complete binary tree with a priority rule. Min-heaps and max-heaps are used whenever you need quick access to the smallest or largest item.",
        concept: `
Min-heap example:
      1
     / \
    3   5
   / \
  4   8

Parent <= children in a min-heap.
It is not a sorted tree, just a priority structure.`,
        code: `
#include <bits/stdc++.h>
using namespace std;

int kthLargest(vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> pq;
    for (int x : nums) {
        pq.push(x);
        if ((int)pq.size() > k) pq.pop();
    }
    return pq.top();
}
`,
        dryRun: `
nums = [3,2,1,5,6,4], k = 2
Keep a min-heap of size 2:
- insert 3,2
- when 1 comes, heap keeps 1 and 2
- when 5 comes, remove 1
- when 6 comes, remove 2
Top = 5
`,
        complexity: `
| Operation | Time |
|---|---:|
| insert | O(log n) |
| extract min/max | O(log n) |
| top | O(1) |
`,
        problems: `
- Easy: Kth Largest Element
- Medium: Top K Frequent Elements
- Hard: Merge K Sorted Lists
`,
        tricks: `
- A heap is ideal for streaming top-k problems.
- Use a min-heap for keeping the best k items.
- In C++, priority_queue is max-heap by default.

Checkpoint: Why is heap top O(1) but insert O(log n)?
Answer: top is stored at the root, insert may need to bubble up.`,
    },
    10: {
        title: "Tries",
        whatIsIt: "A trie stores strings by prefix. It is the right tool for autocomplete, dictionary lookup, and prefix-based search.",
        concept: `
root
 ├─ c ─ a ─ t
 └─ c ─ a ─ r

Shared prefixes are stored once.
That makes prefix queries very fast.`,
        code: `
#include <bits/stdc++.h>
using namespace std;

struct TrieNode {
    bool end = false;
    TrieNode* child[26]{};
};

void insert(TrieNode* root, const string& s) {
    TrieNode* cur = root;
    for (char c : s) {
        int i = c - 'a';
        if (!cur->child[i]) cur->child[i] = new TrieNode();
        cur = cur->child[i];
    }
    cur->end = true;
}
`,
        dryRun: `
Insert "cat" and "car":
- c -> a shared
- t and r split only at the last character
Prefix "ca" exists, so autocomplete can use it.
`,
        complexity: `
| Operation | Time | Space |
|---|---:|---:|
| insert/search/prefix | O(m) | O(total characters) |
`,
        problems: `
- Easy: Implement Trie
- Medium: Word Search II
- Hard: Maximum XOR of Two Numbers using Trie
`,
        tricks: `
- Trie time depends on word length, not number of words.
- Use tries for prefix and lexicographic tasks.
- Compressing nodes can save memory for large alphabets.

Checkpoint: Why are tries useful for autocomplete?
Answer: once the prefix node is found, the remaining subtree holds all completions.`,
    },
    11: {
        title: "Graphs Basics",
        whatIsIt: "A graph models relationships between nodes. Use graphs for networks, dependencies, routes, schedules, and anything that is not naturally linear.",
        concept: `
Adjacency list example:
1: 2, 3
2: 4
3: 4
4: -

Traverse with DFS or BFS.
Represent with adjacency list when the graph is sparse.`,
        code: `
#include <bits/stdc++.h>
using namespace std;

void bfs(int start, vector<vector<int>>& g) {
    queue<int> q;
    vector<int> vis(g.size());
    q.push(start); vis[start] = 1;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : g[u]) if (!vis[v]) {
            vis[v] = 1;
            q.push(v);
        }
    }
}
`,
        dryRun: `
Start BFS from node 1:
- visit 1
- push its neighbors 2 and 3
- visit 2, then 3
- continue level by level
`,
        complexity: `
| Traversal | Time | Space |
|---|---:|---:|
| DFS/BFS | O(V + E) | O(V) |
`,
        problems: `
- Easy: Number of Islands
- Medium: Course Schedule
- Hard: Word Ladder
`,
        tricks: `
- Use adjacency list for sparse graphs.
- BFS is shortest path in unweighted graphs.
- DFS is great for components, cycles, and topological ideas.

Checkpoint: Why is BFS preferred for shortest path in an unweighted graph?
Answer: it explores edges layer by layer, so the first time you reach a node is the shortest distance.`,
    },
    12: {
        title: "Sorting Algorithms",
        whatIsIt: "Sorting arranges elements into a chosen order. It is often the cheapest way to make a hard problem easier because sorted order enables two pointers and binary search.",
        concept: `
Unsorted: [5, 1, 4, 2, 8]
Sorted:   [1, 2, 4, 5, 8]

Choose the algorithm based on:
- data size
- stability
- memory usage
- whether values are bounded`,
        code: `
#include <bits/stdc++.h>
using namespace std;

void mergeSort(vector<int>& a, int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(a, l, m);
    mergeSort(a, m + 1, r);
    vector<int> tmp;
    int i = l, j = m + 1;
    while (i <= m || j <= r) {
        if (j > r || (i <= m && a[i] <= a[j])) tmp.push_back(a[i++]);
        else tmp.push_back(a[j++]);
    }
    for (int k = 0; k < (int)tmp.size(); k++) a[l + k] = tmp[k];
}
`,
        dryRun: `
Merge sort on [5,1,4,2]:
- split into [5,1] and [4,2]
- sort halves into [1,5] and [2,4]
- merge into [1,2,4,5]
`,
        complexity: `
| Algorithm | Time | Space |
|---|---:|---:|
| Merge sort | O(n log n) | O(n) |
| Quick sort average | O(n log n) | O(log n) |
| Bubble sort | O(n^2) | O(1) |
`,
        problems: `
- Easy: Sort Colors
- Medium: Merge Intervals
- Hard: Count of Smaller Numbers After Self
`,
        tricks: `
- Stable sorts preserve equal-element order.
- Sorting can simplify later logic massively.
- Counting sort is great when the value range is small.

Checkpoint: Why is sorting sometimes worth doing before solving a problem?
Answer: because a sorted structure enables faster downstream patterns like two pointers and binary search.`,
    },
    13: {
        title: "Binary Search",
        whatIsIt: "Binary search finds an answer by repeatedly halving the search space. It works on sorted data or on any monotonic predicate.",
        concept: `
Array: [1, 3, 5, 7, 9, 11]
Target: 7

mid -> compare -> throw away half

This idea also works on answer space, not just arrays.`,
        code: `
#include <bits/stdc++.h>
using namespace std;

int firstTrue(int n, function<bool(int)> ok) {
    int l = 0, r = n;
    while (l < r) {
        int m = l + (r - l) / 2;
        if (ok(m)) r = m;
        else l = m + 1;
    }
    return l;
}
`,
        dryRun: `
Search 7 in [1,3,5,7,9,11]:
- mid = 5 -> go right
- mid = 9 -> go left
- mid = 7 -> found
Only a few checks because each step halves the interval.
`,
        complexity: `
| Case | Time | Space |
|---|---:|---:|
| Normal binary search | O(log n) | O(1) |
| Binary search on answer | O(log range) * cost of check | O(1) |
`,
        problems: `
- Easy: Binary Search
- Medium: Search in Rotated Sorted Array
- Hard: Split Array Largest Sum
`,
        tricks: `
- Use l + (r - l) / 2 to avoid overflow.
- Keep invariant clean: answer always remains inside the search range.
- Binary search is often about finding the first/last valid position.

Checkpoint: What property must the predicate have for binary search on answer space?
Answer: it must be monotonic.`,
    },
    14: {
        title: "Recursion Fundamentals",
        whatIsIt: "Recursion solves a problem by calling the same function on smaller inputs until it reaches a base case. It is the foundation of tree and backtracking solutions.",
        concept: `
function(n)
  -> function(n-1)
    -> function(n-2)
      ...
      -> base case

Two parts are mandatory:
- base case
- recursive step`,
        code: `
#include <bits/stdc++.h>
using namespace std;

int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

int fibMemo(int n, vector<int>& dp) {
    if (n <= 1) return n;
    if (dp[n] != -1) return dp[n];
    return dp[n] = fibMemo(n - 1, dp) + fibMemo(n - 2, dp);
}
`,
        dryRun: `
fib(4)
= fib(3) + fib(2)
= (fib(2)+fib(1)) + (fib(1)+fib(0))
= 3
The call tree repeats work unless memoized.
`,
        complexity: `
| Approach | Time | Space |
|---|---:|---:|
| Naive recursion | exponential | O(depth) |
| Memoized recursion | O(n) | O(n) |
`,
        problems: `
- Easy: Factorial
- Medium: Fibonacci with memoization
- Hard: Generate all subsets recursively
`,
        tricks: `
- Always ask: what is the smaller subproblem?
- Memoization converts repeated work into one-time work.
- Recursion stack is part of the space cost.

Checkpoint: What happens if a recursive function has no base case?
Answer: it recurses forever until stack overflow.`,
    },
    15: {
        title: "Backtracking Strategies",
        whatIsIt: "Backtracking explores choices, and when a path fails it undoes the choice and tries the next one. It is exhaustive search with pruning.",
        concept: `
Decision tree:
- choose
- explore
- undo
- try next

Used for permutations, combinations, subsets, Sudoku, N-Queens, and word search.`,
        code: `
#include <bits/stdc++.h>
using namespace std;

void permute(vector<int>& nums, int idx, vector<vector<int>>& ans) {
    if (idx == (int)nums.size()) {
        ans.push_back(nums);
        return;
    }
    for (int i = idx; i < (int)nums.size(); i++) {
        swap(nums[idx], nums[i]);
        permute(nums, idx + 1, ans);
        swap(nums[idx], nums[i]); // undo
    }
}
`,
        dryRun: `
nums = [1,2,3]
- fix 1, recurse on [2,3]
- fix 2, recurse on [3]
- fix 3, record permutation
- undo and try different swaps
`,
        complexity: `
| Problem type | Time |
|---|---:|
| permutations | O(n!) |
| subsets | O(2^n) |
| combination search | exponential |
`,
        problems: `
- Easy: Subsets
- Medium: Permutations
- Hard: N-Queens
`,
        tricks: `
- Choose / Explore / Unchoose is the standard template.
- Prune early when a choice violates the constraint.
- Backtracking is usually exponential, so pruning matters a lot.

Checkpoint: Why do we swap back after recursion in permutation generation?
Answer: to restore the state before trying the next option.`,
    },
    16: {
        title: "Greedy Algorithms",
        whatIsIt: "Greedy algorithms make the best local choice at each step hoping it leads to a global optimum. The hard part is proving that the greedy choice is safe.",
        concept: `
At each step:
- pick the best-looking option now
- never revisit old choices

Works when the problem has greedy-choice property and optimal substructure.`,
        code: `
#include <bits/stdc++.h>
using namespace std;

int minPlatforms(vector<int>& arr, vector<int>& dep) {
    sort(arr.begin(), arr.end());
    sort(dep.begin(), dep.end());
    int i = 0, j = 0, cur = 0, ans = 0;
    while (i < (int)arr.size()) {
        if (arr[i] <= dep[j]) cur++, i++;
        else cur--, j++;
        ans = max(ans, cur);
    }
    return ans;
}
`,
        dryRun: `
Arrivals: [900, 940, 950]
Departures: [910, 1200, 1120]
- next arrival before next departure -> platform count rises
- track maximum concurrent trains
`,
        complexity: `
| Step | Time |
|---|---:|
| sort | O(n log n) |
| sweep | O(n) |
`,
        problems: `
- Easy: Assign Cookies
- Medium: Activity Selection
- Hard: Minimum Number of Platforms
`,
        tricks: `
- Sort first, then sweep when the greedy proof depends on order.
- Greedy solutions need proof, not just intuition.
- If choosing the earliest finishing thing helps, greedy is often involved.

Checkpoint: Why can greedy fail on some problems?
Answer: because a locally best choice may block a better global solution later.`,
    },
    17: {
        title: "Dynamic Programming",
        whatIsIt: "Dynamic programming stores answers to overlapping subproblems so each state is solved once. It is the cure for repeated recursion.",
        concept: `
Think in states:
- define state
- define transition
- define base case
- compute in top-down or bottom-up order`,
        code: `
#include <bits/stdc++.h>
using namespace std;

int climbStairs(int n) {
    vector<int> dp(n + 1, 0);
    dp[0] = 1;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}
`,
        dryRun: `
To reach step 4:
- ways(2) = ways(1) + ways(0)
- ways(3) = ways(2) + ways(1)
- ways(4) = ways(3) + ways(2)
Table grows from the bottom up.
`,
        complexity: `
| Approach | Time | Space |
|---|---:|---:|
| memoization | O(n) | O(n) |
| tabulation | O(n) | O(n) |
| optimized tabulation | O(n) | O(1) |
`,
        problems: `
- Easy: Climbing Stairs
- Medium: House Robber
- Hard: Longest Common Subsequence
`,
        tricks: `
- Define the state carefully before coding.
- Memoization and tabulation are usually the same recurrence in different orders.
- Space optimization often works when the transition only depends on a few previous states.

Checkpoint: What is the main sign that a problem wants DP?
Answer: overlapping subproblems plus an optimal substructure.`,
    },
    18: {
        title: "Advanced DSU/Segment Trees/BIT",
        whatIsIt: "DSU, segment trees, and BIT are advanced tools for fast connectivity and range queries. DSU handles merging sets, while segment trees and BIT answer updates and queries efficiently.",
        concept: `
DSU: union sets and find their representative
Segment Tree: split array into segments for range queries
BIT: maintain prefix information in logarithmic time`,
        code: `
#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> p, sz;
    DSU(int n): p(n), sz(n, 1) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        p[b] = a; sz[a] += sz[b];
        return true;
    }
};
`,
        dryRun: `
Union 1-2, then 2-3:
- 1 and 2 become one set
- 3 joins the same representative through 2
Path compression makes future finds faster.
`,
        complexity: `
| Structure | Update | Query |
|---|---:|---:|
| DSU | O(alpha(n)) | O(alpha(n)) |
| Segment Tree | O(log n) | O(log n) |
| BIT | O(log n) | O(log n) |
`,
        problems: `
- Easy: Number of Connected Components with DSU
- Medium: Range Sum Query with Segment Tree
- Hard: Dynamic connectivity / range update problems
`,
        tricks: `
- DSU is for connectivity, not for shortest paths.
- Segment trees are great when updates and queries are both frequent.
- BIT is simpler than segment tree when the query is prefix-based.

Checkpoint: When should you choose a BIT over a segment tree?
Answer: when you only need prefix/range-sum style queries with point updates.`,
    },
    19: {
        title: "Bit Manipulation",
        whatIsIt: "Bit manipulation uses binary representations directly. It is a compact way to toggle flags, test parity, and solve problems with XOR or bit masks.",
        concept: `
Binary examples:
5 = 0101
3 = 0011

Operations:
& AND
| OR
^ XOR
<< left shift
>> right shift`,
        code: `
#include <bits/stdc++.h>
using namespace std;

int singleNumber(vector<int>& nums) {
    int x = 0;
    for (int v : nums) x ^= v;
    return x;
}

bool isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}
`,
        dryRun: `
For nums = [2,2,1]:
- x = 0 ^ 2 = 2
- x = 2 ^ 2 = 0
- x = 0 ^ 1 = 1
XOR cancels duplicates and leaves the unique number.
`,
        complexity: `
| Operation | Time | Space |
|---|---:|---:|
| bit check / toggle / XOR scan | O(n) | O(1) |
`,
        problems: `
- Easy: Single Number
- Medium: Counting Bits
- Hard: Subsets with Bitmasking
`,
        tricks: `
- n & (n - 1) clears the lowest set bit.
- XOR is perfect when every value appears twice except one.
- Use masks to track multiple boolean properties at once.

Checkpoint: Why does n & (n - 1) remove the lowest set bit?
Answer: it flips the rightmost 1 to 0 and leaves the higher bits untouched.`,
    },
    20: {
        title: "Advanced Graphs",
        whatIsIt: "Advanced graph algorithms solve shortest path, minimum spanning tree, and dependency ordering problems. These are the interview-level graph topics.",
        concept: `
Common tools:
- Dijkstra for weighted shortest path
- Kruskal/Prim for MST
- Topological sort for DAG order
- SCC for cycle structure
`,
        code: `
#include <bits/stdc++.h>
using namespace std;

vector<int> dijkstra(int n, vector<vector<pair<int,int>>>& g, int src) {
    const int INF = 1e9;
    vector<int> dist(n, INF);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    dist[src] = 0; pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d != dist[u]) continue;
        for (auto [v, w] : g[u]) {
            if (dist[v] > d + w) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}
`,
        dryRun: `
Start from source 0.
- extract smallest distance node
- relax neighbors
- keep updating the best known distances
This repeats until all reachable nodes are finalized.
`,
        complexity: `
| Algorithm | Time |
|---|---:|
| Dijkstra | O((V + E) log V) |
| Kruskal | O(E log E) |
| Topological sort | O(V + E) |
`,
        problems: `
- Easy: Course Schedule (topological ordering)
- Medium: Network Delay Time
- Hard: Minimum Spanning Tree / shortest path variants
`,
        tricks: `
- Dijkstra does not work with negative edges.
- Topological sort only works on DAGs.
- For MST, Kruskal uses DSU while Prim uses a heap.

Checkpoint: Why does Dijkstra fail on negative weights?
Answer: a node that looks final early can later get a shorter path through a negative edge.`,
    },
};
const buildTopicMarkdown = (topic) => {
    return [
        `# ${topic.title}`,
        `## 1. What is it?\n\n${topic.whatIsIt}`,
        `## 2. Core concept with diagram\n\n${topic.concept}`,
        `## 3. C++ implementation\n\n\`\`\`cpp\n${topic.code.trim()}\n\`\`\``,
        `## 4. Dry run\n\n${topic.dryRun}`,
        `## 5. Complexity analysis\n\n${topic.complexity}`,
        `## 6. Three classic problems\n\n${topic.problems}`,
        `## 7. Tricks, edge cases & checkpoint\n\n${topic.tricks}`,
    ].join("\n\n");
};
const generateTopicContent = (topicIdx) => {
    const topic = TOPIC_CONTENTS[topicIdx];
    if (!topic) {
        return [
            `# Topic ${topicIdx}`,
            "## 1. What is it?\n\nContent coming soon.",
            "## 2. Core concept with diagram\n\nContent coming soon.",
            "## 3. C++ implementation\n\n```cpp\n// Content coming soon\n```",
            "## 4. Dry run\n\nContent coming soon.",
            "## 5. Complexity analysis\n\nContent coming soon.",
            "## 6. Three classic problems\n\nContent coming soon.",
            "## 7. Tricks, edge cases & checkpoint\n\nContent coming soon.",
        ].join("\n\n");
    }
    return buildTopicMarkdown(topic);
};
exports.generateTopicContent = generateTopicContent;
//# sourceMappingURL=allTopicsTutoring.js.map