// Static DSA Pattern Templates — The Vault
export const DSA_TEMPLATES = [
  {
    id: 'binary-search',
    name: 'Binary Search',
    icon: '🔍',
    category: 'Searching',
    description: 'Divide and conquer on a sorted array. Halves the search space each iteration.',
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(1)',
    whenToUse: [
      'Searching in a sorted array',
      'Finding a boundary (first/last occurrence)',
      'Minimizing or maximizing a value (binary search on answer)',
    ],
    template: `int binarySearch(vector<int>& arr, int target) {
  int lo = 0, hi = (int)arr.size() - 1;

  while (lo <= hi) {
    int mid = lo + (hi - lo) / 2; // Prevents overflow

    if (arr[mid] == target) return mid;
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return -1; // Not found
}`,
    gotchas: [
      'Use `lo + (hi - lo) / 2` instead of `(lo + hi) / 2` to prevent integer overflow.',
      'Be careful with `lo <= hi` vs `lo < hi` — the wrong one causes infinite loops.',
      'For "first occurrence" problems, don\'t return immediately — narrow the range.',
    ],
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    icon: '🪟',
    category: 'Arrays',
    description: 'Maintain a window of elements and slide it across the array to compute running aggregates.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1) or O(K)',
    whenToUse: [
      'Subarray/substring problems with a fixed or variable-size window',
      'Finding max/min sum of K consecutive elements',
      'Longest substring without repeating characters',
    ],
    template: `int slidingWindow(vector<int>& arr, int k) {
  int windowSum = 0, maxSum = INT_MIN;

  for (int i = 0; i < (int)arr.size(); i++) {
    windowSum += arr[i]; // Expand window

    if (i >= k - 1) {
      maxSum = max(maxSum, windowSum);
      windowSum -= arr[i - (k - 1)]; // Shrink window
    }
  }

  return maxSum;
}`,
    gotchas: [
      'For variable-size windows, use two pointers (left, right) and a while loop to shrink.',
      'Be careful with off-by-one errors when computing window boundaries.',
      'Use an unordered_map or unordered_set for "distinct characters" type problems.',
    ],
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    icon: '👆👆',
    category: 'Arrays',
    description: 'Use two pointers moving towards or away from each other to solve problems in O(N).',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    whenToUse: [
      'Sorted array pair-sum problems',
      'Removing duplicates in-place',
      'Palindrome checks',
      'Container with most water',
    ],
    template: `pair<int,int> twoPointers(vector<int>& arr, int target) {
  int left = 0, right = (int)arr.size() - 1;

  while (left < right) {
    int sum = arr[left] + arr[right];

    if (sum == target) return {left, right};
    else if (sum < target) left++;
    else right--;
  }

  return {-1, -1}; // Not found
}`,
    gotchas: [
      'Array MUST be sorted for this to work (or sort it first).',
      'Decide whether to move left or right pointer based on comparison.',
      'For 3Sum, fix one pointer and use two-pointer on the rest.',
    ],
  },
  {
    id: 'bfs',
    name: 'BFS (Breadth-First Search)',
    icon: '🌊',
    category: 'Graphs & Trees',
    description: 'Level-by-level traversal using a queue. Finds shortest path in unweighted graphs.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    whenToUse: [
      'Shortest path in unweighted graphs',
      'Level-order tree traversal',
      'Finding connected components',
      'Rotting oranges, word ladder problems',
    ],
    template: `vector<int> bfs(unordered_map<int, vector<int>>& graph, int start) {
  unordered_set<int> visited;
  queue<int> q;
  vector<int> result;

  visited.insert(start);
  q.push(start);

  while (!q.empty()) {
    int node = q.front(); q.pop();
    result.push_back(node);

    for (int neighbor : graph[node]) {
      if (!visited.count(neighbor)) {
        visited.insert(neighbor);
        q.push(neighbor);
      }
    }
  }

  return result;
}`,
    gotchas: [
      'Mark nodes as visited BEFORE adding to queue (not after popping) to avoid duplicates.',
      'std::queue uses O(1) push/pop — no performance concern unlike JS array.shift().',
      'For shortest path, track distance alongside each node in the queue.',
    ],
  },
  {
    id: 'dfs',
    name: 'DFS (Depth-First Search)',
    icon: '🏔️',
    category: 'Graphs & Trees',
    description: 'Explore as deep as possible before backtracking. Uses recursion or a stack.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    whenToUse: [
      'Path finding / cycle detection',
      'Topological sorting',
      'Island counting (grid DFS)',
      'Generating permutations/combinations',
    ],
    template: `void explore(int node, unordered_map<int, vector<int>>& graph,
             unordered_set<int>& visited, vector<int>& result) {
  visited.insert(node);
  result.push_back(node);

  for (int neighbor : graph[node]) {
    if (!visited.count(neighbor)) {
      explore(neighbor, graph, visited, result);
    }
  }
}

vector<int> dfs(unordered_map<int, vector<int>>& graph, int start) {
  unordered_set<int> visited;
  vector<int> result;
  explore(start, graph, visited, result);
  return result;
}`,
    gotchas: [
      'Watch for stack overflow on deeply recursive graphs — use iterative DFS with explicit std::stack.',
      'For grid problems, mark cells as visited by changing the value in-place (e.g., set to 0).',
      'For cycle detection in directed graphs, track "in-stack" nodes separately.',
    ],
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    icon: '📊',
    category: 'Optimization',
    description: 'Break problems into overlapping subproblems. Build solutions bottom-up or top-down.',
    timeComplexity: 'Varies — O(N), O(N²), O(N×M)',
    spaceComplexity: 'O(N) or O(N×M)',
    whenToUse: [
      'Optimization problems (min/max)',
      'Counting problems (number of ways)',
      'Problems with overlapping subproblems + optimal substructure',
      'Fibonacci, Knapsack, LCS, Edit Distance',
    ],
    template: `// Bottom-up DP Template
int dpBottomUp(int n) {
  vector<int> dp(n + 1, 0);
  dp[0] = 0; // Base case
  dp[1] = 1; // Base case

  for (int i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]; // Recurrence relation
  }

  return dp[n];
}

// Top-down with Memoization
unordered_map<int, int> memo;
int dpTopDown(int n) {
  if (n <= 1) return n;
  if (memo.count(n)) return memo[n];

  return memo[n] = dpTopDown(n - 1) + dpTopDown(n - 2);
}`,
    gotchas: [
      'Always identify: What is the STATE? What is the TRANSITION? What are the BASE CASES?',
      'If only the previous row/column matters, optimize space from O(N²) to O(N).',
      'Top-down is easier to write; bottom-up is faster (no recursion overhead).',
    ],
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    icon: '🔙',
    category: 'Recursion',
    description: 'Build candidates incrementally and abandon a candidate as soon as it violates constraints.',
    timeComplexity: 'O(N!) or O(2^N)',
    spaceComplexity: 'O(N)',
    whenToUse: [
      'Permutations, combinations, subsets',
      'N-Queens, Sudoku solver',
      'Word search in a grid',
      'Any "generate all valid..." problem',
    ],
    template: `void backtrack(vector<vector<int>>& result, vector<int>& current,
               vector<int>& choices) {
  if (/* goal condition */) {
    result.push_back(current); // Copy is made automatically
    return;
  }

  for (int i = 0; i < (int)choices.size(); i++) {
    if (/* constraint check */) continue; // Prune

    current.push_back(choices[i]);          // Choose
    backtrack(result, current, choices);    // Explore
    current.pop_back();                     // Un-choose (backtrack)
  }
}`,
    gotchas: [
      'Passing vector by value copies it — prefer passing by reference and doing push_back/pop_back.',
      'Pruning early is the key to performance. Add constraint checks BEFORE recursing.',
      'For permutations: track used indices with a bool array. For combinations: track start index.',
    ],
  },
  {
    id: 'union-find',
    name: 'Union-Find (Disjoint Set)',
    icon: '🔗',
    category: 'Graphs',
    description: 'Efficiently track connected components. Near O(1) union and find operations.',
    timeComplexity: 'O(α(N)) ≈ O(1) amortized',
    spaceComplexity: 'O(N)',
    whenToUse: [
      'Connected components in an undirected graph',
      'Detecting cycles',
      'Kruskal\'s MST algorithm',
      'Account merging, friend circles',
    ],
    template: `class UnionFind {
public:
  vector<int> parent, rank_;

  UnionFind(int n) : parent(n), rank_(n, 0) {
    iota(parent.begin(), parent.end(), 0);
  }

  int find(int x) {
    if (parent[x] != x)
      parent[x] = find(parent[x]); // Path compression
    return parent[x];
  }

  bool unite(int x, int y) {
    int px = find(x), py = find(y);
    if (px == py) return false; // Already connected

    // Union by rank
    if (rank_[px] < rank_[py]) swap(px, py);
    parent[py] = px;
    if (rank_[px] == rank_[py]) rank_[px]++;
    return true;
  }
};`,
    gotchas: [
      'Path compression in `find()` is essential — without it, performance degrades.',
      'Union by rank keeps the tree shallow.',
      'Count connected components = N - (number of successful unions).',
    ],
  },
  {
    id: 'heap-priority-queue',
    name: 'Heap / Priority Queue',
    icon: '⛰️',
    category: 'Data Structures',
    description: 'Efficiently get min/max elements. Used in top-K, merge-K, and scheduling problems.',
    timeComplexity: 'O(log N) insert/extract',
    spaceComplexity: 'O(N)',
    whenToUse: [
      'Top K elements / Kth largest',
      'Merge K sorted lists',
      'Task scheduling with priorities',
      'Dijkstra\'s shortest path',
    ],
    template: `// C++ has a built-in priority_queue (max-heap by default)
// Min-heap: priority_queue<int, vector<int>, greater<int>>

// Top-K largest elements using a min-heap of size K:
vector<int> topKLargest(vector<int>& nums, int k) {
  priority_queue<int, vector<int>, greater<int>> minHeap;

  for (int num : nums) {
    minHeap.push(num);
    if ((int)minHeap.size() > k)
      minHeap.pop(); // Remove smallest — keeps K largest
  }

  vector<int> result;
  while (!minHeap.empty()) {
    result.push_back(minHeap.top());
    minHeap.pop();
  }
  return result;
}`,
    gotchas: [
      'For "Top K smallest" use a MAX heap of size K. For "Top K largest" use a MIN heap of size K.',
      'std::priority_queue is a max-heap by default. Use greater<int> for min-heap.',
      'For custom comparators with pairs, use: priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>>.',
    ],
  },
  {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    icon: '🌳',
    category: 'Data Structures',
    description: 'Tree structure for efficient string prefix operations. O(L) insert/search where L = word length.',
    timeComplexity: 'O(L) per operation',
    spaceComplexity: 'O(N × L)',
    whenToUse: [
      'Autocomplete / prefix search',
      'Word dictionary problems',
      'Longest common prefix',
      'Word search II (with backtracking)',
    ],
    template: `struct TrieNode {
  unordered_map<char, TrieNode*> children;
  bool isEnd = false;
};

class Trie {
  TrieNode* root;
public:
  Trie() : root(new TrieNode()) {}

  void insert(const string& word) {
    TrieNode* node = root;
    for (char ch : word) {
      if (!node->children.count(ch))
        node->children[ch] = new TrieNode();
      node = node->children[ch];
    }
    node->isEnd = true;
  }

  bool search(const string& word) {
    TrieNode* node = root;
    for (char ch : word) {
      if (!node->children.count(ch)) return false;
      node = node->children[ch];
    }
    return node->isEnd;
  }

  bool startsWith(const string& prefix) {
    TrieNode* node = root;
    for (char ch : prefix) {
      if (!node->children.count(ch)) return false;
      node = node->children[ch];
    }
    return true;
  }
};`,
    gotchas: [
      'Don\'t forget `isEnd` flag — it differentiates "app" existing vs "apple" having an "app" prefix.',
      'For memory optimization and lowercase-only problems, use `TrieNode* children[26]` instead of a map.',
      'Tries shine in Word Search II — combine with DFS/backtracking for massive speedup.',
    ],
  },
];

    name: 'Binary Search',
    icon: '🔍',
    category: 'Searching',
    description: 'Divide and conquer on a sorted array. Halves the search space each iteration.',
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(1)',
    whenToUse: [
      'Searching in a sorted array',
      'Finding a boundary (first/last occurrence)',
      'Minimizing or maximizing a value (binary search on answer)',
    ],
    template: `function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // Prevents overflow
    
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  
  return -1; // Not found
}`,
    gotchas: [
      'Use `lo + (hi - lo) / 2` instead of `(lo + hi) / 2` to prevent integer overflow.',
      'Be careful with `lo <= hi` vs `lo < hi` — the wrong one causes infinite loops.',
      'For "first occurrence" problems, don\'t return immediately — narrow the range.',
    ],
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    icon: '🪟',
    category: 'Arrays',
    description: 'Maintain a window of elements and slide it across the array to compute running aggregates.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1) or O(K)',
    whenToUse: [
      'Subarray/substring problems with a fixed or variable-size window',
      'Finding max/min sum of K consecutive elements',
      'Longest substring without repeating characters',
    ],
    template: `function slidingWindow(arr: number[], k: number): number {
  let windowSum = 0, maxSum = -Infinity;

  for (let i = 0; i < arr.length; i++) {
    windowSum += arr[i]; // Expand window

    if (i >= k - 1) {
      maxSum = Math.max(maxSum, windowSum);
      windowSum -= arr[i - (k - 1)]; // Shrink window
    }
  }

  return maxSum;
}`,
    gotchas: [
      'For variable-size windows, use two pointers (left, right) and a while loop to shrink.',
      'Be careful with off-by-one errors when computing window boundaries.',
      'Use a Map/Set for "distinct characters" type problems.',
    ],
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    icon: '👆👆',
    category: 'Arrays',
    description: 'Use two pointers moving towards or away from each other to solve problems in O(N).',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    whenToUse: [
      'Sorted array pair-sum problems',
      'Removing duplicates in-place',
      'Palindrome checks',
      'Container with most water',
    ],
    template: `function twoPointers(arr: number[], target: number): [number, number] | null {
  let left = 0, right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];

    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
  }

  return null;
}`,
    gotchas: [
      'Array MUST be sorted for this to work (or sort it first).',
      'Decide whether to move left or right pointer based on comparison.',
      'For 3Sum, fix one pointer and use two-pointer on the rest.',
    ],
  },
  {
    id: 'bfs',
    name: 'BFS (Breadth-First Search)',
    icon: '🌊',
    category: 'Graphs & Trees',
    description: 'Level-by-level traversal using a queue. Finds shortest path in unweighted graphs.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    whenToUse: [
      'Shortest path in unweighted graphs',
      'Level-order tree traversal',
      'Finding connected components',
      'Rotting oranges, word ladder problems',
    ],
    template: `function bfs(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>();
  const queue: number[] = [start];
  const result: number[] = [];
  visited.add(start);

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return result;
}`,
    gotchas: [
      'Mark nodes as visited BEFORE adding to queue (not after popping) to avoid duplicates.',
      '`queue.shift()` is O(N) in JS — use a proper Queue/Deque for performance.',
      'For shortest path, track distance alongside each node in the queue.',
    ],
  },
  {
    id: 'dfs',
    name: 'DFS (Depth-First Search)',
    icon: '🏔️',
    category: 'Graphs & Trees',
    description: 'Explore as deep as possible before backtracking. Uses recursion or a stack.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    whenToUse: [
      'Path finding / cycle detection',
      'Topological sorting',
      'Island counting (grid DFS)',
      'Generating permutations/combinations',
    ],
    template: `function dfs(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>();
  const result: number[] = [];

  function explore(node: number) {
    visited.add(node);
    result.push(node);

    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        explore(neighbor);
      }
    }
  }

  explore(start);
  return result;
}`,
    gotchas: [
      'Watch for stack overflow on deeply recursive graphs — use iterative DFS with explicit stack.',
      'For grid problems, mark cells as visited by changing the value in-place.',
      'For cycle detection in directed graphs, track "in-stack" nodes separately.',
    ],
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    icon: '📊',
    category: 'Optimization',
    description: 'Break problems into overlapping subproblems. Build solutions bottom-up or top-down.',
    timeComplexity: 'Varies — O(N), O(N²), O(N×M)',
    spaceComplexity: 'O(N) or O(N×M)',
    whenToUse: [
      'Optimization problems (min/max)',
      'Counting problems (number of ways)',
      'Problems with overlapping subproblems + optimal substructure',
      'Fibonacci, Knapsack, LCS, Edit Distance',
    ],
    template: `// Bottom-up DP Template
function dpBottomUp(n: number): number {
  const dp = new Array(n + 1).fill(0);
  dp[0] = 0; // Base case
  dp[1] = 1; // Base case

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]; // Recurrence relation
  }

  return dp[n];
}

// Top-down with Memoization
function dpTopDown(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;
  
  const result = dpTopDown(n - 1, memo) + dpTopDown(n - 2, memo);
  memo.set(n, result);
  return result;
}`,
    gotchas: [
      'Always identify: What is the STATE? What is the TRANSITION? What are the BASE CASES?',
      'If only the previous row/column matters, optimize space from O(N²) to O(N).',
      'Top-down is easier to write; bottom-up is faster (no recursion overhead).',
    ],
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    icon: '🔙',
    category: 'Recursion',
    description: 'Build candidates incrementally and abandon a candidate as soon as it violates constraints.',
    timeComplexity: 'O(N!) or O(2^N)',
    spaceComplexity: 'O(N)',
    whenToUse: [
      'Permutations, combinations, subsets',
      'N-Queens, Sudoku solver',
      'Word search in a grid',
      'Any "generate all valid..." problem',
    ],
    template: `function backtrack(result: number[][], current: number[], choices: number[]) {
  if (/* goal condition */) {
    result.push([...current]); // Copy! Don't push reference.
    return;
  }

  for (let i = 0; i < choices.length; i++) {
    if (/* constraint check */) continue; // Prune

    current.push(choices[i]);        // Choose
    backtrack(result, current, choices); // Explore
    current.pop();                    // Un-choose (backtrack)
  }
}`,
    gotchas: [
      'Always `[...current]` when pushing to results — never push the reference directly.',
      'Pruning early is the key to performance. Add constraint checks BEFORE recursing.',
      'For permutations: track used indices. For combinations: track start index.',
    ],
  },
  {
    id: 'union-find',
    name: 'Union-Find (Disjoint Set)',
    icon: '🔗',
    category: 'Graphs',
    description: 'Efficiently track connected components. Near O(1) union and find operations.',
    timeComplexity: 'O(α(N)) ≈ O(1) amortized',
    spaceComplexity: 'O(N)',
    whenToUse: [
      'Connected components in an undirected graph',
      'Detecting cycles',
      'Kruskal\'s MST algorithm',
      'Account merging, friend circles',
    ],
    template: `class UnionFind {
  parent: number[];
  rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const px = this.find(x), py = this.find(y);
    if (px === py) return false; // Already connected

    // Union by rank
    if (this.rank[px] < this.rank[py]) this.parent[px] = py;
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
    else { this.parent[py] = px; this.rank[px]++; }
    
    return true;
  }
}`,
    gotchas: [
      'Path compression in `find()` is essential — without it, performance degrades.',
      'Union by rank keeps the tree shallow.',
      'Count connected components = N - (number of successful unions).',
    ],
  },
  {
    id: 'heap-priority-queue',
    name: 'Heap / Priority Queue',
    icon: '⛰️',
    category: 'Data Structures',
    description: 'Efficiently get min/max elements. Used in top-K, merge-K, and scheduling problems.',
    timeComplexity: 'O(log N) insert/extract',
    spaceComplexity: 'O(N)',
    whenToUse: [
      'Top K elements / Kth largest',
      'Merge K sorted lists',
      'Task scheduling with priorities',
      'Dijkstra\'s shortest path',
    ],
    template: `// JavaScript doesn't have a built-in heap. 
// In interviews, explain you'd use a MinHeap class.
// Here's a minimal implementation:

class MinHeap {
  heap: number[] = [];

  push(val: number) {
    this.heap.push(val);
    this._bubbleUp(this.heap.length - 1);
  }

  pop(): number {
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  peek(): number { return this.heap[0]; }
  size(): number { return this.heap.length; }

  private _bubbleUp(i: number) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent] <= this.heap[i]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private _sinkDown(i: number) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l] < this.heap[smallest]) smallest = l;
      if (r < n && this.heap[r] < this.heap[smallest]) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}`,
    gotchas: [
      'For "Top K smallest" use a MAX heap of size K. For "Top K largest" use a MIN heap of size K.',
      'In JS, you must implement your own heap or use a library.',
      'Parent = floor((i-1)/2), Left child = 2i+1, Right child = 2i+2.',
    ],
  },
  {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    icon: '🌳',
    category: 'Data Structures',
    description: 'Tree structure for efficient string prefix operations. O(L) insert/search where L = word length.',
    timeComplexity: 'O(L) per operation',
    spaceComplexity: 'O(N × L)',
    whenToUse: [
      'Autocomplete / prefix search',
      'Word dictionary problems',
      'Longest common prefix',
      'Word search II (with backtracking)',
    ],
    template: `class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd: boolean = false;
}

class Trie {
  root = new TrieNode();

  insert(word: string) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch)!;
    }
    return node.isEnd;
  }

  startsWith(prefix: string): boolean {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch)!;
    }
    return true;
  }
}`,
    gotchas: [
      'Don\'t forget `isEnd` flag — it differentiates "app" existing vs "apple" having an "app" prefix.',
      'For memory optimization, use arrays of size 26 instead of Maps (if only lowercase letters).',
      'Tries shine in Word Search II — combine with DFS/backtracking for massive speedup.',
    ],
  },
];
