"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topics6to10 = void 0;
exports.topics6to10 = {
    6: {
        title: "Hashing",
        whatIsIt: `Hashing is the ultimate trade-off: sacrificing memory for blazing-fast \`O(1)\` lookup speeds. 
    
A Hash Map (or Hash Table) takes a key (like a string or a number), passes it through a mathematical "Hash Function," and instantly converts it into an array index. This means you can store, retrieve, and delete items in constant time without having to loop over an array. Hash Maps are the backbone of databases, caching systems (like Redis), and solving interview problems optimally.`,
        concept: `### How a Hash Map Works

Imagine we have an array (buckets) of size 5. We want to store the key \`"apple"\`.
1. Pass \`"apple"\` into the Hash Function.
2. The Hash Function returns an integer, say \`14\`.
3. We take the modulo to fit our array: \`14 % 5 = 4\`.
4. We store the value at bucket index \`4\`.

\`\`\`text
Buckets:
[0] -> empty
[1] -> empty
[2] -> empty
[3] -> empty
[4] -> "apple"
\`\`\`

### The Collision Problem
What happens if we insert \`"banana"\`, its hash is \`9\`, and \`9 % 5 = 4\`? We have a collision! Both items want bucket 4.
Hash Maps handle this using **Chaining** (turning bucket 4 into a linked list of values) or **Open Addressing** (finding the next available empty bucket).`,
        code: `// C++ Implementation of Hashing
#include <bits/stdc++.h>
using namespace std;

// 1. Two Sum using a Hash Map
// O(N) Time, O(N) Space
vector<int> twoSum(vector<int>& nums, int target) {
    // unordered_map in C++ is a Hash Map. (map is a Tree!)
    unordered_map<int, int> numMap; 
    
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        
        // If the complement exists in our map, we found our pair!
        if (numMap.count(complement)) {
            return {numMap[complement], i};
        }
        
        // Otherwise, store the current number and its index
        numMap[nums[i]] = i;
    }
    return {};
}

// 2. Hash Set Example (Finding duplicates)
bool containsDuplicate(vector<int>& nums) {
    unordered_set<int> seen;
    for (int num : nums) {
        if (seen.count(num)) return true;
        seen.insert(num);
    }
    return false;
}`,
        dryRun: `### Dry Run: Two Sum

Given: \`nums = [2, 7, 11, 15]\`, \`target = 9\`

1. **i = 0, nums[0] = 2**:
   - \`complement = 9 - 2 = 7\`.
   - Is \`7\` in \`numMap\`? No. (Map is empty).
   - Add \`2\` to map: \`numMap[2] = 0\`.
2. **i = 1, nums[1] = 7**:
   - \`complement = 9 - 7 = 2\`.
   - Is \`2\` in \`numMap\`? YES! It is at index 0.
   - Return \`{numMap[2], i}\` -> \`{0, 1}\`.

By using a Hash Map to "remember" numbers we've seen, we avoided a nested loop, converting an \`O(N^2)\` brute force into an elegant \`O(N)\` solution.`,
        complexity: `### Time and Space Constraints

| Operation | Time Complexity (Avg) | Time Complexity (Worst) | Explanation |
| :--- | :--- | :--- | :--- |
| **Insert** | \`O(1)\` | \`O(N)\` | Instant, unless a severe hash collision occurs. |
| **Search / Lookup** | \`O(1)\` | \`O(N)\` | Jump straight to bucket. If chaning occurs, traverse the list. |
| **Delete** | \`O(1)\` | \`O(N)\` | Remove item from bucket. |

*Note: The \`O(N)\` worst-case scenario happens if the Hash Function is terrible and maps EVERY key to the exact same bucket, turning the Hash Map into a giant Linked List. Standard libraries use highly optimized hash functions to make this statistically impossible.*`,
        problems: `### Classic Problems to Master

1. **[Easy] Two Sum:** (Pattern: Store \`target - current\` as you iterate).
2. **[Medium] Group Anagrams:** (Pattern: Sort the string to use as the Hash Map Key, append original strings to a list as the Value).
3. **[Medium] Longest Consecutive Sequence:** (Pattern: Dump all numbers into a Hash Set. Only start counting a sequence if \`num - 1\` does NOT exist in the set, ensuring \`O(N)\` time).
4. **[Hard] Subarray Sum Equals K:** (Pattern: Store a running "Prefix Sum" inside a Hash Map to find contiguous subarrays).`,
        tricks: `### Tricks, Edge Cases, & Common Traps

- **Map vs Unordered_Map:** In C++, \`std::map\` is implemented as a Red-Black Tree (O(log N) operations). \`std::unordered_map\` is the actual Hash Map (O(1) operations). Always default to \`unordered_map\` unless you explicitly need the keys to be sorted!
- **Hash Map for Counting:** Hash Maps are perfect for calculating frequencies of elements in arrays. 
- **Keys MUST be Hashable:** You cannot easily use complex objects (like a vector) as a key in a Hash Map without writing a custom hash function. Stick to integers, strings, or simple primitives.

> **Checkpoint Question:** Why do Hash Maps sometimes suddenly lag during an insertion?
> **Answer:** Similar to Dynamic Arrays, when the Hash Map gets too full (high load factor), it must halt execution to allocate a larger bucket array and completely re-hash every single existing key into the new layout.`
    },
    7: {
        title: "Binary Trees",
        whatIsIt: `A Binary Tree is a hierarchical, non-linear data structure. Unlike arrays where data is stored in a flat line, a tree branches outwards. 

A tree consists of "Nodes". The topmost node is the **Root**. Every node contains a value and up to two pointers connecting it to its **Left Child** and **Right Child**. Binary Trees are the foundation for file systems, database indexing (B-Trees), and rendering HTML (the DOM Tree).

Because trees are inherently recursive (a tree is just a node connected to two smaller sub-trees), almost all tree problems are solved using **Recursion (Depth-First Search)** or a **Queue (Breadth-First Search)**.`,
        concept: `### Tree Anatomy and Traversals

\`\`\`text
        1          <-- Root Node (Depth 0)
       / \\
      2   3        <-- Level 1
     / \\   \\
    4   5   6      <-- Leaf Nodes (No children)
\`\`\`

**Depth First Search (DFS)** - Explores as deep as possible before backtracking.
- **Pre-Order (Root, Left, Right):** \`1, 2, 4, 5, 3, 6\` (Used for copying/serializing a tree)
- **In-Order (Left, Root, Right):** \`4, 2, 5, 1, 3, 6\` (Outputs sorted data in a BST)
- **Post-Order (Left, Right, Root):** \`4, 5, 2, 6, 3, 1\` (Used for deleting a tree, process children first)

**Breadth First Search (BFS)** - Explores layer by layer.
- **Level-Order:** \`1, 2, 3, 4, 5, 6\` (Requires a Queue!)`,
        code: `// C++ Implementation of Tree Traversals
#include <bits/stdc++.h>
using namespace std;

// Tree Node Definition
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

// 1. DFS: Maximum Depth of Binary Tree
// O(N) Time, O(H) Space where H is the height of the tree
int maxDepth(TreeNode* root) {
    if (root == nullptr) return 0; // Base case: Empty tree has 0 height
    
    int leftDepth = maxDepth(root->left);
    int rightDepth = maxDepth(root->right);
    
    return max(leftDepth, rightDepth) + 1; // Add 1 for the current node
}

// 2. BFS: Level Order Traversal
// O(N) Time, O(W) Space where W is the max width of the tree
vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> result;
    if (!root) return result;
    
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        int levelSize = q.size();
        vector<int> currentLevel;
        
        // Process all nodes currently in the queue (one full level)
        for (int i = 0; i < levelSize; i++) {
            TreeNode* node = q.front();
            q.pop();
            
            currentLevel.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        result.push_back(currentLevel);
    }
    return result;
}`,
        dryRun: `### Dry Run: Maximum Depth (DFS)

Given Tree: Root(1) -> Left(2), Right(3). Node 3 has Right(6).

1. \`maxDepth(1)\` is called.
   - It calls \`maxDepth(2)\` and \`maxDepth(3)\`.
2. \`maxDepth(2)\` is called. 
   - Left and Right are null. Calls \`maxDepth(null)\` which return 0.
   - Returns \`max(0, 0) + 1 = 1\`.
3. \`maxDepth(3)\` is called.
   - Left is null (returns 0). 
   - Right calls \`maxDepth(6)\`.
4. \`maxDepth(6)\` is called.
   - Left and Right are null. Returns \`max(0, 0) + 1 = 1\`.
5. Back up to \`maxDepth(3)\`.
   - Returns \`max(0, 1) + 1 = 2\`.
6. Back up to \`maxDepth(1)\`.
   - Returns \`max(1, 2) + 1 = 3\`.

The max depth is 3!`,
        complexity: `### Time and Space Constraints

| Operation | DFS (Recursion) | BFS (Queue) |
| :--- | :--- | :--- |
| **Time Complexity** | \`O(N)\` | \`O(N)\` | 
| **Space Complexity** | \`O(H)\` | \`O(W)\` | 

- **Time:** Both algorithms must visit every single node exactly once to process it, taking linear \`O(N)\` time.
- **Space:** 
  - **DFS** uses the recursive call stack. In a perfectly balanced tree, the height \`H = log(N)\`, so space is \`O(log N)\`. In the worst case (a single straight line of nodes), \`H = N\`, so space is \`O(N)\`.
  - **BFS** uses a Queue. The queue holds at most one "level" of the tree at a time. The widest level \`W\` of a binary tree is \`N/2\` nodes. Thus, worst-case space is \`O(N)\`.`,
        problems: `### Classic Problems to Master

1. **[Easy] Invert Binary Tree:** (Pattern: Simple post-order DFS to swap left and right pointers).
2. **[Easy] Maximum Depth:** (Pattern: Return \`max(left, right) + 1\`).
3. **[Medium] Lowest Common Ancestor:** (Pattern: DFS returning the target nodes upwards until they intersect).
4. **[Hard] Serialize and Deserialize Binary Tree:** (Pattern: Convert a tree to a string and back using Pre-Order or Level-Order traversal, utilizing a placeholder character like 'X' for nulls).`,
        tricks: `### Tricks, Edge Cases, & Common Traps

- **Base Case:** The most critical part of tree recursion is the base case: \`if (root == nullptr) return ...\`. Missing this will cause a Stack Overflow.
- **Top-Down vs Bottom-Up:** 
  - *Top-Down:* Pass values from the parent down to the children (e.g., passing a running sum).
  - *Bottom-Up:* Children calculate values and return them up to the parent (e.g., calculating height).
- **Global Variables:** Be careful when using global variables to track state in recursive tree problems (like diameter). It's safer to pass them by reference in C++ or use a class property in Java.

> **Checkpoint Question:** If a binary tree is completely skewed (looks like a linked list), which traversal method uses less memory: DFS or BFS?
> **Answer:** BFS uses less memory. The widest level has only 1 node, so the queue size is \`O(1)\`. DFS will recurse \`N\` times deeply, using \`O(N)\` memory on the call stack.`
    },
    8: {
        title: "Binary Search Trees (BST)",
        whatIsIt: `A Binary Search Tree (BST) is a highly organized Binary Tree. It introduces one massive rule: 

**For every node, all values in its Left Subtree must be strictly smaller, and all values in its Right Subtree must be strictly greater.**

This structural constraint unlocks the power of Binary Search on a tree. If you are looking for the number 50 and you are currently at a node with the value 100, you know with 100% certainty that 50 can only exist in the left branch. You completely ignore the right branch, halving your search space at every step. This grants lightning-fast \`O(log N)\` search, insert, and delete operations.`,
        concept: `### The BST Property

\`\`\`text
         10
       /    \\
      5      15
     / \\    /  \\
    2   7  12   20
\`\`\`

**The In-Order Traversal Magic**
If you run a standard In-Order DFS (Left, Root, Right) on a valid BST, the output will **always be completely sorted in ascending order.**
Output: \`2, 5, 7, 10, 12, 15, 20\`.

### The Skewed Tree Problem
If you insert sorted data into a BST (e.g., insert 1, then 2, then 3), the tree degrades into a single straight line leaning to the right. It effectively becomes a Linked List, ruining the \`O(log N)\` speed and dropping performance down to \`O(N)\`. (Advanced structures like AVL and Red-Black trees auto-balance themselves to prevent this).`,
        code: `// C++ Implementation of BST Search and Validation
#include <bits/stdc++.h>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

// 1. Searching in a BST
// O(log N) Time (average), O(1) Space
TreeNode* searchBST(TreeNode* root, int val) {
    while (root != nullptr) {
        if (root->val == val) return root; // Found it!
        if (val < root->val) root = root->left; // Target is smaller, go left
        else root = root->right; // Target is larger, go right
    }
    return nullptr; // Not found
}

// 2. Validate Binary Search Tree
// O(N) Time, O(H) Space
// We must pass strict MIN and MAX boundaries down the tree!
bool isValidBSTHelper(TreeNode* node, long minVal, long maxVal) {
    if (!node) return true;
    
    // Check if the current node breaks the boundaries
    if (node->val <= minVal || node->val >= maxVal) return false;
    
    // Left child must be smaller than current node.
    // Right child must be larger than current node.
    return isValidBSTHelper(node->left, minVal, node->val) && 
           isValidBSTHelper(node->right, node->val, maxVal);
}

bool isValidBST(TreeNode* root) {
    // Start with infinitely wide boundaries
    return isValidBSTHelper(root, LONG_MIN, LONG_MAX); 
}`,
        dryRun: `### Dry Run: Validating a BST

Given Tree: Root(5) -> Left(4), Right(6). Left(4) has Right(7).
Wait, if Left(4) has Right(7), is that valid? The 7 is greater than 4 (which is good), but it is in the Left Subtree of 5! The rule says *all* values in the left subtree must be less than 5. Let's trace it.

1. \`validate(5, -INF, +INF)\`
   - 5 is within bounds.
   - Calls \`validate(4, -INF, 5)\` (Left branch)
   - Calls \`validate(6, 5, +INF)\` (Right branch)
2. \`validate(4, -INF, 5)\`
   - 4 is within bounds.
   - Calls \`validate(null, -INF, 4)\` -> true
   - Calls \`validate(7, 4, 5)\` (Right branch of 4)
3. \`validate(7, 4, 5)\`
   - Is \`7 <= 4\` or \`7 >= 5\`? YES, 7 is >= 5!
   - This returns FALSE.
   
The tree is structurally broken because 7 leaked into the left side of 5. The algorithm caught it perfectly using the strict boundaries!`,
        complexity: `### Time and Space Constraints

| Operation | Average Case (Balanced) | Worst Case (Skewed) |
| :--- | :--- | :--- |
| **Search** | \`O(log N)\` | \`O(N)\` |
| **Insert** | \`O(log N)\` | \`O(N)\` |
| **Delete** | \`O(log N)\` | \`O(N)\` |

*Note: In interviews, it is crucial to clarify if the BST is guaranteed to be balanced. If they say no, the worst-case time complexity for everything degrades to \`O(N)\`.*`,
        problems: `### Classic Problems to Master

1. **[Easy] Validate Binary Search Tree:** (Pattern: Top-Down DFS passing strict Min and Max boundaries).
2. **[Medium] Kth Smallest Element in a BST:** (Pattern: In-Order Traversal yields a sorted array; just grab the Kth item).
3. **[Medium] Lowest Common Ancestor of a BST:** (Pattern: If both target nodes are smaller than the root, go left. If both are larger, go right. If they split (one smaller, one larger), the current node is the LCA).
4. **[Hard] Delete Node in a BST:** (Pattern: When deleting a node with two children, replace it with its In-Order Successor (smallest node in the right subtree)).`,
        tricks: `### Tricks, Edge Cases, & Common Traps

- **The Boundary Trap:** When validating a BST, it is not enough to just check if \`left.val < node.val\` and \`right.val > node.val\`. A grandchild can violate the grandparent's rule. Always pass \`(MIN, MAX)\` bounds down the recursion tree.
- **Integer Overflow:** If the BST contains \`INT_MAX\` as a valid node value, initializing your bounds to \`INT_MAX\` will fail. Use \`LONG_MAX\` (64-bit int) for your boundary variables.
- **In-Order Array:** If a problem seems impossible, remember that doing an In-Order traversal on a BST gives you a perfectly sorted array. You can often dump the tree into an array and solve the problem using standard array algorithms.

> **Checkpoint Question:** Why do we replace a deleted node with its In-Order Successor (or Predecessor) when it has two children?
> **Answer:** The In-Order Successor is the absolute smallest node in the right subtree. Because it is from the right subtree, it is larger than everything on the left. Because it is the absolute smallest, it is smaller than everything else on the right. It perfectly preserves the BST structural rule.`
    },
    9: {
        title: "Heaps & Priority Queues",
        whatIsIt: `A Heap is a specialized Tree-based data structure designed to do one thing exceptionally well: instantly retrieving the **Maximum** or **Minimum** element in a dataset.

While a BST keeps everything perfectly sorted, a Heap is much looser. It only guarantees that the Parent is larger than its children (Max-Heap) or smaller than its children (Min-Heap). Because it has less strict rules, adding elements is extremely fast. 

In modern languages, Heaps are implemented via the **Priority Queue** class. You throw random data into it, and whenever you call \`.pop()\`, it magically gives you the highest priority item. It is heavily used in scheduling tasks, Dijkstra's Shortest Path, and "Top K" interview problems.`,
        concept: `### Array Representation of a Complete Tree

A Heap is a "Complete" Binary Tree, meaning every level is completely filled left-to-right. Because there are no gaps, we don't need pointers! We can store the entire tree inside a flat Array.

\`\`\`text
Min-Heap:
       1
     /   \\
    3     5
   / \\   /
  7   8 9

Array: [0, 1, 3, 5, 7, 8, 9] (Using 1-based indexing for ease)
\`\`\`

**Math Magic:** For a node at index \`i\`:
- Left Child is at index \`2 * i\`
- Right Child is at index \`2 * i + 1\`
- Parent is at index \`i / 2\`

### Bubbling Up and Sifting Down
- **Insert:** Add the new item to the very end of the array, then "Bubble Up" (swap with parent) until the heap rule is restored.
- **Extract Min:** Swap the root (index 1) with the very last element, delete the last element, then "Sift Down" (swap with smallest child) to restore order.`,
        code: `// C++ Implementation of Priority Queues
#include <bits/stdc++.h>
using namespace std;

// Problem: Find the Kth Largest Element in an Array
// O(N log K) Time, O(K) Space
int findKthLargest(vector<int>& nums, int k) {
    // In C++, priority_queue is a Max-Heap by default.
    // To make a Min-Heap, we must use this verbose syntax:
    priority_queue<int, vector<int>, greater<int>> minHeap;
    
    for (int num : nums) {
        minHeap.push(num); // O(log K) insertion
        
        // If the heap grows larger than K, pop the smallest item!
        if (minHeap.size() > k) {
            minHeap.pop(); // O(log K) removal
        }
    }
    
    // The heap now contains EXACTLY the K largest elements.
    // Because it's a Min-Heap, the smallest of those K elements is at the top.
    // That element is exactly the Kth largest element overall!
    return minHeap.top();
}`,
        dryRun: `### Dry Run: Kth Largest Element using a Min-Heap

Given: \`nums = [3, 2, 1, 5, 6, 4]\`, \`k = 2\`
We want to maintain a Min-Heap of max size 2.

1. **Insert 3:** Heap = \`[3]\`.
2. **Insert 2:** Heap = \`[2, 3]\`.
3. **Insert 1:** Heap = \`[1, 2, 3]\`. Size is 3 (> 2). Pop the minimum (1). Heap = \`[2, 3]\`.
4. **Insert 5:** Heap = \`[2, 3, 5]\`. Size > 2. Pop minimum (2). Heap = \`[3, 5]\`.
5. **Insert 6:** Heap = \`[3, 5, 6]\`. Size > 2. Pop minimum (3). Heap = \`[5, 6]\`.
6. **Insert 4:** Heap = \`[4, 5, 6]\`. Size > 2. Pop minimum (4). Heap = \`[5, 6]\`.

Loop finishes. The top of the Min-Heap is \`5\`. 
Is 5 the 2nd largest element in the original array? Yes! (6 is the 1st, 5 is the 2nd).`,
        complexity: `### Time and Space Constraints

| Operation | Time Complexity | Explanation |
| :--- | :--- | :--- |
| **Get Max/Min (\`top\`)** | \`O(1)\` | The extreme value is always at index 0 of the array. |
| **Insert (\`push\`)** | \`O(log N)\` | The new item might have to bubble up the height of the tree. |
| **Delete Max/Min (\`pop\`)**| \`O(log N)\` | The swapped root must sift down the height of the tree. |
| **Heapify (Build Heap)** | \`O(N)\` | Surprisingly, converting a random array into a valid Heap takes linear time! |`,
        problems: `### Classic Problems to Master

1. **[Medium] Kth Largest Element:** (Pattern: Keep a Min-Heap of size K. \`O(N log K)\` time).
2. **[Medium] Top K Frequent Elements:** (Pattern: Count frequencies in a Hash Map, then dump the \`(frequency, element)\` pairs into a Min-Heap of size K based on frequency).
3. **[Hard] Merge K Sorted Lists:** (Pattern: Put the head of all K lists into a Min-Heap. Pop the smallest, append it to result, and push the next element from that specific list into the Heap).
4. **[Hard] Find Median from Data Stream:** (Pattern: Maintain two heaps—a Max-Heap for the lower half of numbers, and a Min-Heap for the upper half. Balance their sizes to find the median in \`O(1)\`).`,
        tricks: `### Tricks, Edge Cases, & Common Traps

- **Min-Heap vs Max-Heap Syntax:** Know your language's defaults! In C++ and Python, Priority Queues default to Max-Heap and Min-Heap, respectively. Know how to invert them. In C++, you often see people push \`-value\` into a default Max-Heap to simulate a Min-Heap without the verbose syntax!
- **Custom Comparators:** If you want to store complex objects (like pairs or structs) in a Priority Queue, you must write a custom comparator function to teach the Heap how to sort them.
- **The "Top K" Rule:** If a problem ever asks for the "Top K", "Kth largest", or "K smallest" items, immediately stop and write down "Heap" on the whiteboard.

> **Checkpoint Question:** Why do we use a **Min-Heap** to find the Kth **Largest** element?
> **Answer:** A Min-Heap of size K acts as a filter. It holds exactly K elements. Whenever a new element comes in, it is compared against the minimum of those K elements. If it is larger, it kicks out the minimum. By the end, the heap contains the K largest elements seen so far, and the "smallest of the largest" (the Kth largest) is sitting right at the top for \`O(1)\` access.`
    },
    10: {
        title: "Tries (Prefix Trees)",
        whatIsIt: `A Trie (pronounced "Try") is a highly specialized tree data structure designed exclusively for storing strings and performing blazing-fast Prefix Searches.

If you have a million words in a database and someone types "appl" into a search bar, how do you instantly return "apple", "application", and "applet"? Searching a Hash Map doesn't work because "appl" is not an exact match. Scanning an Array takes too long. 

A Trie solves this by breaking words down character by character. Nodes in a Trie don't store words; they store individual letters. Words that share the same prefix share the exact same nodes in the tree, massively saving memory and search time.`,
        concept: `### The Trie Structure

Imagine inserting the words "CAT", "CAR", and "DOG".

\`\`\`text
         (Root)
         /    \\
       'C'    'D'
       /        \\
     'A'        'O'
     / \\          \\
   'T'* 'R'*      'G'*
\`\`\`
*(Nodes marked with \`*\` signify the end of a valid word).*

- When searching for "CAR", you follow the path \`Root -> C -> A -> R\`. It takes exactly 3 steps, regardless of whether the Trie contains 3 words or 3 billion words!
- When checking if there are any words starting with "CA", you just follow the path \`Root -> C -> A\`. If the node exists, the prefix exists.`,
        code: `// C++ Implementation of a Standard Trie
#include <bits/stdc++.h>
using namespace std;

class TrieNode {
public:
    bool isEndOfWord;
    TrieNode* children[26]; // Array of 26 pointers for a-z
    
    TrieNode() {
        isEndOfWord = false;
        for (int i = 0; i < 26; i++) {
            children[i] = nullptr;
        }
    }
};

class Trie {
private:
    TrieNode* root;
    
public:
    Trie() { root = new TrieNode(); }
    
    // O(L) Time (L = length of word)
    void insert(string word) {
        TrieNode* current = root;
        for (char c : word) {
            int index = c - 'a';
            if (current->children[index] == nullptr) {
                current->children[index] = new TrieNode(); // Create node if missing
            }
            current = current->children[index];
        }
        current->isEndOfWord = true; // Mark the final node
    }
    
    // O(L) Time
    bool search(string word) {
        TrieNode* current = root;
        for (char c : word) {
            int index = c - 'a';
            if (current->children[index] == nullptr) return false;
            current = current->children[index];
        }
        return current->isEndOfWord; // Ensure it's a full word, not just a prefix
    }
    
    // O(L) Time
    bool startsWith(string prefix) {
        TrieNode* current = root;
        for (char c : prefix) {
            int index = c - 'a';
            if (current->children[index] == nullptr) return false;
            current = current->children[index];
        }
        return true; // We don't care if isEndOfWord is true here!
    }
};`,
        dryRun: `### Dry Run: Search vs StartsWith

Assume we inserted "APPLE" into the Trie. The path \`A->P->P->L->E\` exists. The 'E' node has \`isEndOfWord = true\`.

**Scenario 1: \`search("APP")\`**
- Find 'A', move down.
- Find 'P', move down.
- Find 'P', move down. Loop ends.
- Return \`current->isEndOfWord\`. The 'P' node is NOT the end of a word (it is false).
- Returns \`false\`. "APP" is not a valid word in our dictionary.

**Scenario 2: \`startsWith("APP")\`**
- Find 'A', move down.
- Find 'P', move down.
- Find 'P', move down. Loop ends.
- Returns \`true\`. We successfully navigated the prefix path without hitting a null pointer, so words starting with "APP" definitely exist.`,
        complexity: `### Time and Space Constraints

| Operation | Time Complexity | Explanation |
| :--- | :--- | :--- |
| **Insert** | \`O(L)\` | Where L is the length of the string. Independent of the dictionary size! |
| **Search Word** | \`O(L)\` | Instant navigation using array indices. |
| **Prefix Search** | \`O(L)\` | Same as search. |
| **Space Complexity**| \`O(N * L)\` | Worst case, there are no shared prefixes. Each node contains an array of 26 pointers, which can consume significant memory. |`,
        problems: `### Classic Problems to Master

1. **[Medium] Implement Trie (Prefix Tree):** (Pattern: The foundational class structure above).
2. **[Medium] Design Add and Search Words Data Structure:** (Pattern: Search supports the \`.\` wildcard character. If you see a \`.\`, you must use DFS to recursively check all 26 non-null children).
3. **[Hard] Word Search II:** (Pattern: The ultimate Trie problem. Build a Trie of all dictionary words, then run a DFS Backtracking algorithm on the 2D character board, querying the Trie at every step to see if the current path forms a valid prefix. Tremendously optimizes the brute force).`,
        tricks: `### Tricks, Edge Cases, & Common Traps

- **Hash Map vs Array Nodes:** A Trie Node usually contains an array of 26 pointers (for English letters). If the problem involves Unicode or special characters, switch from \`children[26]\` to \`unordered_map<char, TrieNode*> children\`. It saves memory for sparse nodes but adds slight Hash Map overhead.
- **The Memory Problem:** Tries are notoriously memory-hungry. Each node allocates 26 pointers, even if only 1 is used. In a production environment, systems use compressed tries (Radix Trees) to merge single-child paths together.
- **Word Search Optimization:** In backtracking matrix problems, if you find a word using a Trie, you can set its \`isEndOfWord\` to false (or prune the leaf node) to prevent finding it multiple times and speed up subsequent searches.

> **Checkpoint Question:** Why is a Trie faster than a Hash Set for searching a specific string of length L among 1 million words?
> **Answer:** While a Hash Set is considered \`O(1)\`, the underlying Hash Function must iterate over all L characters of the string to compute the hash code. Thus, Hash Set lookup is technically \`O(L)\`. A Trie also searches in \`O(L)\` time, but it natively supports Prefix searching, which a Hash Set cannot do at all.`
    }
};
//# sourceMappingURL=topics6to10.js.map