import { AlgorithmType, SupportedLanguage } from "../types";

export interface StarterPreset {
  id: AlgorithmType;
  title: string;
  category: string;
  defaultInput: {
    array: number[];
    target?: number;
    graph?: string;
  };
  codes: Record<SupportedLanguage, string>;
}

export const STARTER_PRESETS: StarterPreset[] = [
  {
    id: "bubble-sort",
    title: "Bubble Sort",
    category: "Sorting",
    defaultInput: {
      array: [5, 3, 8, 1, 9, 2, 4],
    },
    codes: {
      javascript: `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
      cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
    },
  },
  {
    id: "quick-sort",
    title: "Quick Sort (Lomuto)",
    category: "Sorting",
    defaultInput: {
      array: [7, 2, 1, 6, 8, 5, 3, 4],
    },
    codes: {
      javascript: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    let pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (arr[j] <= pivot) {
        i++;
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    let pi = i + 1;

    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}`,
      python: `def quick_sort(arr, low=0, high=None):
    if high is None: high = len(arr) - 1
    if low < high:
        pivot = arr[high]
        i = low - 1
        for j in range(low, high):
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        pi = i + 1
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr`,
      cpp: `void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                swap(arr[i], arr[j]);
            }
        }
        swap(arr[i + 1], arr[high]);
        int pi = i + 1;
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
    },
  },
  {
    id: "merge-sort",
    title: "Merge Sort",
    category: "Sorting",
    defaultInput: {
      array: [9, 3, 7, 5, 6, 4, 8, 2],
    },
    codes: {
      javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  let mid = Math.floor(arr.length / 2);
  let left = mergeSort(arr.slice(0, mid));
  let right = mergeSort(arr.slice(mid));
  
  let merged = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      merged.push(left[i++]);
    } else {
      merged.push(right[j++]);
    }
  }
  return merged.concat(left.slice(i)).concat(right.slice(j));
}`,
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    return merged + left[i:] + right[j:]`,
      cpp: `vector<int> mergeSort(vector<int>& arr) {
    if (arr.size() <= 1) return arr;
    int mid = arr.size() / 2;
    vector<int> left(arr.begin(), arr.begin() + mid);
    vector<int> right(arr.begin() + mid, arr.end());
    left = mergeSort(left);
    right = mergeSort(right);
    vector<int> res;
    int i = 0, j = 0;
    while(i < left.size() && j < right.size()) {
        if(left[i] <= right[j]) res.push_back(left[i++]);
        else res.push_back(right[j++]);
    }
    while(i < left.size()) res.push_back(left[i++]);
    while(j < right.size()) res.push_back(right[j++]);
    return res;
}`,
    },
  },
  {
    id: "binary-search",
    title: "Binary Search",
    category: "Searching",
    defaultInput: {
      array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
      target: 23,
    },
    codes: {
      javascript: `function binarySearch(nums, target) {
  let low = 0;
  let high = nums.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) {
      return mid; // Target found!
    }
    if (nums[mid] < target) {
      low = mid + 1; // Discard left half
    } else {
      high = mid - 1; // Discard right half
    }
  }
  return -1;
}`,
      python: `def binary_search(nums, target):
    low = 0
    high = len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
      cpp: `int binarySearch(vector<int>& nums, int target) {
    int low = 0, high = nums.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    },
  },
  {
    id: "two-pointers",
    title: "Two Pointers (Two Sum Sorted)",
    category: "Arrays",
    defaultInput: {
      array: [2, 7, 11, 15, 19, 23, 29],
      target: 26,
    },
    codes: {
      javascript: `function twoSumSorted(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    let sum = nums[left] + nums[right];
    if (sum === target) {
      return [left, right];
    }
    if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return [];
}`,
      python: `def two_sum_sorted(nums, target):
    left = 0
    right = len(nums) - 1
    while left < right:
        current_sum = nums[left] + nums[right]
        if current_sum == target:
            return [left, right]
        if current_sum < target:
            left += 1
        else:
            right -= 1
    return []`,
      cpp: `vector<int> twoSumSorted(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) return {left, right};
        if (sum < target) left++;
        else right--;
    }
    return {};
}`,
    },
  },
  {
    id: "bfs",
    title: "Breadth-First Search (BFS)",
    category: "Graphs",
    defaultInput: {
      array: [0, 1, 2, 3, 4, 5],
      graph: JSON.stringify({
        0: [1, 2],
        1: [0, 3, 4],
        2: [0, 5],
        3: [1],
        4: [1],
        5: [2],
      }),
    },
    codes: {
      javascript: `function bfs(graph, startNode = 0) {
  let visited = new Set([startNode]);
  let queue = [startNode];
  let order = [];

  while (queue.length > 0) {
    let current = queue.shift();
    order.push(current);

    let neighbors = graph[current] || [];
    for (let neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}`,
      python: `from collections import deque
def bfs(graph, start_node=0):
    visited = {start_node}
    queue = deque([start_node])
    order = []
    while queue:
        current = queue.popleft()
        order.append(current)
        for neighbor in graph.get(current, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order`,
      cpp: `vector<int> bfs(map<int, vector<int>>& graph, int startNode) {
    unordered_set<int> visited;
    queue<int> q;
    vector<int> order;
    
    visited.insert(startNode);
    q.push(startNode);
    while(!q.empty()) {
        int current = q.front(); q.pop();
        order.push_back(current);
        for(int neighbor : graph[current]) {
            if(visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                q.push(neighbor);
            }
        }
    }
    return order;
}`,
    },
  },
  {
    id: "stack",
    title: "Stack (Valid Parentheses)",
    category: "Data Structures",
    defaultInput: {
      array: [1, 2, 3, 4, 5],
    },
    codes: {
      javascript: `function simulateStackOperations() {
  let stack = [];
  stack.push(10);
  stack.push(20);
  stack.push(30);
  let popped1 = stack.pop();
  stack.push(40);
  let popped2 = stack.pop();
  return stack;
}`,
      python: `def simulate_stack():
    stack = []
    stack.append(10)
    stack.append(20)
    stack.append(30)
    p1 = stack.pop()
    stack.append(40)
    p2 = stack.pop()
    return stack`,
      cpp: `void simulateStack() {
    stack<int> s;
    s.push(10);
    s.push(20);
    s.push(30);
    s.pop();
    s.push(40);
    s.pop();
}`,
    },
  },
];
