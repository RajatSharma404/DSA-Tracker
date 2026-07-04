export const topics11to15 = {
  11: {
    title: "Graphs Basics",
    whatIsIt: `A Graph is a non-linear data structure used to model relationships between objects. Think of a social network (people are nodes, friendships are edges) or Google Maps (intersections are nodes, roads are edges).

Unlike Trees, which have a strict hierarchical Root-to-Leaf structure, Graphs are the wild west. Any node can connect to any other node. Edges can be "Directed" (one-way street) or "Undirected" (two-way street). Because of this freedom, Graphs can contain **Cycles** (loops that trap you infinitely), which requires careful tracking of "visited" nodes during traversals.`,
    concept: `### Graph Representations

You can represent a graph in code in two primary ways:

**1. Adjacency Matrix (2D Array)**
A 2D grid where \`matrix[i][j] = 1\` if an edge exists between Node i and Node j.
- *Pros:* \`O(1)\` to check if an edge exists between two nodes.
- *Cons:* Uses \`O(V^2)\` memory. Terrible for sparse graphs (few edges).

**2. Adjacency List (Array of Lists / Hash Map)**
An array where \`adj[i]\` holds a list of all neighbors connected to Node i.
- *Pros:* Uses \`O(V + E)\` memory. Highly efficient for traversal.
- *Cons:* \`O(V)\` to check if a specific edge exists between two nodes.

*In 95% of interview questions, you will use an Adjacency List.*

\`\`\`text
Graph: 
  0 --- 1
  |     |
  2 --- 3

Adjacency List:
adj[0] = [1, 2]
adj[1] = [0, 3]
adj[2] = [0, 3]
adj[3] = [1, 2]
\`\`\``,
    code: `// C++ Implementation of Graph Traversals
#include <bits/stdc++.h>
using namespace std;

// 1. Breadth-First Search (BFS)
// Finds the SHORTEST PATH in an unweighted graph.
void bfs(int startNode, vector<vector<int>>& adj) {
    int V = adj.size();
    vector<bool> visited(V, false);
    queue<int> q;
    
    q.push(startNode);
    visited[startNode] = true;
    
    while (!q.empty()) {
        int curr = q.front();
        q.pop();
        
        cout << curr << " "; // Process the node
        
        // Add all unvisited neighbors to the queue
        for (int neighbor : adj[curr]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }
}

// 2. Depth-First Search (DFS)
// Great for finding connected components or fully exploring paths.
void dfsHelper(int node, vector<vector<int>>& adj, vector<bool>& visited) {
    visited[node] = true;
    cout << node << " "; // Process the node
    
    // Recursively visit all unvisited neighbors
    for (int neighbor : adj[node]) {
        if (!visited[neighbor]) {
            dfsHelper(neighbor, adj, visited);
        }
    }
}

void dfs(int startNode, vector<vector<int>>& adj) {
    vector<bool> visited(adj.size(), false);
    dfsHelper(startNode, adj, visited);
}`,
    dryRun: `### Dry Run: BFS Traversal

Let's run BFS on the graph: \`0 -- 1, 0 -- 2, 1 -- 3, 2 -- 3\` starting at Node 0.

1. **Initialization:** Queue = \`[0]\`, Visited = \`{0: T}\`.
2. **Pop 0:** 
   - Neighbors of 0 are \`1, 2\`. Neither are visited.
   - Mark \`1, 2\` as visited. Push to queue.
   - Queue = \`[1, 2]\`. Visited = \`{0:T, 1:T, 2:T}\`.
3. **Pop 1:**
   - Neighbors of 1 are \`0, 3\`. Node 0 is already visited. Node 3 is not.
   - Mark \`3\` as visited. Push to queue.
   - Queue = \`[2, 3]\`. Visited = \`{0:T, 1:T, 2:T, 3:T}\`.
4. **Pop 2:**
   - Neighbors of 2 are \`0, 3\`. Both are already visited! Do nothing.
   - Queue = \`[3]\`.
5. **Pop 3:**
   - Neighbors are \`1, 2\`. Both visited. Do nothing.
   - Queue = \`[]\`.

**Result:** BFS explored layer-by-layer: first Node 0, then its direct neighbors (1, 2), then the next layer (3).`,
    complexity: `### Time and Space Constraints

Let \`V\` be the number of Vertices (Nodes) and \`E\` be the number of Edges.

| Traversal | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **DFS (Recursion)** | \`O(V + E)\` | \`O(V)\` (Call Stack + Visited Array) |
| **BFS (Queue)** | \`O(V + E)\` | \`O(V)\` (Queue + Visited Array) |

*Explanation:* We process every node once (\`V\`) and iterate over all of its edges. In total across the entire algorithm, we look at every edge exactly once (or twice if undirected), resulting in \`O(V + E)\`.`,
    problems: `### Classic Problems to Master

1. **[Medium] Number of Islands:** (Pattern: The graph is a 2D matrix. Treat '1's as nodes and adjacent '1's as edges. Run DFS/BFS to find disconnected components).
2. **[Medium] Clone Graph:** (Pattern: Traverse the graph while simultaneously maintaining a Hash Map mapping \`OriginalNode -> NewNode\` to build the clone).
3. **[Medium] Rotting Oranges:** (Pattern: Multi-Source BFS. Instead of starting BFS with 1 node, push ALL rotten oranges into the queue at the start, and process level-by-level to track time/minutes).
4. **[Hard] Word Ladder:** (Pattern: Transform words into nodes. If two words differ by one letter, they have an edge. Use BFS to find the shortest transformation sequence).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **The Visited Array:** If you forget to mark a node as \`visited\`, and the graph has a cycle, your DFS will recurse infinitely and cause a Stack Overflow!
- **Disconnected Graphs:** A simple \`dfs(0)\` won't visit nodes that are completely disconnected from node 0. If you need to process the entire graph, you must iterate over all nodes \`0 to V-1\` and call DFS/BFS if the node is \`!visited\`.
- **Shortest Path Rule:** If the graph is **Unweighted** (all edges cost the same), BFS is guaranteed to find the shortest path. Do not use Dijkstra's algorithm for an unweighted graph!

> **Checkpoint Question:** Why does BFS require a Queue while DFS requires a Stack (or Recursion)?
> **Answer:** A Queue (FIFO) processes nodes in the order they were discovered, forcing exploration to complete the current "layer" before moving deeper. A Stack (LIFO) processes the most recently discovered node immediately, forcing it to plunge as deep as possible down a single path.`
  },
  12: {
    title: "Sorting Algorithms",
    whatIsIt: `Sorting is the process of arranging data in a specific order (ascending or descending). While modern languages provide built-in sort functions (like \`std::sort\`), interviewers frequently test your knowledge of how they work under the hood.

Sorting is a crucial preprocessing step. By paying an upfront cost of \`O(N log N)\` to sort an array, you often unlock \`O(N)\` Two-Pointer patterns or \`O(log N)\` Binary Search queries, making an impossible \`O(N^2)\` problem solvable.`,
    concept: `### Comparison vs Non-Comparison Sorts

**Comparison Sorts (e.g., Merge Sort, Quick Sort)**
They sort by comparing elements against each other (\`a < b\`). Mathematical proofs show that a comparison sort can **never** be faster than \`O(N log N)\` in the worst/average case.

**Non-Comparison Sorts (e.g., Counting Sort, Radix Sort)**
If you know the data is strictly bounded (e.g., "all numbers are between 1 and 100"), you can completely avoid comparisons. You just count occurrences in a Hash Map/Array and reconstruct the array in \`O(N)\` time.

### Stability
A sort is "Stable" if two identical elements retain their original relative order. Merge Sort is stable. Quick Sort is NOT stable. Stability is vital when sorting objects by multiple criteria (e.g., sorting employees by Department, then sorting by Salary).`,
    code: `// C++ Implementation of Merge Sort
#include <bits/stdc++.h>
using namespace std;

// Merge step: O(N) Time
void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> temp; // O(N) Space requirement
    int i = left, j = mid + 1;
    
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) temp.push_back(arr[i++]);
        else temp.push_back(arr[j++]);
    }
    
    while (i <= mid) temp.push_back(arr[i++]);
    while (j <= right) temp.push_back(arr[j++]);
    
    // Copy back to original array
    for (int k = 0; k < temp.size(); k++) {
        arr[left + k] = temp[k];
    }
}

// O(N log N) Time, O(N) Space
void mergeSort(vector<int>& arr, int left, int right) {
    if (left >= right) return; // Base case: 1 element is already sorted
    
    int mid = left + (right - left) / 2;
    
    mergeSort(arr, left, mid);      // Sort left half
    mergeSort(arr, mid + 1, right); // Sort right half
    merge(arr, left, mid, right);   // Merge them together
}`,
    dryRun: `### Dry Run: Merge Sort

Array: \`[38, 27, 43, 3]\`

1. **Divide (Recursion):**
   - Split to \`[38, 27]\` and \`[43, 3]\`.
   - Split left to \`[38]\` and \`[27]\`. (Base case reached).
2. **Merge Left Half:**
   - Merge \`[38]\` and \`[27]\`. Compare 38 and 27. 
   - 27 is smaller. Left array becomes \`[27, 38]\`.
3. **Merge Right Half:**
   - Split \`[43, 3]\` to \`[43]\` and \`[3]\`.
   - Merge them. 3 is smaller. Right array becomes \`[3, 43]\`.
4. **Final Merge:**
   - Merge \`[27, 38]\` and \`[3, 43]\`.
   - Compare 27 and 3. Add 3.
   - Compare 27 and 43. Add 27.
   - Compare 38 and 43. Add 38.
   - Add remaining 43.
   - Final sorted array: \`[3, 27, 38, 43]\`.`,
    complexity: `### Time and Space Constraints

| Algorithm | Average Time | Worst Time | Space | Stable? |
| :--- | :--- | :--- | :--- | :--- |
| **Merge Sort** | \`O(N log N)\` | \`O(N log N)\` | \`O(N)\` | Yes |
| **Quick Sort** | \`O(N log N)\` | \`O(N^2)\` | \`O(log N)\`| No |
| **Heap Sort** | \`O(N log N)\` | \`O(N log N)\` | \`O(1)\` | No |
| **Counting Sort**| \`O(N + K)\` | \`O(N + K)\` | \`O(K)\` | Yes |

*Note on Quick Sort:* Despite the \`O(N^2)\` worst case (which occurs if the pivot is consistently the smallest/largest element), Quick Sort is usually the fastest in practice due to exceptional CPU cache locality. Standard \`std::sort\` uses Introsort (a hybrid of Quick Sort and Heap Sort to guarantee \`O(N log N)\` worst-case).`,
    problems: `### Classic Problems to Master

1. **[Easy] Merge Sorted Arrays:** (Pattern: Merge step of Merge Sort, iterating backwards to avoid overwriting).
2. **[Medium] Sort Colors:** (Pattern: "Dutch National Flag" algorithm. Sort an array of 0s, 1s, and 2s in \`O(N)\` time and \`O(1)\` space using three pointers).
3. **[Medium] Merge Intervals:** (Pattern: Sort the intervals by their start time first, then iterate and merge overlapping ends).
4. **[Hard] Count of Smaller Numbers After Self:** (Pattern: Modify Merge Sort to count elements jumping from the right array to the left array during the merge step).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **Custom Comparators:** In C++, \`std::sort(arr.begin(), arr.end(), comp)\`. The comparator must return \`true\` if the first element should be strictly placed BEFORE the second element. **Never** return \`true\` if they are equal; it breaks strict weak ordering and can cause a segfault!
- **Counting Sort Optimization:** If a problem states "The array contains 10,000 items, but all items are between 1 and 100", you can sort the array in \`O(N)\` time using Counting Sort (an array of size 100 counting frequencies).

> **Checkpoint Question:** Why does Merge Sort require \`O(N)\` extra space?
> **Answer:** During the merge phase, we cannot cleanly combine two sorted halves in-place without massively shifting elements (\`O(N^2)\` operations). We must allocate a temporary array to hold the sorted results before copying them back.`
  },
  13: {
    title: "Binary Search",
    whatIsIt: `Binary Search is an elegant \`O(log N)\` algorithm used to search a sorted data space. 

Instead of scanning elements one by one, Binary Search compares the target value to the middle element. Because the data is sorted, this single comparison allows us to completely eliminate half of the search space. 

While initially taught as a way to find a number in a sorted array, advanced Binary Search is used to search the "Answer Space". If you know the answer to a problem is between 1 and 100, and you can write a function that says "Is 50 too high or too low?", you can binary search the answer itself!`,
    concept: `### The Search Space

Given a sorted array: \`[2, 4, 6, 8, 10, 12, 14]\`. Target = \`10\`.

1. \`left = 0\`, \`right = 6\`. \`mid = 3\` (Value = 8).
2. \`8 < 10\`. The target MUST be to the right of index 3.
3. Eliminate the left half. \`left = mid + 1\`.
4. \`left = 4\`, \`right = 6\`. \`mid = 5\` (Value = 12).
5. \`12 > 10\`. The target MUST be to the left of index 5.
6. Eliminate the right half. \`right = mid - 1\`.
7. \`left = 4\`, \`right = 4\`. \`mid = 4\` (Value = 10). Target found!

### Monotonicity
Binary search only works if the condition is **Monotonic** (strictly increasing or decreasing). For example, an array of booleans must look like \`[F, F, F, T, T, T]\`. You can binary search to find the very first \`T\`.`,
    code: `// C++ Implementation of Binary Search Patterns
#include <bits/stdc++.h>
using namespace std;

// 1. Standard Binary Search (Finding exact match)
int binarySearch(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    
    while (left <= right) {
        // Prevent integer overflow: (left + right) / 2 can overflow if numbers are huge!
        int mid = left + (right - left) / 2; 
        
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) left = mid + 1; // Discard left half
        else right = mid - 1; // Discard right half
    }
    return -1;
}

// 2. Finding the First True (Lower Bound Pattern)
// e.g. First bad version, first number >= target
int lowerBound(vector<int>& nums, int target) {
    int left = 0, right = nums.size(); // Note: right is size, not size-1
    
    while (left < right) { // Note: strictly less than
        int mid = left + (right - left) / 2;
        
        if (nums[mid] >= target) {
            right = mid; // Answer might be mid, don't discard it!
        } else {
            left = mid + 1; // Mid is definitely too small, discard it.
        }
    }
    return left; // Left and Right converge to the answer
}`,
    dryRun: `### Dry Run: Finding the Lower Bound

Find the first index where \`value >= 5\`.
Array: \`[1, 2, 5, 5, 5, 8, 9]\`

1. \`left = 0\`, \`right = 7\`. \`mid = 3\` (Value = 5).
   - \`5 >= 5\` is True. The answer could be index 3, but there might be an earlier 5! 
   - We keep it in the search space: \`right = mid = 3\`.
2. \`left = 0\`, \`right = 3\`. \`mid = 1\` (Value = 2).
   - \`2 >= 5\` is False. Index 1 is too small. 
   - Discard it: \`left = mid + 1 = 2\`.
3. \`left = 2\`, \`right = 3\`. \`mid = 2\` (Value = 5).
   - \`5 >= 5\` is True. 
   - \`right = mid = 2\`.
4. \`left = 2\`, \`right = 2\`. Loop terminates (\`left < right\` is false).

The answer is index \`2\`, which perfectly identifies the first \`5\`!`,
    complexity: `### Time and Space Constraints

| Variation | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Standard Array Search** | \`O(log N)\` | \`O(1)\` |
| **Binary Search on Answer** | \`O(log(Range) * O(checkFn))\` | \`O(1)\` |

*Explanation:* Binary Search on the Answer Space involves guessing a number between \`MIN\` and \`MAX\`. The number of guesses is \`log(MAX - MIN)\`. However, for each guess, you must run a function to verify if the guess is valid (e.g., iterating over an array). If the check function takes \`O(N)\` time, the total complexity is \`O(N * log(MAX - MIN))\`.`,
    problems: `### Classic Problems to Master

1. **[Easy] First Bad Version:** (Pattern: API returns [F, F, F, T, T]. Find the first T using the lower bound template).
2. **[Medium] Find Minimum in Rotated Sorted Array:** (Pattern: The array was rotated (e.g., [4, 5, 6, 1, 2, 3]). Compare \`mid\` to \`right\` to figure out which half contains the pivot/drop-off).
3. **[Medium] Search a 2D Matrix:** (Pattern: Treat the 2D matrix as a flat 1D array. \`mid_val = matrix[mid / cols][mid % cols]\`).
4. **[Hard] Split Array Largest Sum / Koko Eating Bananas:** (Pattern: Binary Search on the Answer. Guess a capacity. Simulate the process. If it succeeds, try a smaller capacity. If it fails, try a larger capacity).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **Integer Overflow Calculation:** Never use \`(left + right) / 2\`. If left and right are both large integers (e.g., near 2 billion), adding them will exceed the 32-bit integer limit and wrap around to a negative number, crashing your program! Always use \`left + (right - left) / 2\`.
- **Infinite Loops:** If you use \`while(left < right)\`, and you update \`left = mid\`, the loop will run infinitely when \`left\` and \`right\` are next to each other because \`mid\` rounds down to \`left\`. To fix this, calculate mid as \`(left + right + 1) / 2\` (round up) when updating \`left = mid\`.

> **Checkpoint Question:** In the lower bound template \`while(left < right)\`, why do we return \`left\` at the end instead of \`mid\`?
> **Answer:** Inside the loop, \`mid\` is just a temporary variable. The loop guarantees that when it terminates, \`left\` and \`right\` have perfectly converged onto the exact same index, which represents the final answer.`
  },
  14: {
    title: "Recursion Fundamentals",
    whatIsIt: `Recursion is a programming technique where a function calls itself to solve a smaller instance of the same problem. 

Instead of writing a massive loop, recursion breaks a problem down until it hits a trivial **Base Case** (the simplest possible scenario). Once the base case is solved, the function passes the answer back up the chain. Recursion is the mathematical foundation for Trees, Graphs (DFS), Dynamic Programming, and Backtracking.`,
    concept: `### The Two Pillars of Recursion

Every recursive function MUST have two things:
1. **The Base Case:** A condition that stops the recursion. Without this, the function calls itself infinitely, leading to a Stack Overflow (running out of RAM).
2. **The Recurrence Relation:** The logic that breaks the current problem down into a smaller sub-problem and calls the function again.

\`\`\`text
Factorial Example (5!):
5! = 5 * 4!
         4! = 4 * 3!
                  3! = 3 * 2!
                           2! = 2 * 1!
                                    1! = 1 (BASE CASE!)
\`\`\`
The base case returns 1. Then 2! evaluates to 2*1=2. Then 3! evaluates to 3*2=6, bubbling all the way back up to 120.`,
    code: `// C++ Implementation of Recursion
#include <bits/stdc++.h>
using namespace std;

// 1. Simple Recursion (Factorial)
int factorial(int n) {
    // 1. Base Case
    if (n == 1 || n == 0) return 1; 
    
    // 2. Recurrence Relation
    return n * factorial(n - 1);
}

// 2. Multiple Branch Recursion (Fibonacci)
// This is incredibly slow (O(2^N)) because it recalculates the same values!
int fibNaive(int n) {
    if (n <= 1) return n; // Base case
    // Branching! Creates a massive tree of function calls.
    return fibNaive(n - 1) + fibNaive(n - 2);
}

// 3. Top-Down Memoization (Fixing Fibonacci)
// O(N) Time, O(N) Space
int fibMemo(int n, vector<int>& memo) {
    if (n <= 1) return n;
    
    // If we've already calculated this answer, return it instantly!
    if (memo[n] != -1) return memo[n]; 
    
    // Otherwise, calculate it, save it, and return it.
    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];
}`,
    dryRun: `### Dry Run: Memoized Fibonacci \`fib(4)\`

Memo Array = \`[-1, -1, -1, -1, -1]\`

1. \`fib(4)\` calls \`fib(3)\` and \`fib(2)\`.
2. \`fib(3)\` calls \`fib(2)\` and \`fib(1)\`.
3. \`fib(2)\` calls \`fib(1)\` and \`fib(0)\`.
   - \`fib(1)\` returns 1 (Base Case).
   - \`fib(0)\` returns 0 (Base Case).
   - \`fib(2)\` calculates 1 + 0 = 1. SAVES to \`memo[2] = 1\`. Returns 1.
4. Back in \`fib(3)\`: \`fib(1)\` returns 1. 
   - \`fib(3)\` calculates 1 (from fib(2)) + 1 (from fib(1)) = 2. SAVES to \`memo[3] = 2\`. Returns 2.
5. Back in \`fib(4)\`: Evaluates the right branch \`fib(2)\`.
   - Wait! \`memo[2]\` is already 1! It instantly returns 1 without doing any more recursion!
6. \`fib(4)\` calculates 2 + 1 = 3. SAVES to \`memo[4] = 3\`.

By caching results, we completely pruned the right side of the recursion tree!`,
    complexity: `### Time and Space Constraints

| Algorithm | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Naive Branching (e.g. Fib)** | \`O(2^N)\` | \`O(N)\` (Max depth of call stack) |
| **Memoized Recursion** | \`O(N)\` | \`O(N)\` (Call stack + Memo Array) |

*Explanation:* Every time a function is called, the OS allocates a "Stack Frame" in RAM to store local variables and the return address. If recursion goes \`N\` levels deep, it consumes \`O(N)\` space. A Stack Overflow occurs when the OS refuses to allocate more stack memory (usually around 10,000 deep in modern systems).`,
    problems: `### Classic Problems to Master

1. **[Easy] Reverse Linked List (Recursive):** (Pattern: Trust the recursion! Assume the rest of the list is already reversed by the recursive call, then just fix the current node's pointers).
2. **[Medium] Pow(x, n):** (Pattern: Binary Exponentiation. \`x^10 = x^5 * x^5\`. Halve the power recursively to achieve \`O(log N)\` time).
3. **[Medium] Decode String:** (Pattern: When you hit an opening bracket \`[\`, launch a recursive call to parse the inner substring. When you hit \`]\`, return the parsed string).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **The Leap of Faith:** When writing recursion, don't try to mentally trace a tree 10 levels deep. You will get confused. Write the base case. Then, assume the recursive call *magically works* for \`N-1\`, and just write the logic to combine the \`N-1\` result with the current \`N\` step.
- **Stack Overflows:** If you get a Stack Overflow/Segmentation Fault in an interview, 99% of the time you wrote a faulty Base Case that never triggers, or you forgot to update the parameters in the recursive call (e.g. calling \`func(n)\` instead of \`func(n-1)\`).
- **Pass By Reference:** In C++, passing a large string or array into a recursive function by value (\`vector<int> arr\`) copies the entire array *every single call*, creating an \`O(N^2)\` time/space nightmare. Always pass by reference (\`vector<int>& arr\`).

> **Checkpoint Question:** Why does naive Fibonacci take \`O(2^N)\` time while factorial takes \`O(N)\` time?
> **Answer:** Factorial makes exactly 1 recursive call per step (a straight line). Fibonacci makes 2 recursive calls per step, causing the execution path to branch exponentially like a binary tree.`
  },
  15: {
    title: "Backtracking Strategies",
    whatIsIt: `Backtracking is an advanced application of Recursion used to explore all possible combinations or permutations of a problem (Exhaustive Search). 

Imagine navigating a massive maze. You walk down a path. It's a dead end. Instead of starting over from the entrance, you walk backward to the last intersection, pick a different path, and try again. This is exactly what Backtracking does. It builds a solution incrementally, and the moment it realizes the current path is invalid, it "undoes" its last choice and branches down a different route.`,
    concept: `### The Backtracking Template

All backtracking problems follow this exact skeletal structure:

1. **Choose:** Make a choice (e.g., add a number to your current combination path).
2. **Explore:** Recursively call the function to continue building the path.
3. **Un-choose (Backtrack):** Undo the choice you just made (remove the number from the path) so the loop can pick the next possible number.

\`\`\`text
Generating Permutations of [1, 2]
Start: []
  ├─ Choose 1 -> Path: [1]
  │    └─ Choose 2 -> Path: [1, 2] (Valid! Save to results)
  │    └─ Undo 2 -> Path: [1]
  ├─ Undo 1 -> Path: []
  │
  ├─ Choose 2 -> Path: [2]
       └─ Choose 1 -> Path: [2, 1] (Valid! Save to results)
\`\`\``,
    code: `// C++ Implementation of Backtracking
#include <bits/stdc++.h>
using namespace std;

// Problem: Generate all combinations of numbers that sum to a target.
void backtrack(vector<int>& candidates, int target, int startIdx, vector<int>& currentPath, vector<vector<int>>& results) {
    // Base Case 1: We hit the target! Save the path and stop exploring.
    if (target == 0) {
        results.push_back(currentPath);
        return;
    }
    
    // Base Case 2: We overshot the target. Invalid path, stop exploring.
    if (target < 0) {
        return;
    }
    
    // Explore all possible choices from this point forward
    for (int i = startIdx; i < candidates.size(); i++) {
        // 1. CHOOSE
        currentPath.push_back(candidates[i]);
        
        // 2. EXPLORE
        // We pass 'i' as startIdx to allow reusing the same number.
        // We subtract the chosen number from the target.
        backtrack(candidates, target - candidates[i], i, currentPath, results);
        
        // 3. UN-CHOOSE (BACKTRACK)
        // Pop the number off so the next loop iteration can try a different number.
        currentPath.pop_back();
    }
}

vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
    vector<vector<int>> results;
    vector<int> currentPath;
    backtrack(candidates, target, 0, currentPath, results);
    return results;
}`,
    dryRun: `### Dry Run: Combination Sum

Candidates: \`[2, 3]\`, Target: \`5\`

1. \`backtrack(target=5, start=0, path=[])\`
2. Loop \`i = 0\` (Choose 2). 
   - \`path = [2]\`. 
   - Call \`backtrack(target=3, start=0)\`.
3. Inside new call, Loop \`i = 0\` (Choose 2).
   - \`path = [2, 2]\`.
   - Call \`backtrack(target=1, start=0)\`.
4. Inside new call, Loop \`i = 0\` (Choose 2).
   - \`path = [2, 2, 2]\`.
   - Call \`backtrack(target=-1)\` -> Hits base case (target < 0). Returns!
5. Back at target=1. Loop \`i = 1\` (Choose 3).
   - \`path = [2, 2, 3]\`.
   - Call \`backtrack(target=-2)\` -> Returns!
6. Back at target=3. Loop \`i = 1\` (Choose 3).
   - \`path = [2, 3]\`.
   - Call \`backtrack(target=0)\`.
   - HITS BASE CASE (target == 0). Saves \`[2, 3]\` to results! Returns!

This exhaustive branching explores every mathematical possibility, heavily relying on the \`.pop_back()\` operation to clean up the \`path\` vector for the next branch.`,
    complexity: `### Time and Space Constraints

| Pattern | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Permutations** | \`O(N!)\` | \`O(N)\` |
| **Subsets / Combinations** | \`O(2^N)\` | \`O(N)\` |

*Explanation:* Backtracking algorithms are inherently exponential or factorial because they explore the entire search space. They are only meant to be used on very small input sizes (usually \`N <= 20\`). The space complexity is \`O(N)\` because the recursion stack depth maxes out at the length of the path.`,
    problems: `### Classic Problems to Master

1. **[Medium] Subsets:** Generate all possible subsets of an array. (Pattern: At each number, branch twice: one branch where you include the number, one where you skip it).
2. **[Medium] Permutations:** Generate all orderings of an array. (Pattern: Loop from 0 to N. Keep a \`visited\` boolean array to ensure you don't pick the same number twice in the current path).
3. **[Hard] N-Queens:** Place N chess queens on an NxN board so no two attack each other. (Pattern: Attempt to place a queen in row R, column C. If valid, recurse to row R+1. If it fails, remove the queen and try column C+1).
4. **[Hard] Sudoku Solver:** (Pattern: Find an empty cell, try numbers 1-9. Recursively try to solve the rest. If a branch fails, wipe the cell back to empty).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **Sorting to Skip Duplicates:** If the input array contains duplicates (e.g. \`[1, 2, 2, 3]\`) and the problem asks for *unique* combinations, sort the array first. In your loop, add \`if (i > startIdx && nums[i] == nums[i-1]) continue;\`. This prunes identical branches instantly.
- **Pass By Value Mistake:** Always pass the \`currentPath\` array by reference (\`&\`). If you pass by value, the program will create a completely new array copy for every single branch of the \`O(2^N)\` tree, crashing your memory and time limits.
- **When to Use Backtracking:** If a problem asks for "All possible ways", "All permutations", or "All combinations", it is 100% a Backtracking problem.

> **Checkpoint Question:** Why do we strictly need the "Un-choose" (Backtrack) step at the end of the for-loop?
> **Answer:** Because we are passing the \`currentPath\` array by reference to save memory. The same exact array object is shared across all recursive branches. If we don't remove the element we added, it will permanently contaminate the array for sibling branches trying to explore different paths.`
  }
};
