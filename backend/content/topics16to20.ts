export const topics16to20 = {
  16: {
    title: "Greedy Algorithms",
    whatIsIt: `A Greedy Algorithm builds up a solution piece by piece, always choosing the next piece that offers the most immediate benefit. It operates on a simple principle: **Local optimal choices lead to a global optimal solution.**

Imagine you are given an array of coins [1, 5, 10, 25] and need to make 30 cents with the fewest coins possible. A greedy approach says: "Always take the biggest coin that fits." You take 25 (remainder 5). Then you take 5 (remainder 0). Two coins! It was fast and simple. 

However, greedy algorithms are dangerous. If the coin system was [1, 15, 25] and you needed 30 cents, Greedy takes 25, then five 1s (6 coins). The true optimal is two 15s (2 coins). You must mathematically prove a problem exhibits the "Greedy Choice Property" before using this technique.`,
    concept: `### The Greedy Choice Property

To safely use a Greedy algorithm, the problem must have two properties:
1. **Greedy Choice Property:** A global optimum can be arrived at by selecting a local optimum.
2. **Optimal Substructure:** An optimal solution to the problem contains an optimal solution to subproblems.

**Common Greedy Patterns:**
- **Sorting:** Sorting the input is almost always step 1. (e.g., sort jobs by end-time, sort intervals by start-time).
- **Priority Queues:** Use a Max-Heap or Min-Heap to constantly have access to the "best" current choice.`,
    code: `// C++ Implementation of a Greedy Algorithm
#include <bits/stdc++.h>
using namespace std;

// Problem: Assign Cookies
// You have children with greed factors (minimum cookie size they will accept).
// You have cookies with sizes. Maximize the number of content children.
// O(N log N + M log M) Time, O(1) Space
int findContentChildren(vector<int>& children, vector<int>& cookies) {
    // Step 1: Sort both arrays. Always the foundation of a greedy approach.
    sort(children.begin(), children.end());
    sort(cookies.begin(), cookies.end());
    
    int childIdx = 0;
    int cookieIdx = 0;
    
    // Step 2: Greedily try to satisfy the least greedy child with the smallest possible cookie
    while (childIdx < children.size() && cookieIdx < cookies.size()) {
        
        // If the cookie is large enough to satisfy the current child
        if (cookies[cookieIdx] >= children[childIdx]) {
            childIdx++; // Child is happy, move to the next child
        }
        
        // Regardless of whether it was eaten or too small, this cookie is gone.
        cookieIdx++; 
    }
    
    // The number of children we successfully moved past is our answer
    return childIdx;
}`,
    dryRun: `### Dry Run: Assign Cookies

Children greed: [1, 2, 3]
Cookie sizes: [1, 1]

1. **Sort:** Both are already sorted. child = 0, cookie = 0.
2. **Iteration 1:** 
   - Cookie[0] is 1. Child[0] wants 1.
   - 1 >= 1 is True!
   - Child is fed. child = 1. Move to next cookie cookie = 1.
3. **Iteration 2:**
   - Cookie[1] is 1. Child[1] wants 2.
   - 1 >= 2 is False.
   - Child cannot eat it. The cookie is useless for this child (and all future greedier children).
   - Move to next cookie cookie = 2.
4. **End:** cookie = 2 hits the limit. Loop breaks.

Result: childIdx = 1. Only 1 child got a cookie. The greedy logic (saving big cookies for greedy kids) worked perfectly.`,
    complexity: `### Time and Space Constraints

| Phase | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Sorting** | O(N log N) | O(1) or O(N) depending on language |
| **Greedy Scan** | O(N) | O(1) |
| **Total** | O(N log N) | O(1) |

*Explanation:* The bottleneck of almost all Greedy algorithms is the initial sorting step. Once sorted, the actual greedy decision-making usually happens in a single linear O(N) pass.`,
    problems: `### Classic Problems to Master

1. **[Easy] Best Time to Buy and Sell Stock:** (Pattern: Keep track of the minimum price seen so far, greedily calculate profit at each day).
2. **[Medium] Jump Game:** (Pattern: Keep track of the "maximum reachable index". If your current index ever exceeds the max reachable index, you are stuck).
3. **[Medium] Task Scheduler:** (Pattern: Use a Max-Heap to always execute the most frequent available task first).
4. **[Hard] Minimum Number of Taps to Open to Water a Garden:** (Pattern: Interval covering. Sort intervals by start time, then greedily pick the one that extends the furthest to the right).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **The DP Trap:** Interviewers love to present a Dynamic Programming problem that looks like it could be solved greedily (like the Coin Change problem mentioned above). If you cannot mathematically prove that a local optimal choice guarantees a global optimal choice, do NOT use Greedy. You must use DP.
- **Intervals:** If a problem involves scheduling, meetings, or overlapping ranges, it is almost certainly a Greedy algorithm on sorted intervals.
- **Sort by End Time:** In activity selection problems (e.g., maximum non-overlapping meetings), always sort the intervals by their **End Time**, not their Start Time.

> **Checkpoint Question:** Why do we sort meetings by End Time instead of Start Time to maximize the number of meetings we can attend?
> **Answer:** A meeting might start very early but last for 10 hours, blocking out everything else. By sorting by End Time, we greedily lock in meetings that finish the fastest, freeing up the room for as many subsequent meetings as possible.`
  },
  17: {
    title: "Dynamic Programming (DP)",
    whatIsIt: `Dynamic Programming (DP) is an optimization technique for solving complex problems by breaking them down into simpler overlapping subproblems. 

If you use pure Recursion on a problem, you often end up calculating the exact same subproblem thousands of times, resulting in a massive O(2^N) time complexity. DP fixes this by **remembering past results**. The core idea of DP is: "Those who cannot remember the past are condemned to repeat it."`,
    concept: `### The Two Flavors of DP

1. **Top-Down (Memoization):** 
   - Write the pure recursive O(2^N) solution.
   - Add a Hash Map or Array called 'memo'.
   - At the start of the function, check if the answer is in the 'memo'. If yes, return it instantly.
   - Before returning a newly calculated answer, save it to the 'memo'.
   - *Pros:* Easiest to write. Only computes strictly necessary states.

2. **Bottom-Up (Tabulation):**
   - Ditch recursion entirely.
   - Create an array dp[] of size N+1.
   - Initialize the base cases (e.g. dp[0] = 0, dp[1] = 1).
   - Use a 'for' loop from 2 to N, building the answers sequentially.
   - *Pros:* No recursion overhead. No Stack Overflows. Easily optimized to O(1) space by only keeping the last two variables!`,
    code: `// C++ Implementation of Dynamic Programming
#include <bits/stdc++.h>
using namespace std;

// Problem: Climbing Stairs
// You can climb 1 or 2 steps. How many distinct ways to reach the top?

// 1. Top-Down (Memoization) 
// O(N) Time, O(N) Space
int climbMemo(int n, vector<int>& memo) {
    if (n <= 2) return n; // Base cases: 1 way for 1 step, 2 ways for 2 steps.
    
    if (memo[n] != -1) return memo[n]; // Return cached result
    
    // Calculate and save
    memo[n] = climbMemo(n - 1, memo) + climbMemo(n - 2, memo);
    return memo[n];
}

// 2. Bottom-Up (Tabulation) 
// O(N) Time, O(N) Space
int climbTab(int n) {
    if (n <= 2) return n;
    
    vector<int> dp(n + 1);
    dp[1] = 1;
    dp[2] = 2;
    
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}

// 3. Bottom-Up Space Optimized
// O(N) Time, O(1) Space
int climbOptimal(int n) {
    if (n <= 2) return n;
    
    int prev2 = 1;
    int prev1 = 2;
    
    for (int i = 3; i <= n; i++) {
        int current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}`,
    dryRun: `### Dry Run: Space Optimized Bottom-Up climbOptimal(4)

We want to find how many ways to climb 4 steps.

1. **Initialization:** prev2 = 1 (ways to climb 1 step), prev1 = 2 (ways to climb 2 steps).
2. **Loop i = 3:**
   - current = prev1 + prev2 = 2 + 1 = 3.
   - (There are 3 ways to climb 3 steps).
   - prev2 = prev1 = 2.
   - prev1 = current = 3.
3. **Loop i = 4:**
   - current = prev1 + prev2 = 3 + 2 = 5.
   - (There are 5 ways to climb 4 steps).
   - prev2 = prev1 = 3.
   - prev1 = current = 5.
4. **End of Loop.** Return prev1, which is 5.

We solved a classic DP problem without allocating an array, reducing memory usage to O(1).`,
    complexity: `### Time and Space Constraints

| Implementation | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Pure Recursion** | O(2^N) | O(N) |
| **Top-Down Memoization** | O(N) | O(N) (Memo array + Recursion Stack) |
| **Bottom-Up Tabulation** | O(N) | O(N) (DP Array) |
| **Space Optimized Tabulation**| O(N) | O(1) (2 Variables) |

*Note: 2D DP problems (like Edit Distance or Longest Common Subsequence) usually take O(N * M) time and space, and can be optimized to O(M) space by keeping only two rows.*`,
    problems: `### Classic Problems to Master

1. **[Easy] Climbing Stairs / Fibonacci:** (Pattern: 1D DP. Current state depends on the last two states).
2. **[Medium] Coin Change:** (Pattern: "Unbounded Knapsack". Given infinite coins, find minimum coins to make amount. dp[amount] = min(dp[amount], dp[amount - coin] + 1)).
3. **[Medium] Longest Common Subsequence:** (Pattern: 2D DP. Comparing string A to string B. If chars match, dp[i][j] = 1 + dp[i-1][j-1]. If not, dp[i][j] = max(dp[i-1][j], dp[i][j-1])).
4. **[Hard] Edit Distance:** (Pattern: 2D DP evaluating Cost of Insert, Delete, or Replace).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **Finding the Recurrence Relation:** Always ask yourself: "If I magically knew the optimal answer for N-1, how would I use it to solve N?"
- **State Definition:** The most important part of DP is defining what the array represents. For example: "dp[i] represents the maximum profit achievable using the first i houses." If you get the definition wrong, the recurrence relation will be impossible to write.
- **The "0" Base Case:** Don't forget to define dp[0]. Often, the answer for 0 elements is 0 (or 1, depending on the math). 

> **Checkpoint Question:** When should you use Top-Down Memoization over Bottom-Up Tabulation?
> **Answer:** If the problem has a massive state space (e.g. a 2D grid of 10,000 x 10,000) but the recursive logic only visits a tiny fraction of those states, Top-Down is faster because it strictly computes what is needed. Bottom-Up rigidly computes every single cell in the grid, wasting time on unreachable states.`
  },
  18: {
    title: "Advanced Data Structures (DSU, Segment Trees, BIT)",
    whatIsIt: `Once you master the standard structures (Hash Maps, Trees, Graphs), elite-level problems demand specialized machinery to maintain optimal time complexities under heavy operations.

- **Disjoint Set Union (DSU / Union-Find):** Keeps track of connected components in a graph in near O(1) time. Perfect for figuring out if two nodes belong to the same network without running a slow DFS.
- **Segment Tree:** An advanced tree used for answering "Range Queries" (e.g., what is the sum of indices 5 through 50?) and updating array values simultaneously, both in O(log N) time.
- **Binary Indexed Tree (Fenwick Tree):** A heavily mathematically optimized, space-saving version of a Segment Tree, restricted primarily to prefix sums.`,
    concept: `### Disjoint Set Union (DSU) Core Concepts

A DSU starts with every node acting as its own "boss" (parent).
If we draw an edge between Node 1 and Node 2, we "Union" them by making Node 1 the boss of Node 2.
If we connect 2 and 3, Node 1 becomes the boss of Node 3 as well.

**Two crucial optimizations:**
1. **Path Compression:** When looking for Node 3's boss, if we find it is Node 1, we redraw the pointer so Node 3 points *directly* to Node 1. Future lookups become instant O(1).
2. **Union by Rank:** When connecting two networks, always attach the smaller network's boss to the larger network's boss to keep the tree completely flat.`,
    code: `// C++ Implementation of Disjoint Set Union (Union-Find)
#include <bits/stdc++.h>
using namespace std;

class DSU {
private:
    vector<int> parent;
    vector<int> rank;

public:
    // O(N) Space, O(N) Time initialization
    DSU(int n) {
        parent.resize(n);
        rank.resize(n, 1);
        for (int i = 0; i < n; i++) {
            parent[i] = i; // Everyone is their own boss initially
        }
    }

    // Find operation with Path Compression
    // Amortized O(α(N)) Time (~O(1))
    int find(int x) {
        if (parent[x] != x) {
            // Recursively find the absolute top boss, 
            // and rewire current node to point directly to it!
            parent[x] = find(parent[x]); 
        }
        return parent[x];
    }

    // Union by Rank
    // Amortized O(α(N)) Time (~O(1))
    bool unite(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        
        if (rootX == rootY) return false; // Already in the same set (Cycle detected!)
        
        // Attach smaller tree under larger tree
        if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++; // If ranks are equal, one must grow
        }
        return true;
    }
};`,
    dryRun: `### Dry Run: Cycle Detection using DSU

Graph Edges: (0,1), (1,2), (0,2).

1. **Edge (0,1):**
   - find(0) = 0. find(1) = 1. Not equal.
   - unite(0,1). Make 0 the boss of 1. Parent array: [0, 0, 2].
2. **Edge (1,2):**
   - find(1) = 0 (Node 1 points to 0). find(2) = 2. Not equal.
   - unite(1,2). Make 0 the boss of 2. Parent array: [0, 0, 0].
3. **Edge (0,2):**
   - find(0) = 0. find(2) = 0 (Node 2 points to 0).
   - Roots are EQUAL! This means they are already connected. 
   - Adding this edge creates a CYCLE! unite returns false.

We detected a cycle in O(1) time per edge, drastically faster and simpler than running a DFS on the entire graph.`,
    complexity: `### Time and Space Constraints

| Operation | DSU | Segment Tree | BIT (Fenwick) |
| :--- | :--- | :--- | :--- |
| **Build / Init** | O(N) | O(N) | O(N) |
| **Query** | O(1) (Find Root) | O(log N) (Range Query) | O(log N) (Prefix Query) |
| **Update** | O(1) (Union) | O(log N) (Point/Range Update) | O(log N) (Point Update) |
| **Space** | O(N) | O(4*N) | O(N) |

*Note: The actual time complexity of DSU with Path Compression and Union by Rank is O(α(N)), where α is the Inverse Ackermann function. For all realistic inputs, α(N) < 5, making it effectively O(1).*`,
    problems: `### Classic Problems to Master

1. **[Medium] Redundant Connection:** (Pattern: DSU. Return the exact edge that creates a cycle in a tree).
2. **[Medium] Number of Provinces:** (Pattern: DSU. Count the number of unique "bosses" remaining after uniting all valid edges).
3. **[Hard] Range Sum Query - Mutable:** (Pattern: Segment Tree or BIT. Update values in an array and calculate the sum of ranges repeatedly).
4. **[Hard] Count of Smaller Numbers After Self:** (Pattern: Can be solved elegantly using a Fenwick Tree by traversing backwards and querying prefix frequencies).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **DSU is NOT for Pathing:** DSU tells you IF two nodes are connected. It CANNOT tell you the shortest path between them, nor can it output the nodes that make up the path. You still need BFS/DFS for that.
- **Segment Tree Array Size:** When building a Segment Tree using a flat array, you must allocate 4 * N space. Allocating just N or 2 * N will result in out-of-bounds memory errors.
- **1-Based Indexing:** Fenwick Trees (BIT) rely heavily on bitwise operations that mathematically break if you use index 0. Always shift your array to be 1-indexed when implementing a BIT.

> **Checkpoint Question:** Why do we use Union by Rank instead of just connecting parent[x] = y blindly?
> **Answer:** Blindly connecting nodes can create a long, single-file linked list structure, degrading the find() operation to O(N). Union by Rank ensures the smaller tree is always placed under the taller tree, keeping the total height strictly limited to O(log N).`
  },
  19: {
    title: "Bit Manipulation",
    whatIsIt: `Computers store data in 1s and 0s. Usually, we interact with high-level types like Integers (5). But under the hood, 5 is stored in binary as ...00000101.

Bit Manipulation involves bypassing standard arithmetic (like addition or modulo) and manipulating these raw binary bits directly using hardware-level CPU operations. These operations execute in a fraction of a clock cycle, making them the fastest operations mathematically possible in software.

They are primarily used in embedded systems, cryptography, and solving elite LeetCode problems where space complexity is aggressively restricted to O(1).`,
    concept: `### The Core Bitwise Operators

- **AND (&)**: Returns 1 if BOTH bits are 1. 
  - 1010 & 1100 = 1000
- **OR (|)**: Returns 1 if EITHER bit is 1.
  - 1010 | 1100 = 1110
- **XOR (^)**: Returns 1 if bits are DIFFERENT. Extremely powerful property: X ^ X = 0.
  - 1010 ^ 1100 = 0110
- **NOT (~)**: Inverts all bits.
  - ~00000101 = 11111010
- **Left Shift (<<)**: Shifts bits left, filling with 0. Mathematically multiplies by 2.
  - 00000101 << 1 = 00001010 (5 becomes 10)
- **Right Shift (>>)**: Shifts bits right. Mathematically divides by 2.
  - 00000101 >> 1 = 00000010 (5 becomes 2)`,
    code: `// C++ Implementation of Bit Tricks
#include <bits/stdc++.h>
using namespace std;

// 1. Single Number
// Every element appears twice except for one. Find it in O(1) space!
int singleNumber(vector<int>& nums) {
    int result = 0;
    // XOR cancels out duplicate numbers! (A ^ A = 0)
    // The only number remaining will be the one that appeared once.
    for (int num : nums) {
        result ^= num;
    }
    return result;
}

// 2. Power of Two
// Return true if N is a power of 2.
bool isPowerOfTwo(int n) {
    // A power of two in binary has exactly ONE bit set (e.g. 8 is 1000).
    // n - 1 flips that bit to 0, and all following 0s to 1s (8-1=7 is 0111).
    // Therefore, n & (n - 1) will always be 0 for powers of two!
    return n > 0 && (n & (n - 1)) == 0;
}

// 3. Counting Set Bits (Hamming Weight / Brian Kernighan’s Algorithm)
int hammingWeight(uint32_t n) {
    int count = 0;
    while (n != 0) {
        // This instantly clears the lowest set bit.
        n &= (n - 1); 
        count++;
    }
    return count;
}`,
    dryRun: `### Dry Run: XOR Single Number

Array: [4, 1, 2, 1, 2]

1. **Init:** result = 0
2. **Num = 4 (100 in binary):**
   - result = 0 ^ 4 = 4
3. **Num = 1 (001 in binary):**
   - result = 4 ^ 1 = 5 (101 in binary)
4. **Num = 2 (010 in binary):**
   - result = 5 ^ 2 = 7 (111 in binary)
5. **Num = 1 (001 in binary):**
   - result = 7 ^ 1 = 6 (110 in binary). Notice how the '1' bit was toggled back off!
6. **Num = 2 (010 in binary):**
   - result = 6 ^ 2 = 4 (100 in binary). The '2' bit is toggled back off!

Final Answer: 4. The duplicate numbers (1 and 2) completely cancelled themselves out via XOR, leaving only the unique number in O(N) time and O(1) space!`,
    complexity: `### Time and Space Constraints

| Operation | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Bitwise AND/OR/XOR** | O(1) (1 CPU Clock Cycle) | O(1) |
| **Shift Operators** | O(1) | O(1) |
| **Brian Kernighan’s Algo**| O(K) (K = number of set bits) | O(1) |

*Explanation:* Bit manipulation algorithms are prized because they avoid allocating arrays or Hash Maps. Operations execute at the deepest level of the CPU architecture (the ALU).`,
    problems: `### Classic Problems to Master

1. **[Easy] Missing Number:** (Pattern: XOR all numbers from 0 to N, then XOR all numbers in the array. The missing number remains).
2. **[Medium] Sum of Two Integers:** Add two numbers without using the + or - operators. (Pattern: Use XOR to simulate addition without carry, and use AND shifted left << 1 to calculate the carry, looping until carry is 0).
3. **[Medium] Subsets:** (Pattern: "Bitmasking". For an array of N elements, loop from 0 to 2^N. If the ith bit of the current number is 1, include the ith element in the subset).
4. **[Hard] Maximum XOR of Two Numbers in an Array:** (Pattern: Combine Bit Manipulation with a Prefix Trie to greedily choose opposite bits).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **Operator Precedence:** Bitwise operators have incredibly low precedence in C++/Java. 'if (n & 1 == 0)' evaluates as 'if (n & (1 == 0))', causing massive logic bugs! **ALWAYS** wrap bitwise operations in parentheses: 'if ((n & 1) == 0)'.
- **Negative Numbers:** Bit shifting negative numbers can cause unexpected behavior depending on the language due to "Two's Complement" sign extensions. In Java, use '>>>' for unsigned logical shift. In C++, cast to unsigned 'uint32_t' before shifting.
- **Bitmasking Constraints:** You can only use an integer as a bitmask if the set size is <= 32 (or 64 for 'long'). If an array has 100 elements, you cannot generate subsets using bitmasks.

> **Checkpoint Question:** Why is 'n & (n - 1)' such an important bitwise operation?
> **Answer:** It mathematically flips the lowest (rightmost) set bit of a number to 0, while leaving all higher bits untouched. This is the foundation for quickly counting set bits or checking if a number is an exact power of two.`
  },
  20: {
    title: "Advanced Graphs (Dijkstra, MST, Topological Sort)",
    whatIsIt: `Basic BFS and DFS are sufficient for unweighted networks. However, the real world is weighted: roads have different speed limits, network cables have different latencies, and tasks have strict prerequisite dependencies. 

Advanced graph algorithms solve these complex, weighted scenarios:
- **Dijkstra’s Algorithm:** Finds the absolute shortest path from a starting node to all other nodes in a weighted graph.
- **Minimum Spanning Tree (MST):** Connects every single node in a graph together using the absolute minimum total edge weight (Prim's or Kruskal's Algorithm).
- **Topological Sort:** Takes a Directed Acyclic Graph (DAG) and orders the nodes in a straight line so that all prerequisites are completed before the dependent tasks.`,
    concept: `### Dijkstra's Core Concept (The Greedy Graph)

Dijkstra's is essentially BFS, but instead of using a standard FIFO Queue, it uses a **Min-Heap (Priority Queue)**. 

If we have two paths:
- Path A: 3 hops, total cost = 500 miles.
- Path B: 8 hops, total cost = 10 miles.

Standard BFS takes Path A because it has fewer hops. Dijkstra takes Path B because the Min-Heap constantly prioritizes the path with the smallest accumulated weight.

### Topological Sort (Kahn's Algorithm)

Imagine graduating college. You can't take "Advanced Algorithms" until you pass "Intro to CS".
We track the **In-Degree** (number of prerequisites) for every class.
1. Find all classes with In-Degree == 0 (no prerequisites). Put them in a queue.
2. Take a class, "complete" it, and reduce the In-Degree of its dependent classes by 1.
3. If a dependent class hits 0, add it to the queue.
If the queue empties but some classes weren't taken, there is a cycle (an impossible prerequisite loop)!`,
    code: `// C++ Implementation of Advanced Graph Algorithms
#include <bits/stdc++.h>
using namespace std;

// 1. Dijkstra's Algorithm
// O((V + E) log V) Time, O(V) Space
vector<int> dijkstra(int n, vector<vector<pair<int,int>>>& adj, int src) {
    const int INF = 1e9;
    vector<int> dist(n, INF);
    
    // Min-Heap storing {distance, node}
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    
    dist[src] = 0;
    pq.push({0, src});
    
    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        
        // Optimization: If we pulled an outdated, longer path from the heap, ignore it.
        if (d > dist[u]) continue; 
        
        // Explore all neighbors
        for (auto edge : adj[u]) {
            int v = edge.first;     // neighbor node
            int weight = edge.second; // edge weight
            
            // Relaxation: If we found a strictly shorter path to v
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist; // Array of absolute shortest distances from src to all nodes
}

// 2. Topological Sort (Kahn's Algorithm via BFS)
// O(V + E) Time, O(V) Space
vector<int> topoSort(int V, vector<vector<int>>& adj) {
    vector<int> inDegree(V, 0);
    // Calculate in-degrees
    for (int u = 0; u < V; u++) {
        for (int v : adj[u]) {
            inDegree[v]++;
        }
    }
    
    queue<int> q;
    // Start with nodes having 0 dependencies
    for (int i = 0; i < V; i++) {
        if (inDegree[i] == 0) q.push(i);
    }
    
    vector<int> topoOrder;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        topoOrder.push_back(u);
        
        // Process neighbors, simulating "completing" node u
        for (int v : adj[u]) {
            inDegree[v]--;
            if (inDegree[v] == 0) q.push(v);
        }
    }
    
    // If order size != V, a cycle exists!
    if (topoOrder.size() != V) return {}; 
    return topoOrder;
}`,
    dryRun: `### Dry Run: Dijkstra's Relaxation

Graph: A -> B (cost 10), A -> C (cost 3), C -> B (cost 2).
Start at A. Distances: [A:0, B:INF, C:INF].

1. **Pop A (Cost 0):**
   - Neighbor B: Cost is 0 + 10 = 10. 10 < INF. Update Dist[B] = 10. Push {10, B}.
   - Neighbor C: Cost is 0 + 3 = 3. 3 < INF. Update Dist[C] = 3. Push {3, C}.
2. **Pop C (Cost 3):** *(Min-Heap guarantees C comes out before B!)*
   - Neighbor B: Cost is Dist[C] + 2 = 3 + 2 = 5.
   - Is 5 < Dist[B] (which is 10)? YES! We found a shortcut!
   - **Relaxation:** Update Dist[B] = 5. Push {5, B} into the heap.
3. **Pop B (Cost 5):** No neighbors.
4. **Pop B (Cost 10):** (The old, outdated path). 
   - Is 10 > Dist[B] (which is 5)? Yes. Ignore it.

Final distances from A: B=5, C=3. Dijkstra magically routed us through C to reach B faster than the direct highway!`,
    complexity: `### Time and Space Constraints

| Algorithm | Application | Time Complexity | Space |
| :--- | :--- | :--- | :--- |
| **Dijkstra** | Shortest path (Positive weights) | O(E log V) | O(V) |
| **Bellman-Ford** | Shortest path (Negative weights) | O(V * E) | O(V) |
| **Kruskal (MST)** | Connecting all nodes cheaply | O(E log E) | O(V) |
| **Topo Sort** | Dependency scheduling | O(V + E) | O(V) |

*Explanation:* Dijkstra uses a Priority Queue. Every time we update a distance, we push a new node into the heap (up to E edges). Inserting into a heap of size V takes O(log V). Thus, the time is bounded by O(E log V).`,
    problems: `### Classic Problems to Master

1. **[Medium] Course Schedule I & II:** (Pattern: Topological Sort. Output the array if size == V, otherwise return empty array indicating cycle).
2. **[Medium] Network Delay Time:** (Pattern: Pure Dijkstra. Find the max distance in the dist array. If any node remains INF, it is unreachable).
3. **[Hard] Minimum Cost to Connect All Points:** (Pattern: Minimum Spanning Tree. Treat each coordinate as a node, edge weight is Manhattan distance. Use Kruskal's with DSU to connect them).
4. **[Hard] Cheapest Flights Within K Stops:** (Pattern: Modified Dijkstra / BFS. Track the number of hops alongside the weight, rejecting paths that exceed K).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **Negative Edge Weights:** If a graph has edges with negative costs (e.g., traveling backwards in time, or gaining money instead of spending), Dijkstra's Algorithm fundamentally breaks. You MUST use the Bellman-Ford algorithm (O(V * E)).
- **Outdated Heap Nodes:** In Dijkstra, we don't update existing values in the priority queue (C++ doesn't allow it easily). We just push the new shorter distance. This means the heap contains duplicate nodes. Always add 'if (d > dist[u]) continue;' at the top of the loop to immediately discard outdated paths and save massive computation time.
- **Topological DFS vs BFS:** Topo Sort can also be done via DFS (pushing nodes to a stack post-order, then reversing it). However, Kahn's Algorithm (BFS with In-Degree) is much easier to write and natively detects cycles without needing complex state arrays (visited, visiting, unvisited).

> **Checkpoint Question:** In Dijkstra's Algorithm, why does it break if there is a negative edge weight?
> **Answer:** Dijkstra's uses a greedy approach, finalizing a node's shortest path permanently once it is popped from the Min-Heap. If a negative edge exists, a path that looked terribly long could suddenly drop below zero, exposing a shorter route to a "finalized" node, breaking the algorithm's core assumption.`
  }
};
