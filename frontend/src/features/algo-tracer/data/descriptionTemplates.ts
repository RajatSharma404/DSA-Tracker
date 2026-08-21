export const descriptionTemplates = {
  compare: (
    i: number,
    j: number,
    val1: number | string,
    val2: number | string,
    willSwap = false,
  ) => {
    if (willSwap) {
      return `Comparing arr[${i}] = ${val1} and arr[${j}] = ${val2}. Since ${val1} > ${val2}, a swap is needed.`;
    }
    return `Comparing arr[${i}] = ${val1} and arr[${j}] = ${val2}. Order is already correct (${val1} <= ${val2}).`;
  },

  swap: (i: number, j: number, val1: number | string, val2: number | string) => {
    return `Swapping arr[${i}] (${val1}) with arr[${j}] (${val2}).`;
  },

  sorted: (i: number, val: number | string) => {
    return `Element arr[${i}] = ${val} is now in its finalized sorted position.`;
  },

  iterate: (pass: number, startIdx: number, endIdx: number) => {
    return `Starting pass ${pass}: scanning unsorted segment from index ${startIdx} to ${endIdx}.`;
  },

  midTest: (
    mid: number,
    midVal: number | string,
    target: number | string,
    status: "found" | "less" | "greater",
  ) => {
    if (status === "found") {
      return `Testing mid index ${mid}: arr[${mid}] = ${midVal} === target (${target}). Target found!`;
    }
    if (status === "less") {
      return `Testing mid index ${mid}: arr[${mid}] = ${midVal} < target (${target}). Discarding left search half; moving low to ${mid + 1}.`;
    }
    return `Testing mid index ${mid}: arr[${mid}] = ${midVal} > target (${target}). Discarding right search half; moving high to ${mid - 1}.`;
  },

  twoPointersCompare: (
    l: number,
    r: number,
    lVal: number | string,
    rVal: number | string,
    sum: number | string,
    target: number | string,
  ) => {
    if (sum === target) {
      return `Pointers at left = ${l} (${lVal}) and right = ${r} (${rVal}) sum to ${sum} === target ${target}. Target pair found!`;
    }
    if (Number(sum) < Number(target)) {
      return `Sum (${lVal} + ${rVal} = ${sum}) < target (${target}). Incrementing left pointer (left = ${l + 1}) to increase sum.`;
    }
    return `Sum (${lVal} + ${rVal} = ${sum}) > target (${target}). Decrementing right pointer (right = ${r - 1}) to decrease sum.`;
  },

  splitNode: (left: number, right: number, array: number[]) => {
    return `Dividing subarray range [${left}..${right}] (${JSON.stringify(array)}) into two equal halves.`;
  },

  mergeNodes: (left: number, right: number, merged: number[]) => {
    return `Merging sorted halves into range [${left}..${right}]: result is [${merged.join(", ")}].`;
  },

  visitGraphNode: (
    node: string | number,
    neighbors: Array<string | number>,
  ) => {
    const neighborStr =
      neighbors.length > 0 ? neighbors.join(", ") : "no unvisited neighbors";
    return `Visiting node ${node}. Enqueuing unvisited neighbors: [${neighborStr}].`;
  },

  pushStack: (val: string | number) => {
    return `Pushing item '${val}' onto top of the stack.`;
  },

  popStack: (val: string | number) => {
    return `Popping item '${val}' from top of the stack.`;
  },

  enqueueQueue: (val: string | number) => {
    return `Enqueuing item '${val}' to rear of the queue.`;
  },

  dequeueQueue: (val: string | number) => {
    return `Dequeuing item '${val}' from front of the queue.`;
  },

  genericStep: (line: number, vars: Record<string, any>) => {
    const varSummary = Object.entries(vars)
      .slice(0, 4)
      .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
      .join(", ");
    return `Executed line ${line}. State: ${varSummary || "processing"}`;
  },
};
