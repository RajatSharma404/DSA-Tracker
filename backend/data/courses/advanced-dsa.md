---
slug: advanced-dsa
title: Advanced DSA
description: The structures and techniques that turn hard problems into routine ones: union-find, Fenwick and segment trees, sparse tables, monotonic stacks, string matching, hashing, shortest paths, SCCs, MSTs, LCA and three families of DP. Each module explains when to reach for the technique, gives a clean C++ implementation, and ends with a quiz and LeetCode practice.
order: 3
---

# dsu | Disjoint Set Union | Merge groups and answer "are these connected?" in near-constant time.
difficulty: ADVANCED
minutes: 35
objective: Recognise connectivity questions that DSU answers better than BFS or DFS
objective: Implement DSU with path compression and union by size
objective: Use DSU to detect cycles and count components

::: markdown
## When to use it

Use a **disjoint set union** (union-find) when items join groups over time and you keep asking whether two items are in the same group. Typical signals:

- edges arrive one by one and you need the number of connected components after each,
- you must detect the first edge that creates a cycle,
- you merge equivalent things (accounts with a shared email, equal variables).

BFS or DFS answers one connectivity question per traversal. DSU answers each `union` and `find` in amortised **O(α(n))**, where α is the inverse Ackermann function and is at most 4 for any realistic n.

## How it works

Every set is a tree. Each element points to a parent; the root represents the set.

- **find(x)** follows parents to the root. *Path compression* points every visited node straight at the root, so the next lookup is instant.
- **unite(a, b)** finds both roots and hangs the smaller tree under the larger (*union by size*), which keeps trees shallow.

Either optimisation alone gives O(log n); together they give O(α(n)).
:::

::: code cpp | DSU with path compression and union by size
#include <numeric>
#include <utility>
#include <vector>
using namespace std;

struct DSU {
    vector<int> parent, size;
    int components;

    explicit DSU(int n) : parent(n), size(n, 1), components(n) {
        iota(parent.begin(), parent.end(), 0);  // every node is its own root
    }

    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];  // path halving: a cheap form of compression
            x = parent[x];
        }
        return x;
    }

    // Returns false if a and b were already connected (the edge closes a cycle).
    bool unite(int a, int b) {
        a = find(a), b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        --components;
        return true;
    }
};
:::

::: note
**Pitfalls.** Always compare `find(a) == find(b)`, never `parent[a] == parent[b]`: parents are not roots until compressed. When nodes are not numbered 0..n-1 (emails, strings), map them to indices first with a hash map.
:::

::: quiz
question: You add edges one at a time and need the first edge that creates a cycle. What does DSU check for each edge (u, v)?
- Whether u and v have the same parent
- Whether find(u) == find(v) before uniting *
- Whether size[u] equals size[v]
- Whether u or v is already a root
explanation: If u and v already share a root, they are connected, so the edge closes a cycle. Parents can differ even when the roots are the same.
:::

::: problems
number-of-provinces
redundant-connection
accounts-merge
satisfiability-of-equality-equations
most-stones-removed-with-same-row-or-column
:::

# fenwick-tree | Fenwick Tree (BIT) | Prefix sums that stay correct while the array changes.
difficulty: ADVANCED
minutes: 35
objective: Explain how lowbit(i) = i & -i decides each node's range
objective: Implement point update and prefix query in O(log n)
objective: Count inversions with a Fenwick tree over compressed values

::: markdown
## When to use it

A plain prefix-sum array answers range sums in O(1) but needs O(n) to rebuild after a single update. A **Fenwick tree** (binary indexed tree) does both in **O(log n)**, in about ten lines of code.

Reach for it when you need:

- point updates mixed with range-sum queries,
- counting, for each element, how many earlier elements are smaller (inversions, "count of smaller numbers after self"),
- anything expressible as an invertible prefix aggregate (sum, xor).

## How it works

Use 1-based indices. Node `i` stores the sum of the range `(i - lowbit(i), i]`, where `lowbit(i) = i & -i` is the lowest set bit.

- **query(i)** adds `tree[i]`, then jumps to `i - lowbit(i)`, until `i` is 0.
- **update(i, delta)** adds delta to `tree[i]`, then jumps to `i + lowbit(i)`, until past n.

Each jump clears or carries one bit, so both loops run at most log n times.

For min or max (not invertible), use a segment tree instead.
:::

::: code cpp | Fenwick tree with range sums
#include <vector>
using namespace std;

struct Fenwick {
    int n;
    vector<long long> tree;

    explicit Fenwick(int n) : n(n), tree(n + 1, 0) {}

    void update(int i, long long delta) {  // 1-based index
        for (; i <= n; i += i & -i) tree[i] += delta;
    }

    long long query(int i) const {  // sum of [1, i]
        long long s = 0;
        for (; i > 0; i -= i & -i) s += tree[i];
        return s;
    }

    long long query(int l, int r) const {  // sum of [l, r]
        return query(r) - query(l - 1);
    }
};

// Number of pairs i < j with a[i] > a[j]. Values must be compressed to 1..m first.
long long countInversions(const vector<int>& compressed, int m) {
    Fenwick bit(m);
    long long inversions = 0;
    for (int j = 0; j < (int)compressed.size(); ++j) {
        int v = compressed[j];
        inversions += j - bit.query(v);  // earlier elements greater than v
        bit.update(v, 1);
    }
    return inversions;
}
:::

::: note
**Pitfalls.** Index 0 makes `i & -i` equal 0 and the loops never end, so shift to 1-based. When values are large or negative, sort the distinct values and map each to its rank (coordinate compression) before using them as indices.
:::

::: quiz
question: In a Fenwick tree, which range does tree[12] cover? (12 is 1100 in binary.)
- [1, 12]
- (8, 12], that is indices 9 to 12 *
- (11, 12], only index 12
- [12, 16)
explanation: lowbit(12) = 4, so tree[12] covers (12 - 4, 12] = indices 9, 10, 11 and 12.
:::

::: problems
range-sum-query-mutable
count-of-smaller-numbers-after-self
reverse-pairs
create-sorted-array-through-instructions
:::

# segment-tree | Segment Tree and Lazy Propagation | Range queries and range updates for any associative operation.
difficulty: ADVANCED
minutes: 45
objective: Build a segment tree for sums, minimums or maximums
objective: Answer range queries in O(log n) by combining at most 2 log n nodes
objective: Apply range updates lazily

::: markdown
## When to use it

A **segment tree** handles range queries for any associative operation (sum, min, max, gcd) with point or range updates, each in **O(log n)**. It is more code than a Fenwick tree but far more flexible:

- range minimum or maximum with updates,
- "add x to every element in [l, r]" combined with range-sum queries (lazy propagation),
- counting overlaps, as in calendar booking problems.

## How it works

Node 1 covers the whole array; node `v` covering `[lo, hi]` has children `2v` and `2v+1` covering the two halves. A query descends only into nodes that partly overlap the requested range, so it touches O(log n) nodes.

**Lazy propagation.** For range updates, a node fully inside the update range records the pending change in `lazy[v]` and stops. The change is pushed to its children only when a later operation needs to go below that node.
:::

::: code cpp | Segment tree: range add, range sum
#include <vector>
using namespace std;

struct SegTree {
    int n;
    vector<long long> sum, lazy;

    explicit SegTree(const vector<long long>& a) : n(a.size()), sum(4 * a.size()), lazy(4 * a.size()) {
        build(1, 0, n - 1, a);
    }

    void build(int v, int lo, int hi, const vector<long long>& a) {
        if (lo == hi) { sum[v] = a[lo]; return; }
        int mid = (lo + hi) / 2;
        build(2 * v, lo, mid, a);
        build(2 * v + 1, mid + 1, hi, a);
        sum[v] = sum[2 * v] + sum[2 * v + 1];
    }

    void apply(int v, int lo, int hi, long long add) {
        sum[v] += add * (hi - lo + 1);
        lazy[v] += add;
    }

    void push(int v, int lo, int hi) {
        if (!lazy[v]) return;
        int mid = (lo + hi) / 2;
        apply(2 * v, lo, mid, lazy[v]);
        apply(2 * v + 1, mid + 1, hi, lazy[v]);
        lazy[v] = 0;
    }

    void add(int l, int r, long long x) { add(1, 0, n - 1, l, r, x); }
    void add(int v, int lo, int hi, int l, int r, long long x) {
        if (r < lo || hi < l) return;
        if (l <= lo && hi <= r) { apply(v, lo, hi, x); return; }
        push(v, lo, hi);
        int mid = (lo + hi) / 2;
        add(2 * v, lo, mid, l, r, x);
        add(2 * v + 1, mid + 1, hi, l, r, x);
        sum[v] = sum[2 * v] + sum[2 * v + 1];
    }

    long long query(int l, int r) { return query(1, 0, n - 1, l, r); }
    long long query(int v, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r) return sum[v];
        push(v, lo, hi);
        int mid = (lo + hi) / 2;
        return query(2 * v, lo, mid, l, r) + query(2 * v + 1, mid + 1, hi, l, r);
    }
};
:::

::: note
**Pitfalls.** Allocate 4n nodes; 2n is not enough for a recursive tree when n is not a power of two. Push pending updates before descending in both update and query. For min or max trees, the neutral value for an out-of-range node is +infinity or -infinity, not 0.
:::

::: quiz
question: Why does a range query on a segment tree touch only O(log n) nodes?
- Because the tree is stored in an array
- Because at each level at most two nodes partly overlap the query range *
- Because lazy propagation skips most nodes
- Because queries only visit leaves
explanation: Nodes fully inside the range return immediately and nodes fully outside are skipped. Only the two boundary paths continue down, giving at most about 4 log n visited nodes.
:::

::: problems
range-sum-query-mutable
my-calendar-iii
falling-squares
count-of-range-sum
:::

# sparse-table | Sparse Table | O(1) range minimum queries on an array that never changes.
difficulty: ADVANCED
minutes: 25
objective: Precompute answers for every power-of-two window
objective: Answer idempotent range queries in O(1) with two overlapping windows

::: markdown
## When to use it

If the array is **static** and you need many range-minimum, range-maximum or range-gcd queries, a **sparse table** answers each in **O(1)** after O(n log n) preprocessing. With updates, use a segment tree instead.

## How it works

`st[k][i]` holds the minimum of the window of length 2^k starting at i, built from two windows of length 2^(k-1):

`st[k][i] = min(st[k-1][i], st[k-1][i + 2^(k-1)])`

To query [l, r], let k be the largest power with 2^k ≤ r - l + 1. The windows starting at l and ending at r both have length 2^k and together cover [l, r]. They may overlap, which is fine for **idempotent** operations like min, max and gcd (min(x, x) = x), but not for sums.
:::

::: code cpp | Sparse table for range minimum
#include <algorithm>
#include <vector>
using namespace std;

struct SparseTable {
    vector<vector<int>> st;
    vector<int> lg;

    explicit SparseTable(const vector<int>& a) {
        int n = a.size();
        lg.assign(n + 1, 0);
        for (int i = 2; i <= n; ++i) lg[i] = lg[i / 2] + 1;
        st.assign(lg[n] + 1, vector<int>(n));
        st[0] = a;
        for (int k = 1; k <= lg[n]; ++k)
            for (int i = 0; i + (1 << k) <= n; ++i)
                st[k][i] = min(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);
    }

    int query(int l, int r) const {  // inclusive
        int k = lg[r - l + 1];
        return min(st[k][l], st[k][r - (1 << k) + 1]);
    }
};
:::

::: note
**Pitfalls.** The two-window trick double counts, so it is wrong for sums. Precompute the log table instead of calling `log2` on floats, which can round incorrectly at exact powers of two.
:::

::: quiz
question: Which of these can a sparse table answer in O(1) per query?
- Range sum
- Range minimum *
- Range product
- Number of distinct values in a range
explanation: The O(1) query overlaps two windows, which only works when counting an element twice does not change the answer. Min is idempotent; sum and product are not.
:::

::: problems
longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit
maximum-number-of-robots-within-budget
:::

# monotonic-stack | Monotonic Stack and Deque | Next greater element, histograms and sliding-window extremes in O(n).
difficulty: ADVANCED
minutes: 35
objective: Find the next greater or smaller element for every index in one pass
objective: Compute each element's span as the minimum of subarrays
objective: Keep a sliding-window maximum with a monotonic deque

::: markdown
## When to use it

Whenever a brute force compares each element with "the nearest element to the left or right that is bigger or smaller", a **monotonic stack** brings it from O(n²) to **O(n)**. Signals:

- next greater element, daily temperatures, stock span,
- largest rectangle in a histogram, maximal rectangle,
- sum over all subarrays of their minimum or maximum.

A **monotonic deque** extends the idea to a moving window: the front always holds the window's maximum.

## How it works

Keep indices on a stack whose values are increasing (or decreasing). When a new value breaks the order, pop: for each popped index, the new value is its *next smaller (or greater) element*, and the new top of the stack is its *previous* one. Each index is pushed and popped once, so the whole scan is linear.
:::

::: code cpp | Next greater element and sliding-window maximum
#include <deque>
#include <stack>
#include <vector>
using namespace std;

// result[i] = index of the next element greater than a[i], or -1.
vector<int> nextGreater(const vector<int>& a) {
    int n = a.size();
    vector<int> result(n, -1);
    stack<int> st;  // indices with decreasing values
    for (int i = 0; i < n; ++i) {
        while (!st.empty() && a[st.top()] < a[i]) {
            result[st.top()] = i;
            st.pop();
        }
        st.push(i);
    }
    return result;
}

// Maximum of every window of size k.
vector<int> slidingMax(const vector<int>& a, int k) {
    deque<int> dq;  // indices, values decreasing from front to back
    vector<int> out;
    for (int i = 0; i < (int)a.size(); ++i) {
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
        dq.push_back(i);
        if (dq.front() <= i - k) dq.pop_front();  // left the window
        if (i >= k - 1) out.push_back(a[dq.front()]);
    }
    return out;
}
:::

::: note
**Pitfalls.** Store indices, not values, so you can compute widths and expire old entries. With duplicates, use strict comparison on one side and non-strict on the other (for example, previous smaller-or-equal and next strictly smaller), or equal elements get counted twice in "sum of subarray minimums".
:::

::: quiz
question: For the histogram heights [2, 1, 5, 6, 2, 3], what is the area of the largest rectangle?
- 6
- 10 *
- 12
- 8
explanation: Bars 5 and 6 at indices 2 and 3 form a rectangle of height 5 and width 2, area 10. The monotonic stack finds each bar's left and right limits to check every such rectangle in O(n).
:::

::: problems
daily-temperatures
largest-rectangle-in-histogram
sliding-window-maximum
sum-of-subarray-minimums
shortest-subarray-with-sum-at-least-k
:::

# string-matching | String Matching: KMP and Z | Find patterns in O(n + m) using the prefix function or the Z-array.
difficulty: ADVANCED
minutes: 40
objective: Compute the prefix function and use it for pattern search
objective: Compute the Z-array and read matches from pattern + '#' + text
objective: Use the prefix function to find a string's shortest period

::: markdown
## When to use it

Naive search compares the pattern at every text position: O(n·m) in the worst case. **KMP** and the **Z-algorithm** guarantee **O(n + m)** and also answer structural questions:

- the longest prefix that is also a suffix (shortest palindrome, repeated substring pattern),
- for every position, how long a prefix of the string starts there (Z-array).

## Prefix function (KMP)

`pi[i]` is the length of the longest proper prefix of `s[0..i]` that is also a suffix of it. When a character fails to match, KMP falls back to `pi[j-1]` instead of restarting, so the text pointer never moves backwards.

A string of length n has period `n - pi[n-1]`; if that divides n, the string is a repetition of its first `n - pi[n-1]` characters.

## Z-function

`z[i]` is the length of the longest substring starting at i that matches a prefix of the string. Searching for a pattern p in text t: compute the Z-array of `p + '#' + t` and report every position where `z[i] == |p|`.
:::

::: code cpp | Prefix function, KMP search and Z-function
#include <algorithm>
#include <string>
#include <vector>
using namespace std;

vector<int> prefixFunction(const string& s) {
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; ++i) {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j]) j = pi[j - 1];
        if (s[i] == s[j]) ++j;
        pi[i] = j;
    }
    return pi;
}

// Start indices of every occurrence of p in t.
vector<int> kmpSearch(const string& t, const string& p) {
    vector<int> pi = prefixFunction(p), found;
    for (int i = 0, j = 0; i < (int)t.size(); ++i) {
        while (j > 0 && t[i] != p[j]) j = pi[j - 1];
        if (t[i] == p[j]) ++j;
        if (j == (int)p.size()) {
            found.push_back(i - j + 1);
            j = pi[j - 1];
        }
    }
    return found;
}

vector<int> zFunction(const string& s) {
    int n = s.size();
    vector<int> z(n, 0);
    for (int i = 1, l = 0, r = 0; i < n; ++i) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) ++z[i];
        if (i + z[i] > r) l = i, r = i + z[i];
    }
    return z;
}
:::

::: note
**Pitfalls.** The separator in `p + '#' + t` must be a character that appears in neither string. In KMP, after a full match set `j = pi[j-1]` to allow overlapping matches; resetting to 0 misses them.
:::

::: quiz
question: For s = "abab", what is the prefix function?
- [0, 0, 1, 2] *
- [0, 1, 2, 3]
- [0, 0, 0, 2]
- [1, 0, 1, 2]
explanation: "a" has no proper border, "ab" has none, "aba" has border "a" (1), and "abab" has border "ab" (2). Its period is 4 - 2 = 2, so it is "ab" repeated.
:::

::: problems
find-the-index-of-the-first-occurrence-in-a-string
repeated-substring-pattern
shortest-palindrome
sum-of-scores-of-built-strings
:::

# rolling-hash | Rolling Hash | Compare substrings in O(1) after O(n) preprocessing.
difficulty: ADVANCED
minutes: 30
objective: Build prefix hashes and extract any substring's hash in O(1)
objective: Combine hashing with binary search on the answer length
objective: Reduce collision risk with large moduli or double hashing

::: markdown
## When to use it

A **polynomial rolling hash** turns substring equality into integer equality. With prefix hashes you get any substring's hash in O(1), which makes these fast:

- longest duplicated substring (binary search the length, hash every window),
- counting distinct substrings of a fixed length,
- comparing two substrings in O(1) inside a larger algorithm.

## How it works

Treat the string as a number in base B modulo a large prime M:

`h[i+1] = h[i] * B + s[i]  (mod M)`

The hash of `s[l..r)` is `h[r] - h[l] * B^(r-l)`, taken mod M. Equal strings always have equal hashes; unequal strings collide with probability about 1/M per comparison, so use a 61-bit modulus (or two independent hashes) when there are many comparisons.
:::

::: code cpp | Rolling hash with a 2^61 - 1 modulus
#include <cstdint>
#include <string>
#include <vector>
using namespace std;

struct RollingHash {
    static constexpr uint64_t MOD = (1ULL << 61) - 1;
    static constexpr uint64_t BASE = 131;
    vector<uint64_t> h, pw;

    static uint64_t mul(uint64_t a, uint64_t b) {
        __uint128_t p = (__uint128_t)a * b;
        uint64_t r = (uint64_t)(p >> 61) + (uint64_t)(p & MOD);
        return r >= MOD ? r - MOD : r;
    }

    explicit RollingHash(const string& s) : h(s.size() + 1, 0), pw(s.size() + 1, 1) {
        for (size_t i = 0; i < s.size(); ++i) {
            h[i + 1] = (mul(h[i], BASE) + (unsigned char)s[i]) % MOD;
            pw[i + 1] = mul(pw[i], BASE);
        }
    }

    uint64_t get(int l, int r) const {  // hash of s[l, r)
        uint64_t sub = mul(h[l], pw[r - l]);
        return (h[r] + MOD - sub) % MOD;
    }
};
:::

::: note
**Pitfalls.** Avoid moduli like 2^64 with natural overflow: specially built strings (Thue-Morse) make them collide. Keep the base larger than the alphabet size. When a hash match decides correctness, confirm it with a direct comparison if the cost allows.
:::

::: quiz
question: How does binary search help find the longest duplicated substring with rolling hashes?
- It sorts all substrings by hash
- If a duplicate of length L exists, one of every shorter length also exists, so the answer is monotone in L *
- It halves the alphabet at each step
- It finds the hash collision with the smallest index
explanation: A repeated substring of length L contains repeated substrings of every shorter length. So "is there a duplicate of length L?" is monotone, and each check is an O(n) pass over window hashes.
:::

::: problems
repeated-dna-sequences
longest-duplicate-substring
distinct-echo-substrings
:::

# shortest-paths | Shortest Paths Beyond Dijkstra | 0-1 BFS, Bellman-Ford and Floyd-Warshall, and when each one fits.
difficulty: ADVANCED
minutes: 40
objective: Choose between BFS, 0-1 BFS, Dijkstra, Bellman-Ford and Floyd-Warshall
objective: Implement 0-1 BFS with a deque
objective: Use Bellman-Ford rounds to limit the number of edges in a path

::: markdown
## Choosing the algorithm

| Graph | Algorithm | Time |
|---|---|---|
| Unweighted | BFS | O(V + E) |
| Weights 0 or 1 | 0-1 BFS | O(V + E) |
| Non-negative weights | Dijkstra with a heap | O(E log V) |
| Negative weights, or "at most k edges" | Bellman-Ford | O(V · E) |
| All pairs, small V (≤ 400) | Floyd-Warshall | O(V³) |

**0-1 BFS** is Dijkstra where the priority queue becomes a deque: a 0-weight edge pushes to the front, a 1-weight edge to the back. Grid problems where some moves are free and others cost one are the classic case.

**Bellman-Ford** relaxes every edge V-1 times. Running exactly k+1 rounds, each from a copy of the previous distances, gives the cheapest path using at most k+1 edges (cheapest flights within k stops). A relaxation that still succeeds in round V means a negative cycle.

**Floyd-Warshall** tries every vertex k as an intermediate: `d[i][j] = min(d[i][j], d[i][k] + d[k][j])`, with k in the outer loop.
:::

::: code cpp | 0-1 BFS and k-limited Bellman-Ford
#include <climits>
#include <deque>
#include <vector>
using namespace std;

// adj[u] = list of (v, w) with w in {0, 1}
vector<int> zeroOneBfs(const vector<vector<pair<int, int>>>& adj, int src) {
    vector<int> dist(adj.size(), INT_MAX);
    deque<int> dq;
    dist[src] = 0;
    dq.push_back(src);
    while (!dq.empty()) {
        int u = dq.front();
        dq.pop_front();
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq.push_front(v);
                else dq.push_back(v);
            }
        }
    }
    return dist;
}

// Cheapest cost from src to dst using at most k + 1 edges, or -1.
int cheapestWithinK(int n, const vector<vector<int>>& edges, int src, int dst, int k) {
    const int INF = INT_MAX / 2;
    vector<int> dist(n, INF);
    dist[src] = 0;
    for (int round = 0; round <= k; ++round) {
        vector<int> next = dist;  // read only last round's values
        for (const auto& e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] + w < next[v]) next[v] = dist[u] + w;
        }
        dist = next;
    }
    return dist[dst] >= INF ? -1 : dist[dst];
}
:::

::: note
**Pitfalls.** Dijkstra is wrong with negative edges, even if there is no negative cycle. In k-limited Bellman-Ford, relaxing in place lets one round chain several edges; always relax from a copy. In Floyd-Warshall, k must be the outermost loop.
:::

::: quiz
question: A grid lets you follow the arrow in a cell for free or change it for cost 1. Which algorithm gives the minimum cost in linear time?
- Plain BFS
- 0-1 BFS *
- Floyd-Warshall
- Bellman-Ford
explanation: Every move costs 0 or 1, so a deque replaces the priority queue: free moves go to the front, paid moves to the back, and each cell settles in O(1) amortised time.
:::

::: problems
network-delay-time
cheapest-flights-within-k-stops
minimum-cost-to-make-at-least-one-valid-path-in-a-grid
find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance
:::

# topo-scc | Topological Sort, SCCs and Bridges | Order dependencies, find cycles and critical edges.
difficulty: ADVANCED
minutes: 40
objective: Topologically sort a DAG with Kahn's algorithm and detect cycles
objective: Find bridges with discovery times and low-links
objective: Know when strongly connected components are needed

::: markdown
## Topological sort

In a directed acyclic graph, a topological order lists every vertex before the ones it points to. **Kahn's algorithm** repeatedly removes vertices with in-degree 0. If fewer than V vertices come out, the graph has a cycle, which is how "can all courses be finished?" is answered.

For longest paths or earliest finish times in a DAG, process vertices in topological order and relax outgoing edges (parallel courses).

## Low-link: bridges and SCCs

A DFS assigns each vertex a discovery time `tin[u]` and a low-link `low[u]`: the smallest discovery time reachable from u's subtree using at most one back edge.

- A tree edge (u, v) is a **bridge** if `low[v] > tin[u]`: nothing below v climbs back above it, so removing the edge disconnects the graph.
- In a directed graph, the same idea (Tarjan) finds **strongly connected components**: groups where every vertex reaches every other. Collapsing them turns any directed graph into a DAG.
:::

::: code cpp | Kahn's algorithm and bridge finding
#include <algorithm>
#include <queue>
#include <vector>
using namespace std;

// Returns a topological order, or an empty vector if there is a cycle.
vector<int> topoSort(int n, const vector<vector<int>>& adj) {
    vector<int> indeg(n, 0), order;
    for (int u = 0; u < n; ++u)
        for (int v : adj[u]) ++indeg[v];
    queue<int> q;
    for (int u = 0; u < n; ++u)
        if (indeg[u] == 0) q.push(u);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);
        for (int v : adj[u])
            if (--indeg[v] == 0) q.push(v);
    }
    if ((int)order.size() != n) order.clear();
    return order;
}

struct Bridges {
    vector<vector<int>> adj;
    vector<int> tin, low;
    vector<vector<int>> bridges;
    int timer = 0;

    explicit Bridges(int n) : adj(n), tin(n, -1), low(n, 0) {}

    void addEdge(int u, int v) { adj[u].push_back(v); adj[v].push_back(u); }

    void dfs(int u, int parent) {
        tin[u] = low[u] = timer++;
        bool skippedParent = false;
        for (int v : adj[u]) {
            if (v == parent && !skippedParent) { skippedParent = true; continue; }  // allow parallel edges
            if (tin[v] != -1) {
                low[u] = min(low[u], tin[v]);  // back edge
            } else {
                dfs(v, u);
                low[u] = min(low[u], low[v]);
                if (low[v] > tin[u]) bridges.push_back({u, v});
            }
        }
    }

    vector<vector<int>> find() {
        for (int u = 0; u < (int)adj.size(); ++u)
            if (tin[u] == -1) dfs(u, -1);
        return bridges;
    }
};
:::

::: note
**Pitfalls.** Skip the parent edge only once, so a doubled edge between two vertices is correctly not a bridge. Recursive DFS can overflow the stack around 10^5 vertices deep; switch to an explicit stack for large path-like graphs.
:::

::: quiz
question: Kahn's algorithm outputs 7 of a graph's 9 vertices and then the queue is empty. What does that mean?
- The graph has two connected components
- The remaining 2 vertices lie on or behind a cycle *
- The graph is a tree
- The order is still valid for the remaining vertices
explanation: A vertex never reaches in-degree 0 only if some predecessor is never removed, which happens exactly when there is a cycle. So the graph is not a DAG.
:::

::: problems
course-schedule-ii
parallel-courses-iii
sort-items-by-groups-respecting-dependencies
critical-connections-in-a-network
:::

# mst | Minimum Spanning Trees | Connect everything at minimum total cost with Kruskal or Prim.
difficulty: ADVANCED
minutes: 30
objective: Implement Kruskal's algorithm on top of DSU
objective: Implement Prim's algorithm for dense graphs
objective: Use the cut property to reason about which edges belong to an MST

::: markdown
## When to use it

A **minimum spanning tree** connects all V vertices with V-1 edges of minimum total weight. Signals: "connect all points or cities at minimum cost", "minimum wire length", and questions about which edges are in every MST.

## Kruskal

Sort edges by weight and add each one whose endpoints are in different components (checked with DSU). O(E log E). Best for sparse edge lists.

## Prim

Grow one tree from a start vertex, always adding the cheapest edge leaving it. With an O(V²) array scan instead of a heap, Prim is the best choice for **complete graphs** such as "connect all points" where E is about V²/2.

## Why greedy works

**Cut property:** for any split of the vertices into two groups, the cheapest edge crossing the split belongs to some MST. Both algorithms only ever add such an edge.
:::

::: code cpp | Kruskal with DSU, and O(V²) Prim for dense graphs
#include <algorithm>
#include <array>
#include <climits>
#include <numeric>
#include <vector>
using namespace std;

struct DSU {
    vector<int> p;
    explicit DSU(int n) : p(n) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
    bool unite(int a, int b) { a = find(a), b = find(b); if (a == b) return false; p[a] = b; return true; }
};

// edges: {weight, u, v}
long long kruskal(int n, vector<array<int, 3>> edges) {
    sort(edges.begin(), edges.end());
    DSU dsu(n);
    long long total = 0;
    int used = 0;
    for (auto [w, u, v] : edges)
        if (dsu.unite(u, v)) { total += w; if (++used == n - 1) break; }
    return used == n - 1 ? total : -1;  // -1: graph is disconnected
}

// Dense graph given by a cost function, e.g. Manhattan distance between points.
template <class Cost>
long long primDense(int n, Cost cost) {
    vector<long long> best(n, LLONG_MAX);
    vector<bool> inTree(n, false);
    best[0] = 0;
    long long total = 0;
    for (int it = 0; it < n; ++it) {
        int u = -1;
        for (int v = 0; v < n; ++v)
            if (!inTree[v] && (u == -1 || best[v] < best[u])) u = v;
        inTree[u] = true;
        total += best[u];
        for (int v = 0; v < n; ++v)
            if (!inTree[v]) best[v] = min(best[v], (long long)cost(u, v));
    }
    return total;
}
:::

::: note
**Pitfalls.** If the graph may be disconnected, check that V-1 edges were used. Storing all V² edges of a complete graph for Kruskal can exceed memory; Prim's array version needs only O(V).
:::

::: quiz
question: All edge weights in a connected graph are distinct. How many minimum spanning trees does it have?
- Exactly one *
- At least two
- One per vertex
- It depends on the start vertex
explanation: With distinct weights, the cut property always picks a unique cheapest crossing edge, so the MST is unique. Ties are what allow several MSTs.
:::

::: problems
min-cost-to-connect-all-points
find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree
:::

# lca | Lowest Common Ancestor | Binary lifting for k-th ancestors and LCA in O(log n).
difficulty: ADVANCED
minutes: 35
objective: Build a binary lifting table of 2^j-th ancestors
objective: Answer k-th ancestor and LCA queries in O(log n)
objective: Compute path lengths in a tree with depth and LCA

::: markdown
## When to use it

For a single LCA question, a recursive DFS is enough. When there are **many queries** on the same tree, preprocess with **binary lifting**:

- k-th ancestor of a node,
- LCA of two nodes,
- distance between nodes: `depth[u] + depth[v] - 2 · depth[lca]`,
- aggregates along a path (max edge weight), stored alongside the table.

## How it works

`up[j][v]` is the 2^j-th ancestor of v, built as `up[j][v] = up[j-1][ up[j-1][v] ]`. To move up k levels, take the jumps for each set bit of k.

For LCA(u, v): lift the deeper node to the same depth, then for j from high to low, jump both nodes whenever their 2^j-th ancestors differ. They end as children of the LCA.
:::

::: code cpp | Binary lifting
#include <utility>
#include <vector>
using namespace std;

struct LCA {
    int LOG;
    vector<vector<int>> up;
    vector<int> depth;

    LCA(int n, const vector<vector<int>>& children, int root) : depth(n, 0) {
        LOG = 1;
        while ((1 << LOG) < n) ++LOG;
        up.assign(LOG, vector<int>(n, root));
        // Iterative DFS: set the direct parent and depth of every node.
        vector<int> stack = {root};
        while (!stack.empty()) {
            int u = stack.back();
            stack.pop_back();
            for (int c : children[u]) {
                up[0][c] = u;
                depth[c] = depth[u] + 1;
                stack.push_back(c);
            }
        }
        for (int j = 1; j < LOG; ++j)
            for (int v = 0; v < n; ++v) up[j][v] = up[j - 1][up[j - 1][v]];
    }

    int kthAncestor(int v, int k) const {  // -1 if it does not exist
        if (k > depth[v]) return -1;
        for (int j = 0; j < LOG; ++j)
            if (k >> j & 1) v = up[j][v];
        return v;
    }

    int lca(int u, int v) const {
        if (depth[u] < depth[v]) swap(u, v);
        u = kthAncestor(u, depth[u] - depth[v]);
        if (u == v) return u;
        for (int j = LOG - 1; j >= 0; --j)
            if (up[j][u] != up[j][v]) u = up[j][u], v = up[j][v];
        return up[0][u];
    }
};
:::

::: note
**Pitfalls.** Point the root's ancestors at the root itself (as above) so jumps past the top stay inside the table. Check `k > depth[v]` before lifting, or a k-th ancestor query returns the root instead of "none".
:::

::: quiz
question: How many jumps does binary lifting use to move a node up 13 levels? (13 = 1101 in binary.)
- 13
- 3 *
- 4
- 1
explanation: Each set bit of 13 is one jump: 8, 4 and 1 levels. That is why any lift takes at most log n jumps.
:::

::: problems
lowest-common-ancestor-of-a-binary-tree
kth-ancestor-of-a-tree-node
minimum-edge-weight-equilibrium-queries-in-a-tree
:::

# bitmask-dp | Bitmask DP | Exact answers over all subsets when n is at most about 20.
difficulty: ADVANCED
minutes: 40
objective: Recognise problems where the state is "which items are used"
objective: Write DP over subsets with bit operations
objective: Solve travelling-salesman-style problems in O(2^n · n²)

::: markdown
## When to use it

If the constraints say **n ≤ 20** (sometimes 16 or 24), the intended solution is usually exponential in n but polynomial in everything else. Encode the set of used items as an integer mask, where bit i means item i is used.

Typical states:

- `dp[mask]`: best result using exactly the items in mask (assignment, partition into groups),
- `dp[mask][last]`: best path visiting the items in mask and ending at `last` (travelling salesman, shortest superstring, visiting all nodes).

## Bit operations you need

- test item i: `mask >> i & 1`
- add item i: `mask | (1 << i)`
- all items: `(1 << n) - 1`
- count used: `__builtin_popcount(mask)`
- iterate submasks: `for (int s = mask; s; s = (s - 1) & mask)`
:::

::: code cpp | Shortest Hamiltonian path (TSP style)
#include <algorithm>
#include <climits>
#include <vector>
using namespace std;

// dist[i][j]: cost from i to j. Minimum cost to visit every node once, starting anywhere.
int shortestHamiltonianPath(const vector<vector<int>>& dist) {
    int n = dist.size(), FULL = (1 << n) - 1;
    const int INF = INT_MAX / 2;
    vector<vector<int>> dp(1 << n, vector<int>(n, INF));
    for (int i = 0; i < n; ++i) dp[1 << i][i] = 0;

    for (int mask = 1; mask <= FULL; ++mask)
        for (int last = 0; last < n; ++last) {
            if (!(mask >> last & 1) || dp[mask][last] >= INF) continue;
            for (int next = 0; next < n; ++next) {
                if (mask >> next & 1) continue;
                int nm = mask | (1 << next);
                dp[nm][next] = min(dp[nm][next], dp[mask][last] + dist[last][next]);
            }
        }
    return *min_element(dp[FULL].begin(), dp[FULL].end());
}
:::

::: note
**Pitfalls.** Memory is 2^n · n entries: at n = 20 that is about 20 million ints (80 MB), so check limits and drop the second dimension when you can. Process masks in increasing order: adding a bit always makes the mask larger, so every state's sources are ready.
:::

::: quiz
question: Iterating over every submask of every mask of n items, using s = (s - 1) & mask, takes how long in total?
- O(4^n)
- O(3^n) *
- O(2^n · n)
- O(n!)
explanation: Each item is in one of three states (not in mask, in mask but not in submask, in both), so there are 3^n (mask, submask) pairs.
:::

::: problems
partition-to-k-equal-sum-subsets
shortest-path-visiting-all-nodes
smallest-sufficient-team
find-the-shortest-superstring
:::

# tree-dp | DP on Trees and Rerooting | Combine children's answers bottom-up, then answer for every root.
difficulty: ADVANCED
minutes: 40
objective: Define DP states per node and combine children in post-order
objective: Track "take or skip this node" states
objective: Reroot to get the answer for every node as root in O(n)

::: markdown
## When to use it

On a tree, a node's answer usually depends only on its children's answers. Compute them in **post-order** (children first). Common shapes:

- **take or skip**: `dp[v][0]` and `dp[v][1]` for "v not chosen" and "v chosen" (house robber III, maximum independent set),
- **best downward path**: a node returns its best single branch upward, while the answer considers joining two branches at the node (binary tree maximum path sum, diameter),
- **covering states**: several states per node for "covered by a child", "has a camera", "not covered" (binary tree cameras).

## Rerooting

When the question asks for an answer **for every node as root**, do two passes. The first computes subtree results from an arbitrary root. The second pushes the parent's "rest of the tree" result down, so each child gets its full answer in O(1). Total O(n) instead of O(n²).

For sum of distances: `ans[child] = ans[parent] - size[child] + (n - size[child])`, since moving the root one edge closer to `size[child]` nodes and further from the rest.
:::

::: code cpp | Sum of distances from every node (rerooting)
#include <vector>
using namespace std;

vector<long long> sumOfDistances(int n, const vector<vector<int>>& adj) {
    vector<long long> ans(n, 0);
    vector<int> size(n, 1), parent(n, -1), order;
    order.reserve(n);

    // Iterative DFS from node 0 to get a parent array and a pre-order.
    vector<int> stack = {0};
    vector<bool> seen(n, false);
    seen[0] = true;
    while (!stack.empty()) {
        int u = stack.back();
        stack.pop_back();
        order.push_back(u);
        for (int v : adj[u])
            if (!seen[v]) { seen[v] = true; parent[v] = u; stack.push_back(v); }
    }

    // Pass 1 (children before parents): subtree sizes and the root's answer.
    vector<long long> down(n, 0);  // sum of distances from u to its subtree
    for (int i = n - 1; i > 0; --i) {
        int u = order[i], p = parent[u];
        size[p] += size[u];
        down[p] += down[u] + size[u];
    }
    ans[0] = down[0];

    // Pass 2 (parents before children): reroot along each edge.
    for (int i = 1; i < n; ++i) {
        int u = order[i], p = parent[u];
        ans[u] = ans[p] - size[u] + (n - size[u]);
    }
    return ans;
}
:::

::: note
**Pitfalls.** Recursion on a path-shaped tree of 10^5 nodes can overflow the stack; an explicit order array as above avoids it. When a node returns a value upward, return only one branch, but update the global answer with both branches.
:::

::: quiz
question: In binary tree maximum path sum, why does each node return max(left, right) + value upward rather than left + right + value?
- To avoid negative numbers
- A path passing through the parent can extend only one branch of the child *
- Because the root must be included
- To keep the recursion O(n)
explanation: A path cannot fork. left + right + value is a complete path that turns at this node, so it updates the global answer, but only one branch can continue upward to the parent.
:::

::: problems
binary-tree-maximum-path-sum
house-robber-iii
binary-tree-cameras
sum-of-distances-in-tree
:::

# digit-dp | Digit DP | Count numbers up to N with a digit property, one digit at a time.
difficulty: ADVANCED
minutes: 40
objective: Recognise counting problems over the range [0, N]
objective: Track the tight flag and a small property state per digit position
objective: Answer [L, R] as count(R) - count(L - 1)

::: markdown
## When to use it

"How many integers in [1, N] (N up to 10^18) have property P?" where P depends on the digits: counting a digit, no repeated digits, digit sum, digits from a set. Enumerating is impossible; **digit DP** walks the digits of N from most significant to least and counts in O(digits · states · 10).

## The state

- `pos`: which digit we are filling,
- `tight`: whether every digit so far equals N's digit (if so, the current digit is capped at N's digit; otherwise it can be 0 to 9),
- `started`: whether a non-zero digit has appeared, so leading zeros are not counted as digits,
- the property's own state: a count, a sum, or a bitmask of used digits.

Memoise only states with `tight == false`: the tight path is a single chain and gains nothing from caching.

For a range [L, R], compute `count(R) - count(L - 1)`.
:::

::: code cpp | Count of digit '1' in all numbers from 1 to n
#include <cstring>
#include <string>
using namespace std;

// Classic digit DP: total number of 1 digits written in 1..n.
struct CountOnes {
    string digits;
    long long memo[20][20];  // [pos][onesSoFar], valid when not tight

    long long dfs(int pos, int ones, bool tight) {
        if (pos == (int)digits.size()) return ones;
        if (!tight && memo[pos][ones] != -1) return memo[pos][ones];
        int limit = tight ? digits[pos] - '0' : 9;
        long long total = 0;
        for (int d = 0; d <= limit; ++d)
            total += dfs(pos + 1, ones + (d == 1), tight && d == limit);
        if (!tight) memo[pos][ones] = total;
        return total;
    }

    long long count(long long n) {
        if (n <= 0) return 0;
        digits = to_string(n);
        memset(memo, -1, sizeof memo);
        return dfs(0, 0, true);
    }
};
:::

::: note
**Pitfalls.** Reset the memo for every new N: states depend on the digit string's length. Leading zeros matter for properties like "no repeated digits" (0 must not count as used while the number has not started), but not for counting the digit 1, which is why this example has no `started` flag.
:::

::: quiz
question: Why is the tight state usually left out of the memo?
- It does not affect the answer
- Only one tight path exists, so caching it saves nothing *
- It would make the memo too large
- Tight states are always zero
explanation: Tight means the prefix equals N's prefix, and there is exactly one such prefix per position. All the reuse comes from non-tight states, which are shared across many prefixes.
:::

::: problems
number-of-digit-one
numbers-at-most-n-given-digit-set
count-special-integers
numbers-with-repeated-digits
:::
