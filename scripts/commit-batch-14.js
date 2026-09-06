const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 56,
    title: 'Merge Intervals',
    folder: '01-arrays-and-hashing',
    fileName: '0056-merge-intervals.cpp',
    difficulty: 'Medium',
    topic: 'Arrays & Intervals / Sorting',
    time: 'O(n log n)',
    space: 'O(n)',
    code: `/**
 * Problem: 56. Merge Intervals
 * Difficulty: Medium
 * Topic: Arrays & Intervals / Sorting
 * LeetCode Link: https://leetcode.com/problems/merge-intervals/
 * 
 * Complexity:
 * - Time: O(n log n) due to sorting
 * - Space: O(n) for the output list
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if (intervals.empty()) return {};

        sort(intervals.begin(), intervals.end());

        vector<vector<int>> merged;
        merged.push_back(intervals[0]);

        for (int i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] <= merged.back()[1]) {
                merged.back()[1] = max(merged.back()[1], intervals[i][1]);
            } else {
                merged.push_back(intervals[i]);
            }
        }

        return merged;
    }
};
`
  },
  {
    id: 57,
    title: 'Insert Interval',
    folder: '01-arrays-and-hashing',
    fileName: '0057-insert-interval.cpp',
    difficulty: 'Medium',
    topic: 'Arrays & Intervals',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 57. Insert Interval
 * Difficulty: Medium
 * Topic: Arrays & Intervals
 * LeetCode Link: https://leetcode.com/problems/insert-interval/
 * 
 * Complexity:
 * - Time: O(n) linear scan
 * - Space: O(n) for result array
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> result;
        int i = 0;
        int n = intervals.size();

        // 1. Add all intervals ending before newInterval starts
        while (i < n && intervals[i][1] < newInterval[0]) {
            result.push_back(intervals[i]);
            i++;
        }

        // 2. Merge all overlapping intervals with newInterval
        while (i < n && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = min(newInterval[0], intervals[i][0]);
            newInterval[1] = max(newInterval[1], intervals[i][1]);
            i++;
        }
        result.push_back(newInterval);

        // 3. Add all remaining intervals starting after newInterval ends
        while (i < n) {
            result.push_back(intervals[i]);
            i++;
        }

        return result;
    }
};
`
  },
  {
    id: 252,
    title: 'Meeting Rooms',
    folder: '01-arrays-and-hashing',
    fileName: '0252-meeting-rooms.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Intervals / Sorting',
    time: 'O(n log n)',
    space: 'O(1)',
    code: `/**
 * Problem: 252. Meeting Rooms
 * Difficulty: Easy
 * Topic: Arrays & Intervals / Sorting
 * LeetCode Link: https://leetcode.com/problems/meeting-rooms/
 * 
 * Complexity:
 * - Time: O(n log n) for sorting
 * - Space: O(1) auxiliary
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    bool canAttendMeetings(vector<vector<int>>& intervals) {
        if (intervals.empty()) return true;

        sort(intervals.begin(), intervals.end());

        for (int i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] < intervals[i - 1][1]) {
                return false;
            }
        }

        return true;
    }
};
`
  },
  {
    id: 253,
    title: 'Meeting Rooms II',
    folder: '08-heap-priority-queue',
    fileName: '0253-meeting-rooms-ii.cpp',
    difficulty: 'Medium',
    topic: 'Heap / Priority Queue / Intervals',
    time: 'O(n log n)',
    space: 'O(n)',
    code: `/**
 * Problem: 253. Meeting Rooms II
 * Difficulty: Medium
 * Topic: Heap / Priority Queue / Intervals
 * LeetCode Link: https://leetcode.com/problems/meeting-rooms-ii/
 * 
 * Complexity:
 * - Time: O(n log n) sorting + heap operations
 * - Space: O(n) min-heap size
 */

#include <vector>
#include <queue>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        if (intervals.empty()) return 0;

        sort(intervals.begin(), intervals.end());

        priority_queue<int, vector<int>, greater<int>> minHeap;
        minHeap.push(intervals[0][1]);

        for (int i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] >= minHeap.top()) {
                minHeap.pop();
            }
            minHeap.push(intervals[i][1]);
        }

        return minHeap.size();
    }
};
`
  },
  {
    id: 435,
    title: 'Non-overlapping Intervals',
    folder: '12-greedy',
    fileName: '0435-non-overlapping-intervals.cpp',
    difficulty: 'Medium',
    topic: 'Greedy / Intervals',
    time: 'O(n log n)',
    space: 'O(1)',
    code: `/**
 * Problem: 435. Non-overlapping Intervals
 * Difficulty: Medium
 * Topic: Greedy / Intervals
 * LeetCode Link: https://leetcode.com/problems/non-overlapping-intervals/
 * 
 * Complexity:
 * - Time: O(n log n) sorting by end time
 * - Space: O(1) auxiliary
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        if (intervals.empty()) return 0;

        sort(intervals.begin(), intervals.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[1] < b[1];
        });

        int removals = 0;
        int prevEnd = intervals[0][1];

        for (size_t i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] < prevEnd) {
                removals++;
            } else {
                prevEnd = intervals[i][1];
            }
        }

        return removals;
    }
};
`
  },
  {
    id: 743,
    title: 'Network Delay Time',
    folder: '10-graphs',
    fileName: '0743-network-delay-time.cpp',
    difficulty: 'Medium',
    topic: 'Graphs / Dijkstra Algorithm',
    time: 'O(E log V)',
    space: 'O(V + E)',
    code: `/**
 * Problem: 743. Network Delay Time
 * Difficulty: Medium
 * Topic: Graphs / Dijkstra's Algorithm
 * LeetCode Link: https://leetcode.com/problems/network-delay-time/
 * 
 * Complexity:
 * - Time: O(E log V)
 * - Space: O(V + E) for adjacency list and distance array
 */

#include <vector>
#include <queue>
#include <climits>
#include <algorithm>

using namespace std;

class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int, int>>> adj(n + 1);
        for (const auto& edge : times) {
            adj[edge[0]].push_back({edge[1], edge[2]});
        }

        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
        vector<int> dist(n + 1, INT_MAX);

        dist[k] = 0;
        pq.push({0, k});

        while (!pq.empty()) {
            auto [d, u] = pq.top();
            pq.pop();

            if (d > dist[u]) continue;

            for (const auto& [v, weight] : adj[u]) {
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    pq.push({dist[v], v});
                }
            }
        }

        int maxTime = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == INT_MAX) return -1;
            maxTime = max(maxTime, dist[i]);
        }

        return maxTime;
    }
};
`
  },
  {
    id: 1584,
    title: 'Min Cost to Connect All Points',
    folder: '10-graphs',
    fileName: '1584-min-cost-to-connect-all-points.cpp',
    difficulty: 'Medium',
    topic: "Graphs / Prim's Algorithm (MST)",
    time: 'O(V^2)',
    space: 'O(V)',
    code: `/**
 * Problem: 1584. Min Cost to Connect All Points
 * Difficulty: Medium
 * Topic: Graphs / Prim's Algorithm (Minimum Spanning Tree)
 * LeetCode Link: https://leetcode.com/problems/min-cost-to-connect-all-points/
 * 
 * Complexity:
 * - Time: O(V^2) where V is the number of points (optimal for dense complete graph)
 * - Space: O(V) for tracking minimum distances
 */

#include <vector>
#include <cmath>
#include <climits>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size();
        vector<int> minDist(n, INT_MAX);
        vector<bool> inMST(n, false);

        minDist[0] = 0;
        int totalCost = 0;

        for (int step = 0; step < n; step++) {
            int u = -1;
            for (int i = 0; i < n; i++) {
                if (!inMST[i] && (u == -1 || minDist[i] < minDist[u])) {
                    u = i;
                }
            }

            inMST[u] = true;
            totalCost += minDist[u];

            for (int v = 0; v < n; v++) {
                if (!inMST[v]) {
                    int dist = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
                    minDist[v] = min(minDist[v], dist);
                }
            }
        }

        return totalCost;
    }
};
`
  },
  {
    id: 787,
    title: 'Cheapest Flights Within K Stops',
    folder: '10-graphs',
    fileName: '0787-cheapest-flights-within-k-stops.cpp',
    difficulty: 'Medium',
    topic: 'Graphs / Bellman-Ford (BFS)',
    time: 'O(K * E)',
    space: 'O(V)',
    code: `/**
 * Problem: 787. Cheapest Flights Within K Stops
 * Difficulty: Medium
 * Topic: Graphs / Bellman-Ford (BFS with Step Bound)
 * LeetCode Link: https://leetcode.com/problems/cheapest-flights-within-k-stops/
 * 
 * Complexity:
 * - Time: O(K * E)
 * - Space: O(V)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        const int INF = 1e9;
        vector<int> prices(n, INF);
        prices[src] = 0;

        for (int i = 0; i <= k; i++) {
            vector<int> tempPrices = prices;
            for (const auto& flight : flights) {
                int u = flight[0];
                int v = flight[1];
                int w = flight[2];

                if (prices[u] != INF && prices[u] + w < tempPrices[v]) {
                    tempPrices[v] = prices[u] + w;
                }
            }
            prices = tempPrices;
        }

        return prices[dst] == INF ? -1 : prices[dst];
    }
};
`
  },
  {
    id: 332,
    title: 'Reconstruct Itinerary',
    folder: '10-graphs',
    fileName: '0332-reconstruct-itinerary.cpp',
    difficulty: 'Hard',
    topic: 'Graphs / Hierholzer Eulerian Path',
    time: 'O(E log E)',
    space: 'O(V + E)',
    code: `/**
 * Problem: 332. Reconstruct Itinerary
 * Difficulty: Hard
 * Topic: Graphs / Hierholzer's Algorithm (Eulerian Path)
 * LeetCode Link: https://leetcode.com/problems/reconstruct-itinerary/
 * 
 * Complexity:
 * - Time: O(E log E) due to priority queue ordering of destinations
 * - Space: O(V + E) for adjacency list and recursion stack
 */

#include <vector>
#include <string>
#include <unordered_map>
#include <queue>
#include <algorithm>
#include <functional>

using namespace std;

class Solution {
public:
    vector<string> findItinerary(vector<vector<string>>& tickets) {
        unordered_map<string, priority_queue<string, vector<string>, greater<string>>> adj;
        for (const auto& ticket : tickets) {
            adj[ticket[0]].push(ticket[1]);
        }

        vector<string> route;
        function<void(const string&)> dfs = [&](const string& airport) {
            while (!adj[airport].empty()) {
                string next = adj[airport].top();
                adj[airport].pop();
                dfs(next);
            }
            route.push_back(airport);
        };

        dfs("JFK");
        reverse(route.begin(), route.end());
        return route;
    }
};
`
  },
  {
    id: 778,
    title: 'Swim in Rising Water',
    folder: '10-graphs',
    fileName: '0778-swim-in-rising-water.cpp',
    difficulty: 'Hard',
    topic: 'Graphs / Dijkstra / Priority Queue',
    time: 'O(N^2 log N)',
    space: 'O(N^2)',
    code: `/**
 * Problem: 778. Swim in Rising Water
 * Difficulty: Hard
 * Topic: Graphs / Dijkstra's Algorithm / Priority Queue
 * LeetCode Link: https://leetcode.com/problems/swim-in-rising-water/
 * 
 * Complexity:
 * - Time: O(N^2 log N) where N x N is the grid dimension
 * - Space: O(N^2) for distance matrix and priority queue
 */

#include <vector>
#include <queue>
#include <tuple>
#include <climits>
#include <algorithm>

using namespace std;

class Solution {
public:
    int swimInWater(vector<vector<int>>& grid) {
        int n = grid.size();
        vector<vector<int>> dist(n, vector<int>(n, INT_MAX));
        priority_queue<tuple<int, int, int>, vector<tuple<int, int, int>>, greater<tuple<int, int, int>>> pq;

        dist[0][0] = grid[0][0];
        pq.push({grid[0][0], 0, 0});

        int dirs[4][2] = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};

        while (!pq.empty()) {
            auto [t, r, c] = pq.top();
            pq.pop();

            if (r == n - 1 && c == n - 1) return t;
            if (t > dist[r][c]) continue;

            for (auto& d : dirs) {
                int nr = r + d[0];
                int nc = c + d[1];

                if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
                    int newT = max(t, grid[nr][nc]);
                    if (newT < dist[nr][nc]) {
                        dist[nr][nc] = newT;
                        pq.push({newT, nr, nc});
                    }
                }
            }
        }

        return 0;
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
  execSync(`git add "${relFilePath}" solutions/README.md scripts/commit-batch-14.js`, { cwd: rootDir });
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
