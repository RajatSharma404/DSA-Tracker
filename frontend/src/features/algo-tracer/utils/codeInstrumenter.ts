import { TraceStep, AlgorithmType, SplitMergeNode } from "../types";
import { descriptionTemplates } from "../data/descriptionTemplates";

/**
 * High-precision specialized tracers for detected standard algorithms.
 * These map directly to code line numbers and generate complete state snapshots.
 */

export function traceBubbleSort(inputArray: number[], codeLines: string[]): TraceStep[] {
  const arr = [...inputArray];
  const steps: TraceStep[] = [];
  const n = arr.length;
  let stepIdx = 0;

  // Find key line indices in code
  const outerLoopLine = Math.max(1, codeLines.findIndex((l) => /for.*i.*</i.test(l)) + 1);
  const innerLoopLine = Math.max(2, codeLines.findIndex((l) => /for.*j.*</i.test(l)) + 1);
  const ifLine = Math.max(3, codeLines.findIndex((l) => /if\s*\(.*>/i.test(l)) + 1);
  const swapLine = Math.max(4, codeLines.findIndex((l) => /temp\s*=|swap|arr\[j\]/i.test(l)) + 1);

  steps.push({
    stepIndex: stepIdx++,
    line: outerLoopLine,
    type: "init",
    arrayState: [...arr],
    highlighting: { sorted: [] },
    variables: { i: 0, j: 0, n },
    description: `Initialized Bubble Sort with array of length ${n}.`,
    theoryStepIndex: 0,
  });

  const sortedIndices: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    steps.push({
      stepIndex: stepIdx++,
      line: outerLoopLine,
      type: "iterate",
      arrayState: [...arr],
      highlighting: { sorted: [...sortedIndices] },
      variables: { i, n, pass: i + 1 },
      description: descriptionTemplates.iterate(i + 1, 0, n - i - 2),
      theoryStepIndex: 1,
    });

    for (let j = 0; j < n - i - 1; j++) {
      const willSwap = arr[j] > arr[j + 1];

      // Compare step
      steps.push({
        stepIndex: stepIdx++,
        line: ifLine,
        type: "compare",
        arrayState: [...arr],
        highlighting: {
          comparing: [j, j + 1],
          sorted: [...sortedIndices],
        },
        variables: { i, j, "arr[j]": arr[j], "arr[j+1]": arr[j + 1] },
        description: descriptionTemplates.compare(j, j + 1, arr[j], arr[j + 1], willSwap),
        theoryStepIndex: 2,
      });

      if (willSwap) {
        // Swap step
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        steps.push({
          stepIndex: stepIdx++,
          line: swapLine,
          type: "swap",
          arrayState: [...arr],
          highlighting: {
            swapping: [j, j + 1],
            sorted: [...sortedIndices],
          },
          variables: { i, j, swapped: `${arr[j]} <-> ${arr[j + 1]}` },
          description: descriptionTemplates.swap(j, j + 1, arr[j + 1], arr[j]),
          theoryStepIndex: 3,
        });
      }
    }

    const newlySorted = n - i - 1;
    sortedIndices.push(newlySorted);
    steps.push({
      stepIndex: stepIdx++,
      line: innerLoopLine,
      type: "insert",
      arrayState: [...arr],
      highlighting: {
        sorted: [...sortedIndices],
      },
      variables: { i, finalizedIndex: newlySorted, value: arr[newlySorted] },
      description: descriptionTemplates.sorted(newlySorted, arr[newlySorted]),
      theoryStepIndex: 4,
    });
  }

  sortedIndices.push(0);
  steps.push({
    stepIndex: stepIdx++,
    line: Math.max(1, codeLines.length),
    type: "complete",
    arrayState: [...arr],
    highlighting: {
      sorted: Array.from({ length: n }, (_, k) => k),
    },
    variables: { status: "SORTED", totalSteps: stepIdx },
    description: `Bubble Sort complete! Array is fully sorted in ascending order.`,
    theoryStepIndex: 4,
  });

  return steps;
}

export function traceSelectionSort(inputArray: number[], codeLines: string[]): TraceStep[] {
  const arr = [...inputArray];
  const steps: TraceStep[] = [];
  const n = arr.length;
  let stepIdx = 0;

  const outerLoopLine = Math.max(1, codeLines.findIndex((l) => /for.*i.*</i.test(l)) + 1);
  const innerLoopLine = Math.max(2, codeLines.findIndex((l) => /for.*j.*</i.test(l)) + 1);
  const swapLine = Math.max(4, codeLines.findIndex((l) => /swap|arr\[i\]\s*=/i.test(l)) + 1);

  const sortedIndices: number[] = [];

  steps.push({
    stepIndex: stepIdx++,
    line: outerLoopLine,
    type: "init",
    arrayState: [...arr],
    highlighting: { sorted: [] },
    variables: { n, sortedCount: 0 },
    description: `Initialized Selection Sort for array of size ${n}.`,
    theoryStepIndex: 0,
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    steps.push({
      stepIndex: stepIdx++,
      line: outerLoopLine,
      type: "iterate",
      arrayState: [...arr],
      highlighting: {
        pivot: minIdx,
        sorted: [...sortedIndices],
      },
      variables: { i, minIdx, minVal: arr[minIdx] },
      description: `Starting pass ${i + 1}. Current minimum assumed at index ${minIdx} (value: ${arr[minIdx]}).`,
      theoryStepIndex: 1,
    });

    for (let j = i + 1; j < n; j++) {
      const isSmaller = arr[j] < arr[minIdx];

      steps.push({
        stepIndex: stepIdx++,
        line: innerLoopLine,
        type: "compare",
        arrayState: [...arr],
        highlighting: {
          comparing: [minIdx, j],
          pivot: minIdx,
          sorted: [...sortedIndices],
        },
        variables: { i, j, minIdx, "arr[j]": arr[j], "arr[minIdx]": arr[minIdx] },
        description: isSmaller
          ? `arr[${j}] (${arr[j]}) is smaller than current min arr[${minIdx}] (${arr[minIdx]}). Updating minIdx to ${j}.`
          : `arr[${j}] (${arr[j]}) >= current min arr[${minIdx}] (${arr[minIdx]}). Minimum remains at index ${minIdx}.`,
        theoryStepIndex: 2,
      });

      if (isSmaller) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      steps.push({
        stepIndex: stepIdx++,
        line: swapLine,
        type: "swap",
        arrayState: [...arr],
        highlighting: {
          swapping: [i, minIdx],
          sorted: [...sortedIndices],
        },
        variables: { i, minIdx, swapped: `${arr[minIdx]} <-> ${arr[i]}` },
        description: `Swapping found minimum ${arr[i]} into sorted position at index ${i}.`,
        theoryStepIndex: 3,
      });
    }

    sortedIndices.push(i);
    steps.push({
      stepIndex: stepIdx++,
      line: outerLoopLine,
      type: "insert",
      arrayState: [...arr],
      highlighting: { sorted: [...sortedIndices] },
      variables: { sortedThrough: i },
      description: descriptionTemplates.sorted(i, arr[i]),
      theoryStepIndex: 4,
    });
  }

  sortedIndices.push(n - 1);
  steps.push({
    stepIndex: stepIdx++,
    line: Math.max(1, codeLines.length),
    type: "complete",
    arrayState: [...arr],
    highlighting: { sorted: Array.from({ length: n }, (_, k) => k) },
    variables: { status: "SORTED" },
    description: `Selection Sort complete. All elements ordered.`,
    theoryStepIndex: 4,
  });

  return steps;
}

export function traceQuickSort(inputArray: number[], codeLines: string[]): TraceStep[] {
  const arr = [...inputArray];
  const steps: TraceStep[] = [];
  let stepIdx = 0;
  const sortedSet = new Set<number>();

  const partitionLine = Math.max(2, codeLines.findIndex((l) => /pivot\s*=|let\s*pivot/i.test(l)) + 1);
  const loopLine = Math.max(3, codeLines.findIndex((l) => /for.*j\s*=/i.test(l)) + 1);
  const swapLine = Math.max(4, codeLines.findIndex((l) => /swap|arr\[i\]\s*=/i.test(l)) + 1);

  steps.push({
    stepIndex: stepIdx++,
    line: 1,
    type: "init",
    arrayState: [...arr],
    highlighting: {},
    variables: { low: 0, high: arr.length - 1 },
    description: `Starting Quick Sort (Lomuto Partition Scheme).`,
    theoryStepIndex: 0,
  });

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;

    steps.push({
      stepIndex: stepIdx++,
      line: partitionLine,
      type: "iterate",
      arrayState: [...arr],
      highlighting: {
        pivot: high,
        activeRange: [low, high],
        sorted: Array.from(sortedSet),
      },
      variables: { low, high, pivot, pivotIndex: high, i },
      description: `Selected pivot arr[${high}] = ${pivot}. Partitioning subarray [${low}..${high}].`,
      theoryStepIndex: 1,
    });

    for (let j = low; j < high; j++) {
      const isSmallerOrEqual = arr[j] <= pivot;

      steps.push({
        stepIndex: stepIdx++,
        line: loopLine,
        type: "compare",
        arrayState: [...arr],
        highlighting: {
          comparing: [j, high],
          pivot: high,
          activeRange: [low, high],
          sorted: Array.from(sortedSet),
        },
        variables: { j, "arr[j]": arr[j], pivot, i },
        description: isSmallerOrEqual
          ? `arr[${j}] (${arr[j]}) <= pivot (${pivot}). Advancing i and swapping arr[${i + 1}] with arr[${j}].`
          : `arr[${j}] (${arr[j]}) > pivot (${pivot}). Element belongs to right partition.`,
        theoryStepIndex: 2,
      });

      if (isSmallerOrEqual) {
        i++;
        if (i !== j) {
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;

          steps.push({
            stepIndex: stepIdx++,
            line: swapLine,
            type: "swap",
            arrayState: [...arr],
            highlighting: {
              swapping: [i, j],
              pivot: high,
              activeRange: [low, high],
              sorted: Array.from(sortedSet),
            },
            variables: { i, j, swapped: `${arr[j]} <-> ${arr[i]}` },
            description: `Swapped arr[${i}] with arr[${j}].`,
            theoryStepIndex: 2,
          });
        }
      }
    }

    const pi = i + 1;
    const temp = arr[pi];
    arr[pi] = arr[high];
    arr[high] = temp;
    sortedSet.add(pi);

    steps.push({
      stepIndex: stepIdx++,
      line: swapLine,
      type: "insert",
      arrayState: [...arr],
      highlighting: {
        sorted: Array.from(sortedSet),
        pivot: pi,
      },
      variables: { pi, pivotValue: arr[pi] },
      description: `Pivot ${arr[pi]} placed in its finalized index ${pi}. Elements left are <= ${arr[pi]}, elements right are >= ${arr[pi]}.`,
      theoryStepIndex: 3,
    });

    return pi;
  }

  function sort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    } else if (low === high) {
      sortedSet.add(low);
    }
  }

  sort(0, arr.length - 1);

  steps.push({
    stepIndex: stepIdx++,
    line: Math.max(1, codeLines.length),
    type: "complete",
    arrayState: [...arr],
    highlighting: { sorted: Array.from({ length: arr.length }, (_, k) => k) },
    variables: { status: "COMPLETED" },
    description: `Quick Sort completed. All partitions recursively sorted!`,
    theoryStepIndex: 4,
  });

  return steps;
}

export function traceMergeSort(inputArray: number[], codeLines: string[]): TraceStep[] {
  const original = [...inputArray];
  const steps: TraceStep[] = [];
  let stepIdx = 0;

  const splitLine = Math.max(2, codeLines.findIndex((l) => /mid\s*=/i.test(l)) + 1);
  const mergeLine = Math.max(5, codeLines.findIndex((l) => /merge|while/i.test(l)) + 1);

  const treeNodes: SplitMergeNode[] = [];

  steps.push({
    stepIndex: stepIdx++,
    line: 1,
    type: "init",
    arrayState: [...original],
    highlighting: {},
    variables: { length: original.length },
    description: `Starting Merge Sort on array: [${original.join(", ")}].`,
    theoryStepIndex: 0,
    treeState: [],
  });

  function recursiveMerge(arr: number[], leftIdx: number, depth: number): number[] {
    const rightIdx = leftIdx + arr.length - 1;
    const nodeId = `node-${leftIdx}-${rightIdx}-${depth}`;

    const node: SplitMergeNode = {
      id: nodeId,
      depth,
      array: [...arr],
      leftIndex: leftIdx,
      rightIndex: rightIdx,
      stage: "split",
      active: true,
    };
    treeNodes.push(node);

    if (arr.length <= 1) {
      node.stage = "merged";
      return arr;
    }

    const mid = Math.floor(arr.length / 2);
    const leftSlice = arr.slice(0, mid);
    const rightSlice = arr.slice(mid);

    steps.push({
      stepIndex: stepIdx++,
      line: splitLine,
      type: "split",
      arrayState: [...original],
      highlighting: { activeRange: [leftIdx, rightIdx] },
      variables: { left: leftIdx, right: rightIdx, mid: leftIdx + mid - 1 },
      description: descriptionTemplates.splitNode(leftIdx, rightIdx, arr),
      theoryStepIndex: 1,
      treeState: [...treeNodes],
    });

    const sortedLeft = recursiveMerge(leftSlice, leftIdx, depth + 1);
    const sortedRight = recursiveMerge(rightSlice, leftIdx + mid, depth + 1);

    // Merging
    const merged: number[] = [];
    let i = 0, j = 0;

    node.stage = "merging";

    while (i < sortedLeft.length && j < sortedRight.length) {
      if (sortedLeft[i] <= sortedRight[j]) {
        merged.push(sortedLeft[i++]);
      } else {
        merged.push(sortedRight[j++]);
      }
    }
    while (i < sortedLeft.length) merged.push(sortedLeft[i++]);
    while (j < sortedRight.length) merged.push(sortedRight[j++]);

    // Update segment in original
    for (let k = 0; k < merged.length; k++) {
      original[leftIdx + k] = merged[k];
    }

    node.array = [...merged];
    node.stage = "merged";

    steps.push({
      stepIndex: stepIdx++,
      line: mergeLine,
      type: "merge",
      arrayState: [...original],
      highlighting: {
        activeRange: [leftIdx, rightIdx],
        sorted: Array.from({ length: merged.length }, (_, idx) => leftIdx + idx),
      },
      variables: { left: leftIdx, right: rightIdx, merged: `[${merged.join(", ")}]` },
      description: descriptionTemplates.mergeNodes(leftIdx, rightIdx, merged),
      theoryStepIndex: 3,
      treeState: [...treeNodes],
    });

    return merged;
  }

  recursiveMerge(original, 0, 0);

  steps.push({
    stepIndex: stepIdx++,
    line: Math.max(1, codeLines.length),
    type: "complete",
    arrayState: [...original],
    highlighting: { sorted: Array.from({ length: original.length }, (_, k) => k) },
    variables: { status: "SORTED" },
    description: `Merge Sort complete! Recursion merged into fully sorted array.`,
    theoryStepIndex: 4,
    treeState: [...treeNodes],
  });

  return steps;
}

export function traceBinarySearch(
  inputArray: number[],
  target: number,
  codeLines: string[],
): TraceStep[] {
  // Ensure array is sorted for binary search
  const nums = [...inputArray].sort((a, b) => a - b);
  const steps: TraceStep[] = [];
  let stepIdx = 0;
  let low = 0;
  let high = nums.length - 1;

  const loopLine = Math.max(2, codeLines.findIndex((l) => /while.*<=/i.test(l)) + 1);
  const midLine = Math.max(3, codeLines.findIndex((l) => /mid\s*=/i.test(l)) + 1);
  const foundLine = Math.max(4, codeLines.findIndex((l) => /===?\s*target/i.test(l)) + 1);

  steps.push({
    stepIndex: stepIdx++,
    line: 1,
    type: "init",
    arrayState: [...nums],
    highlighting: { activeRange: [low, high] },
    variables: { low, high, target },
    description: `Starting Binary Search for target ${target} across sorted array of ${nums.length} items.`,
    theoryStepIndex: 0,
  });

  let foundIndex = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = nums[mid];

    steps.push({
      stepIndex: stepIdx++,
      line: midLine,
      type: "iterate",
      arrayState: [...nums],
      highlighting: {
        activeRange: [low, high],
        pivot: mid,
      },
      variables: { low, high, mid, "nums[mid]": midVal, target },
      description: `Calculated mid = Math.floor((${low} + ${high}) / 2) = ${mid} (value: ${midVal}).`,
      theoryStepIndex: 1,
    });

    if (midVal === target) {
      foundIndex = mid;
      steps.push({
        stepIndex: stepIdx++,
        line: foundLine,
        type: "found",
        arrayState: [...nums],
        highlighting: {
          found: mid,
          activeRange: [mid, mid],
        },
        variables: { resultIndex: mid, target, foundValue: midVal },
        description: descriptionTemplates.midTest(mid, midVal, target, "found"),
        theoryStepIndex: 3,
      });
      break;
    }

    if (midVal < target) {
      steps.push({
        stepIndex: stepIdx++,
        line: loopLine,
        type: "compare",
        arrayState: [...nums],
        highlighting: {
          activeRange: [low, high],
          eliminatedRange: [low, mid],
          pivot: mid,
        },
        variables: { low, high, mid, target, nextLow: mid + 1 },
        description: descriptionTemplates.midTest(mid, midVal, target, "less"),
        theoryStepIndex: 4,
      });
      low = mid + 1;
    } else {
      steps.push({
        stepIndex: stepIdx++,
        line: loopLine,
        type: "compare",
        arrayState: [...nums],
        highlighting: {
          activeRange: [low, high],
          eliminatedRange: [mid, high],
          pivot: mid,
        },
        variables: { low, high, mid, target, nextHigh: mid - 1 },
        description: descriptionTemplates.midTest(mid, midVal, target, "greater"),
        theoryStepIndex: 5,
      });
      high = mid - 1;
    }
  }

  if (foundIndex === -1) {
    steps.push({
      stepIndex: stepIdx++,
      line: Math.max(1, codeLines.length),
      type: "notfound",
      arrayState: [...nums],
      highlighting: {},
      variables: { result: -1, status: "NOT_FOUND" },
      description: `Search space exhausted (low > high). Target ${target} is not in the array. Returning -1.`,
      theoryStepIndex: 5,
    });
  }

  return steps;
}

export function traceTwoPointers(
  inputArray: number[],
  target: number,
  codeLines: string[],
): TraceStep[] {
  const nums = [...inputArray].sort((a, b) => a - b);
  const steps: TraceStep[] = [];
  let stepIdx = 0;
  let left = 0;
  let right = nums.length - 1;

  const loopLine = Math.max(2, codeLines.findIndex((l) => /while.*</i.test(l)) + 1);
  const sumLine = Math.max(3, codeLines.findIndex((l) => /sum\s*=/i.test(l)) + 1);
  const foundLine = Math.max(4, codeLines.findIndex((l) => /===?\s*target/i.test(l)) + 1);

  steps.push({
    stepIndex: stepIdx++,
    line: 1,
    type: "init",
    arrayState: [...nums],
    highlighting: {
      comparing: [left, right],
    },
    variables: { left, right, target },
    description: `Initialized Two Pointers: Left = index 0 (${nums[0]}), Right = index ${right} (${nums[right]}).`,
    theoryStepIndex: 0,
  });

  let found = false;

  while (left < right) {
    const sum = nums[left] + nums[right];

    steps.push({
      stepIndex: stepIdx++,
      line: sumLine,
      type: "compare",
      arrayState: [...nums],
      highlighting: {
        comparing: [left, right],
      },
      variables: { left, right, "nums[left]": nums[left], "nums[right]": nums[right], currentSum: sum, target },
      description: descriptionTemplates.twoPointersCompare(left, right, nums[left], nums[right], sum, target),
      theoryStepIndex: 1,
    });

    if (sum === target) {
      found = true;
      steps.push({
        stepIndex: stepIdx++,
        line: foundLine,
        type: "found",
        arrayState: [...nums],
        highlighting: {
          found: left,
          comparing: [left, right],
          sorted: [left, right],
        },
        variables: { pairIndices: `[${left}, ${right}]`, values: `[${nums[left]}, ${nums[right]}]`, sum: target },
        description: `Target pair found at indices [${left}, ${right}] (${nums[left]} + ${nums[right]} = ${target})!`,
        theoryStepIndex: 2,
      });
      break;
    }

    if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  if (!found) {
    steps.push({
      stepIndex: stepIdx++,
      line: Math.max(1, codeLines.length),
      type: "notfound",
      arrayState: [...nums],
      highlighting: {},
      variables: { result: "[]", status: "NOT_FOUND" },
      description: `No pair found that sums up to ${target}.`,
      theoryStepIndex: 4,
    });
  }

  return steps;
}

export function traceBFS(
  graphInputStr: string,
  startNodeStr: string | number = 0,
): TraceStep[] {
  let graph: Record<string, (string | number)[]> = {
    "0": [1, 2],
    "1": [0, 3, 4],
    "2": [0, 5],
    "3": [1],
    "4": [1],
    "5": [2],
  };

  try {
    if (graphInputStr.trim()) {
      graph = JSON.parse(graphInputStr);
    }
  } catch {
    // Keep default
  }

  const nodes = Object.keys(graph).map((id) => ({ id, label: id }));
  const edges: Array<{ from: string; to: string }> = [];
  const edgeSet = new Set<string>();

  Object.entries(graph).forEach(([from, neighbors]) => {
    neighbors.forEach((to) => {
      const edgeKey = [from, String(to)].sort().join("-");
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        edges.push({ from, to: String(to) });
      }
    });
  });

  const startNode = String(startNodeStr);
  const visited = new Set<string>([startNode]);
  const queue: string[] = [startNode];
  const order: string[] = [];
  const steps: TraceStep[] = [];
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    line: 1,
    type: "init",
    arrayState: [],
    highlighting: { currentNode: startNode, visitedNodes: [startNode] },
    variables: { queue: [startNode], visited: [startNode] },
    description: `Starting BFS at source node '${startNode}'. Enqueued '${startNode}'.`,
    graphState: {
      nodes,
      edges,
      visited: [startNode],
      current: startNode,
      queueOrStack: [...queue],
    },
    theoryStepIndex: 0,
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    const neighbors = (graph[current] || []).map(String);
    const unvisitedNeighbors = neighbors.filter((n) => !visited.has(n));

    steps.push({
      stepIndex: stepIdx++,
      line: 3,
      type: "visit",
      arrayState: [],
      highlighting: {
        currentNode: current,
        visitedNodes: Array.from(visited),
      },
      variables: { current, queue: [...queue], order: [...order] },
      description: descriptionTemplates.visitGraphNode(current, unvisitedNeighbors),
      graphState: {
        nodes,
        edges,
        visited: Array.from(visited),
        current,
        queueOrStack: [...queue],
      },
      theoryStepIndex: 1,
    });

    for (const neighbor of unvisitedNeighbors) {
      visited.add(neighbor);
      queue.push(neighbor);

      steps.push({
        stepIndex: stepIdx++,
        line: 5,
        type: "enqueue",
        arrayState: [],
        highlighting: {
          currentNode: neighbor,
          visitedNodes: Array.from(visited),
          activeEdge: [current, neighbor],
        },
        variables: { enqueued: neighbor, queue: [...queue] },
        description: `Discovered neighbor '${neighbor}'. Marked visited and pushed to queue.`,
        graphState: {
          nodes,
          edges,
          visited: Array.from(visited),
          current: neighbor,
          queueOrStack: [...queue],
        },
        theoryStepIndex: 3,
      });
    }
  }

  steps.push({
    stepIndex: stepIdx++,
    line: 7,
    type: "complete",
    arrayState: [],
    highlighting: { visitedNodes: Array.from(visited) },
    variables: { traversalOrder: order.join(" -> ") },
    description: `BFS Traversal finished! Order: ${order.join(" -> ")}.`,
    graphState: {
      nodes,
      edges,
      visited: Array.from(visited),
      current: null,
      queueOrStack: [],
    },
    theoryStepIndex: 4,
  });

  return steps;
}

export function traceStackSimulation(codeLines: string[]): TraceStep[] {
  const steps: TraceStep[] = [];
  const stack: (number | string)[] = [];
  let stepIdx = 0;

  const ops = [
    { type: "push", val: 10, line: 2 },
    { type: "push", val: 20, line: 3 },
    { type: "push", val: 30, line: 4 },
    { type: "pop", line: 5 },
    { type: "push", val: 40, line: 6 },
    { type: "pop", line: 7 },
  ];

  steps.push({
    stepIndex: stepIdx++,
    line: 1,
    type: "init",
    arrayState: [],
    highlighting: {},
    variables: { stack: "[]", size: 0 },
    description: `Initialized empty LIFO Stack.`,
    dataStructureState: [],
    theoryStepIndex: 0,
  });

  for (const op of ops) {
    if (op.type === "push" && op.val !== undefined) {
      stack.push(op.val);
      steps.push({
        stepIndex: stepIdx++,
        line: op.line,
        type: "push",
        arrayState: [],
        highlighting: { stackTop: stack.length - 1 },
        variables: { pushed: op.val, top: op.val, size: stack.length },
        description: descriptionTemplates.pushStack(op.val),
        dataStructureState: [...stack],
        theoryStepIndex: 1,
      });
    } else if (op.type === "pop") {
      const popped = stack.pop();
      steps.push({
        stepIndex: stepIdx++,
        line: op.line,
        type: "pop",
        arrayState: [],
        highlighting: { stackTop: stack.length > 0 ? stack.length - 1 : null },
        variables: { popped, top: stack[stack.length - 1] ?? "null", size: stack.length },
        description: descriptionTemplates.popStack(popped ?? "empty"),
        dataStructureState: [...stack],
        theoryStepIndex: 2,
      });
    }
  }

  steps.push({
    stepIndex: stepIdx++,
    line: Math.max(1, codeLines.length),
    type: "complete",
    arrayState: [],
    highlighting: {},
    variables: { finalStack: `[${stack.join(", ")}]`, size: stack.length },
    description: `Stack operations completed. Final stack size: ${stack.length}.`,
    dataStructureState: [...stack],
    theoryStepIndex: 3,
  });

  return steps;
}
