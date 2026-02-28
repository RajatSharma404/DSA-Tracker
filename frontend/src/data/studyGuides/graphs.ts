import { StudyGuide } from './types';

export const graphsGuide: StudyGuide = {
  topicName: 'Graphs',
  emoji: '🕸️',
  tagline: 'Nodes + edges = model anything. BFS, DFS, and shortest paths.',
  prerequisite: 'Trees, Stack, Hashing',
  sections: [
    { title: 'Graph Fundamentals', icon: '🧠', content: `A graph is nodes (vertices) connected by edges. Unlike trees, graphs can have cycles.

Representations:
  Adjacency List (preferred):
  const graph = { 0: [1,2], 1: [0,3], 2: [0], 3: [1] };
  // or: const graph = new Map();

  Adjacency Matrix:
  const matrix = [[0,1,1,0],
                   [1,0,0,1],
                   [1,0,0,0],
                   [0,1,0,0]];

Use adjacency list for sparse graphs (most interview problems).
Use matrix when you need O(1) edge lookup or the graph is dense.

Types: Directed/Undirected, Weighted/Unweighted, Cyclic/Acyclic (DAG)` },
    { title: 'BFS — Breadth-First Search', icon: '🌊', content: `BFS explores level by level using a QUEUE. Think: ripple effect.

  function bfs(graph, start) {
    const visited = new Set([start]);
    const queue = [start];
    while (queue.length) {
      const node = queue.shift();
      for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }

BFS guarantees SHORTEST PATH in unweighted graphs.
Use for: shortest path, level-order, "minimum steps to reach".` },
    { title: 'DFS — Depth-First Search', icon: '🏊', content: `DFS goes as deep as possible before backtracking. Uses STACK (or recursion).

  function dfs(graph, node, visited = new Set()) {
    visited.add(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        dfs(graph, neighbor, visited);
      }
    }
  }

DFS is better for: path finding, cycle detection, topological sort, connected components.

Grid DFS (island problems):
  function dfs(grid, r, c) {
    if (r<0 || r>=grid.length || c<0 || c>=grid[0].length) return;
    if (grid[r][c] !== '1') return;
    grid[r][c] = '0'; // mark visited
    dfs(grid, r+1, c); dfs(grid, r-1, c);
    dfs(grid, r, c+1); dfs(grid, r, c-1);
  }` },
    { title: 'Topological Sort & Cycle Detection', icon: '📊', content: `Topological Sort: order nodes so all edges go forward. Only works on DAGs.

  Kahn's Algorithm (BFS-based):
  1. Count in-degrees for all nodes
  2. Add nodes with in-degree 0 to queue
  3. Process queue: for each node, reduce neighbors' in-degrees
  4. If a neighbor's in-degree becomes 0, add to queue
  5. If result.length < numNodes → CYCLE EXISTS

Used for: course prerequisites, build order, task scheduling.` }
  ],
  patternTriggers: [
    { trigger: '"Shortest path" (unweighted)', pattern: 'BFS' },
    { trigger: '"Number of islands" or "connected components"', pattern: 'DFS/BFS on grid' },
    { trigger: '"Course schedule" or "build order"', pattern: 'Topological sort' },
    { trigger: '"Can reach from A to B?"', pattern: 'BFS or DFS' },
    { trigger: '"Minimum steps/moves"', pattern: 'BFS (level = steps)' },
    { trigger: '"Clone graph" or "deep copy"', pattern: 'BFS/DFS + HashMap (old→new)' },
  ],
  complexityTable: [
    { operation: 'BFS / DFS', time: 'O(V + E)', space: 'O(V)' },
    { operation: 'Topological Sort', time: 'O(V + E)', space: 'O(V)' },
    { operation: 'Dijkstra (weighted)', time: 'O((V+E) log V)', space: 'O(V)' },
  ],
  codeExample: {
    title: 'Number of Islands',
    code: `function numIslands(grid) {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') {
        count++;
        sink(grid, r, c);
      }
    }
  }
  return count;
}
function sink(grid, r, c) {
  if (r<0||r>=grid.length||c<0||c>=grid[0].length) return;
  if (grid[r][c] !== '1') return;
  grid[r][c] = '0';
  sink(grid,r+1,c); sink(grid,r-1,c);
  sink(grid,r,c+1); sink(grid,r,c-1);
}`,
    walkthrough: `Grid:  1 1 0 0 0
       1 1 0 0 0
       0 0 1 0 0
       0 0 0 1 1

(0,0)='1' → count=1, DFS sinks all connected 1s → sinks (0,0)(0,1)(1,0)(1,1)
(2,2)='1' → count=2, DFS sinks (2,2)
(3,3)='1' → count=3, DFS sinks (3,3)(3,4)
Answer: 3 islands ✅`
  },
  keyTakeaways: [
    'BFS = queue = shortest path. DFS = stack/recursion = exploration.',
    'For grid problems: treat each cell as a node, 4-directional neighbors as edges',
    'Always track visited nodes to avoid infinite loops',
    'Topological sort = BFS + in-degree counting for DAGs',
    'Time complexity is always O(V + E) for graph traversal'
  ]
};
