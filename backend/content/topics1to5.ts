export const topics1to5 = {
  1: {
    title: "Complexity Analysis",
    whatIsIt: `Complexity Analysis (often referred to as Asymptotic Analysis) is the mathematical foundation of Computer Science. It provides a theoretical framework to estimate how the runtime (Time Complexity) and memory consumption (Space Complexity) of an algorithm increase as the size of the input (\`N\`) approaches infinity.
    
In technical interviews, simply arriving at a working solution is rarely enough. Interviewers expect you to prove that your solution is scalable. For instance, an algorithm that runs in \`O(N^2)\` might process 100 items in milliseconds, but will freeze your system if handed 1,000,000 items. Understanding Big-O notation enables you to predict this failure before writing a single line of code.`,
    concept: `### Big-O Notation Hierarchy
    
We focus on the **upper bound** (worst-case scenario) using Big-O (O) notation.

\`\`\`text
O(1) -> O(log N) -> O(N) -> O(N log N) -> O(N^2) -> O(2^N) -> O(N!)
FASTEST                                                 SLOWEST
\`\`\`

- **O(1) [Constant]**: The execution time does not change, regardless of input size (e.g., accessing an array index).
- **O(log N) [Logarithmic]**: The search space is halved every iteration (e.g., Binary Search, traversing a balanced BST).
- **O(N) [Linear]**: You must touch every element exactly once or a constant number of times.
- **O(N log N) [Linearithmic]**: The standard for efficient sorting algorithms like Merge Sort and Quick Sort.
- **O(N^2) [Quadratic]**: Usually implies a nested loop where for every element, you iterate over the rest of the elements.
- **O(2^N) [Exponential]**: Characteristic of unoptimized recursive algorithms (e.g., naive Fibonacci) where the tree branches infinitely.`,
    code: `// C++ Implementation of various complexities
#include <bits/stdc++.h>
using namespace std;

// O(1) Time: Returns the first element instantly.
int getFirstElement(const vector<int>& arr) {
    if (arr.empty()) return -1;
    return arr[0];
}

// O(N) Time: Iterates through all N elements once.
int sumArray(const vector<int>& arr) {
    int total = 0;
    for (int num : arr) {
        total += num;
    }
    return total;
}

// O(N^2) Time: For each of the N elements, it iterates N times.
void printAllPairs(const vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cout << arr[i] << ", " << arr[j] << "\\n";
        }
    }
}

// O(log N) Time: Binary Search halves the space each step.
int binarySearch(const vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    dryRun: `### Dry Run: O(log N) Binary Search

Suppose we are searching for \`target = 6\` in the array:
\`arr = [2, 4, 6, 8, 10, 12, 14, 16]\` (N = 8)

1. **Initialization**: \`left = 0\`, \`right = 7\`.
2. **Iteration 1**:
   - \`mid = 0 + (7 - 0) / 2 = 3\`
   - \`arr[3]\` is \`8\`.
   - \`8 > 6\`, so the target must be on the left.
   - We update \`right = mid - 1 = 2\`. The new search space is just \`[2, 4, 6]\`.
3. **Iteration 2**:
   - \`mid = 0 + (2 - 0) / 2 = 1\`
   - \`arr[1]\` is \`4\`.
   - \`4 < 6\`, so the target must be on the right.
   - We update \`left = mid + 1 = 2\`. The new search space is just \`[6]\`.
4. **Iteration 3**:
   - \`mid = 2 + (2 - 2) / 2 = 2\`
   - \`arr[2]\` is \`6\`.
   - \`6 == target\`. We return index \`2\`.

**Conclusion**: We found the element in just 3 steps. If this was a linear search \`O(N)\`, it would have taken 3 steps as well, but what if N = 1,000,000? Binary search would find it in a maximum of ~20 steps, whereas linear search could take up to 1,000,000 steps.`,
    complexity: `### Time vs Space Complexity

- **Time Complexity**: Refers to CPU cycles. How many primitive operations does the code execute? We drop constants (e.g., \`O(2N)\` becomes \`O(N)\`) because as N approaches infinity, the constant factor becomes negligible compared to the growth rate.
- **Space Complexity**: Refers to RAM memory consumption. Are you creating new arrays or allocating new objects? **Crucial Note:** Recursive functions consume memory! Every recursive call adds a frame to the Call Stack. Thus, a recursion that goes \`N\` levels deep has a space complexity of \`O(N)\`, even if you never explicitly declared an array.`,
    problems: `### Classic Problems to Test Your Understanding

1. **[Easy] Determine Complexity:** Given a nested loop where the inner loop only runs \`log N\` times, what is the complexity? (Answer: \`O(N log N)\`).
2. **[Medium] Optimize a Brute Force Solution:** You are given a solution that uses two nested loops \`O(N^2)\` to find a pair of numbers that sum to a target. Can you reduce the Time Complexity to \`O(N)\` by trading off Space Complexity? (Hint: Use a Hash Map!).
3. **[Hard] Estimate Input Constraints:** If a coding platform gives you a time limit of 1.0 seconds, and \`N = 10^5\`, what is the worst acceptable time complexity? (Hint: Modern servers perform ~10^8 operations per second. An \`O(N^2)\` solution would take \`10^{10}\` operations, taking 100 seconds and causing a Time Limit Exceeded error. You must find an \`O(N log N)\` or \`O(N)\` algorithm).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **Drop the Constants!** \`O(N + N)\` is just \`O(N)\`. Do not say \`O(2N)\` in an interview.
- **Multiple Inputs:** If an algorithm loops over array A (length N) and then loops over array B (length M), the complexity is \`O(N + M)\`, not \`O(N)\`. Never assume two different inputs are identical in size.
- **Amortized Analysis:** Dynamic arrays (like C++ \`std::vector\` or Java \`ArrayList\`) take \`O(N)\` to resize when they get full. However, because resizing doubles the capacity, it happens so infrequently that the average insertion time is heavily diluted to \`O(1)\`. We call this **Amortized O(1)**.

> **Checkpoint Question:** If you have an algorithm that is \`O(N)\` time and \`O(1)\` space, and you change it to use a recursive function that goes \`N\` levels deep, what is the new space complexity?
> **Answer:** The space complexity becomes \`O(N)\` because of the recursive call stack overhead.`
  },
  2: {
    title: "Arrays & Dynamic Arrays",
    whatIsIt: `An Array is the most fundamental data structure. It represents a contiguous block of memory where elements of the same data type are stored back-to-back. 
    
Because the memory is contiguous, the CPU can instantly calculate the exact physical memory address of any element simply by knowing the starting address and the index. This provides lightning-fast \`O(1)\` access times. However, this rigidity means that standard arrays cannot grow or shrink. To solve this, languages provide **Dynamic Arrays** (e.g., \`std::vector\` in C++, \`ArrayList\` in Java, or native Arrays in Python/JS), which automatically allocate a larger chunk of memory and copy elements over when they fill up.`,
    concept: `### Contiguous Memory Layout

Imagine an integer array starting at memory address \`1000\`. If each integer takes 4 bytes:

\`\`\`text
Index:      0       1       2       3
Values:   [ 10 ]  [ 20 ]  [ 30 ]  [ 40 ]
Address:   1000    1004    1008    1012
\`\`\`

To access index \`2\`:
\`Address = Base_Address + (Index * Element_Size)\`
\`Address = 1000 + (2 * 4) = 1008\`.

The CPU jumps directly to \`1008\` in a single operation \`O(1)\`. 

### The Cost of Shifting
If you want to insert a value at Index 1, you cannot just squeeze it in. You must push Index 1 to Index 2, and Index 2 to Index 3. This means moving \`N\` elements, resulting in an \`O(N)\` insertion time.`,
    code: `// C++ Implementation of Array Operations
#include <bits/stdc++.h>
using namespace std;

int main() {
    // 1. Static Array (Fixed size of 5)
    int staticArr[5] = {1, 2, 3, 4, 5};
    
    // 2. Dynamic Array (Vector)
    vector<int> nums = {10, 20, 30};
    
    // O(1) Amortized - Adding to the end
    nums.push_back(40); 
    
    // O(N) - Inserting at the beginning or middle
    // Every element currently in the vector must shift right!
    nums.insert(nums.begin(), 5); 
    
    // O(N) - Deleting from the middle
    // Every element after index 1 must shift left!
    nums.erase(nums.begin() + 1);
    
    // O(1) - Access and Modification
    nums[2] = 99;
    
    // Two Pointer Technique (Common Array Pattern)
    // Reversing an array in-place
    int left = 0, right = nums.size() - 1;
    while (left < right) {
        swap(nums[left], nums[right]);
        left++;
        right--;
    }
    
    return 0;
}`,
    dryRun: `### Dry Run: In-Place Array Reversal using Two Pointers

Given array: \`nums = [1, 2, 3, 4, 5]\`
We want to reverse this in \`O(N)\` time and \`O(1)\` space.

1. **Initialization**: \`left = 0\` (points to 1), \`right = 4\` (points to 5).
2. **Iteration 1**: \`left < right\` (0 < 4) is True.
   - Swap \`nums[0]\` and \`nums[4]\`. Array becomes \`[5, 2, 3, 4, 1]\`.
   - Increment \`left\` to 1, decrement \`right\` to 3.
3. **Iteration 2**: \`left < right\` (1 < 3) is True.
   - Swap \`nums[1]\` and \`nums[3]\`. Array becomes \`[5, 4, 3, 2, 1]\`.
   - Increment \`left\` to 2, decrement \`right\` to 2.
4. **Iteration 3**: \`left < right\` (2 < 2) is **False**. Loop terminates.

**Result**: The array is completely reversed in exactly \`N/2\` operations. Since we drop constants, the time complexity is \`O(N)\`. We used no extra memory, so space complexity is \`O(1)\`.`,
    complexity: `### Time and Space Constraints

| Operation | Time Complexity | Explanation |
| :--- | :--- | :--- |
| **Access \`arr[i]\`** | \`O(1)\` | Direct memory address calculation. |
| **Search (Unsorted)** | \`O(N)\` | Must check every element sequentially. |
| **Search (Sorted)** | \`O(log N)\` | Can utilize Binary Search. |
| **Append (End)** | \`O(1)\` Amortized | Usually constant, unless a resize is triggered. |
| **Insert/Delete (Middle)** | \`O(N)\` | Requires shifting all trailing elements to maintain contiguous memory. |`,
    problems: `### Classic Problems to Master

1. **[Easy] Two Sum:** Find two numbers in an array that add up to a target. (Pattern: Use a Hash Map to reduce \`O(N^2)\` to \`O(N)\`).
2. **[Medium] Maximum Subarray (Kadane's Algorithm):** Find the contiguous subarray with the largest sum. (Pattern: Keep a running sum, reset it to 0 if it goes negative. \`O(N)\` time).
3. **[Medium] Container With Most Water:** Given an array of heights, find two lines that hold the most water. (Pattern: Two Pointers starting from edges, moving the smaller pointer inward).
4. **[Hard] Trapping Rain Water:** (Pattern: Pre-compute max heights from left and right, or use two pointers, to determine how much water sits on top of each index).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **Off-by-One Errors:** The most common bug in array problems. Always remember arrays are 0-indexed. The last element is at \`size() - 1\`.
- **Sliding Window:** If a problem asks for a "contiguous subarray", instantly think of the Sliding Window technique.
- **Prefix Sums:** If a problem asks you to calculate the sum of ranges multiple times, create a "Prefix Sum" array where \`P[i] = P[i-1] + arr[i]\`. This allows querying the sum of any range \`[L, R]\` in \`O(1)\` time via \`P[R] - P[L-1]\`.
- **Pre-Sorting:** If the problem doesn't require maintaining the original order, sorting the array first (\`O(N log N)\`) often unlocks \`O(N)\` Two-Pointer solutions, lowering the overall complexity from \`O(N^2)\`.

> **Checkpoint Question:** Why does appending to a dynamic array occasionally take \`O(N)\` time?
> **Answer:** When the array reaches its underlying capacity limit, the runtime must allocate a brand new, larger chunk of memory and copy all \`N\` existing elements over to the new location before adding the new element.`
  },
  3: {
    title: "Strings & Pattern Matching",
    whatIsIt: `A String is essentially an array of characters. Because of this, almost all array algorithms (Two Pointers, Sliding Window) apply directly to strings. 
    
However, strings come with their own unique set of constraints and nuances. For instance, strings are immutable in many languages (like Java and Python), meaning every time you modify a string, a completely new copy is created in memory. Furthermore, strings are heavily tied to the ASCII/Unicode character sets, which unlocks specific optimization tricks, such as using fixed-size arrays for frequency counting instead of Hash Maps.`,
    concept: `### ASCII Encoding and Frequency Counting

Characters are just integers under the hood. In the standard ASCII table, there are 128 characters. 
- \`'a'\` = 97
- \`'z'\` = 122
- \`'A'\` = 65
- \`'0'\` = 48

Because the alphabet is limited (e.g., 26 lowercase English letters), we can often optimize space complexity from \`O(N)\` to \`O(1)\` by using a fixed array of size 26 instead of a dynamic Hash Map.

\`\`\`text
String: "hello"
Frequency Array of size 26:
Index: [0][1][2][3][4][5][6][7][8][9][10][11][12] ...
Char:   a  b  c  d  e  f  g  h  i  j   k   l   m
Count:  0  0  0  0  1  0  0  1  0  0   0   2   0
\`\`\`
*(Here, index is calculated via \`char - 'a'\`)*`,
    code: `// C++ Implementation of String Algorithms
#include <bits/stdc++.h>
using namespace std;

// 1. Valid Anagram (O(N) Time, O(1) Space)
// Uses a frequency array instead of a slow Hash Map
bool isAnagram(string s, string t) {
    if (s.length() != t.length()) return false;
    
    vector<int> counts(26, 0); // Fixed size 26 = O(1) space
    
    for (int i = 0; i < s.length(); i++) {
        counts[s[i] - 'a']++; // Increment for string s
        counts[t[i] - 'a']--; // Decrement for string t
    }
    
    // If they are anagrams, all counts should return to 0
    for (int count : counts) {
        if (count != 0) return false;
    }
    return true;
}

// 2. Longest Substring Without Repeating Characters (Sliding Window)
// O(N) Time, O(1) Space (assuming 128 ASCII chars)
int lengthOfLongestSubstring(string s) {
    vector<int> lastIndex(128, -1);
    int maxLength = 0;
    int left = 0;
    
    for (int right = 0; right < s.length(); right++) {
        char currentChar = s[right];
        
        // If we have seen this char, move the left pointer past its last occurrence
        if (lastIndex[currentChar] >= left) {
            left = lastIndex[currentChar] + 1;
        }
        
        lastIndex[currentChar] = right; // Update last seen index
        maxLength = max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`,
    dryRun: `### Dry Run: Longest Substring Without Repeating Characters

Given string: \`s = "abcabcbb"\`
We use a sliding window \`[left, right]\` and an array \`lastIndex\` tracking where we last saw each character.

1. **Right = 0 ('a')**:
   - Never seen 'a'.
   - Update \`lastIndex['a'] = 0\`. Window is \`[0, 0]\` ("a"). Max = 1.
2. **Right = 1 ('b')**:
   - Never seen 'b'.
   - Update \`lastIndex['b'] = 1\`. Window is \`[0, 1]\` ("ab"). Max = 2.
3. **Right = 2 ('c')**:
   - Never seen 'c'.
   - Update \`lastIndex['c'] = 2\`. Window is \`[0, 2]\` ("abc"). Max = 3.
4. **Right = 3 ('a')**:
   - We HAVE seen 'a' at index 0. This is >= our \`left\` pointer (0).
   - Collision! We must shrink the window. Move \`left\` to \`lastIndex['a'] + 1\` = 1.
   - The window is now \`[1, 3]\` ("bca"). 
   - Update \`lastIndex['a'] = 3\`. Max remains 3.
5. **Right = 4 ('b')**:
   - We HAVE seen 'b' at index 1. This is >= \`left\` (1).
   - Move \`left\` to \`1 + 1 = 2\`.
   - Window is now \`[2, 4]\` ("cab").
   - Update \`lastIndex['b'] = 4\`. Max remains 3.

This continues until the end. We scanned the string in a single pass \`O(N)\`, tracking the maximum window size perfectly.`,
    complexity: `### Time and Space Constraints

| Operation | Time Complexity | Explanation |
| :--- | :--- | :--- |
| **String Concatenation (Immutable languages)** | \`O(N^2)\` | e.g. Java/Python: \`str += "a"\` creates a completely new string in memory every loop. Use a StringBuilder or list join instead! |
| **Substring Search (Naive)** | \`O(N * M)\` | Scanning for a pattern of length M inside a string of length N. |
| **Substring Search (KMP / Rabin-Karp)** | \`O(N + M)\` | Advanced algorithms that preprocess the pattern to avoid backtracking. |
| **Frequency Counting** | \`O(N)\` | Single pass to populate a size-26 or size-128 integer array. |`,
    problems: `### Classic Problems to Master

1. **[Easy] Valid Palindrome:** Check if a string reads the same forwards and backwards, ignoring punctuation. (Pattern: Two Pointers starting at edges).
2. **[Medium] Group Anagrams:** Given an array of strings, group the anagrams together. (Pattern: Sort each string and use it as a Hash Map key, or generate a frequency string like "1a2b0c...").
3. **[Medium] Find All Anagrams in a String:** (Pattern: Fixed-size sliding window with a frequency array).
4. **[Hard] Minimum Window Substring:** Find the smallest substring in S that contains all characters of T. (Pattern: Dynamic Sliding Window with two frequency maps).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **Immutability Trap:** In Java, Python, and JS, strings are immutable. Doing \`s += "a"\` in a loop of size \`N\` results in \`O(N^2)\` time complexity because it copies the entire string into new memory every iteration. Always use \`StringBuilder\` (Java), \`[].join()\` (Python/JS), or \`std::string::append\` (C++).
- **The Fixed-Array Trick:** Stop using Hash Maps for lowercase English letters. \`int count[26]\` is vastly faster due to caching and avoids hash collision overhead. Space complexity is technically \`O(1)\` because 26 is a constant.
- **ASCII Conversion:** In C++, easily map a lowercase character to a 0-25 index via \`char c = 'b'; int index = c - 'a';\` (results in 1).

> **Checkpoint Question:** Why is checking if two strings are anagrams using a frequency array faster than sorting both strings and comparing them?
> **Answer:** Sorting both strings takes \`O(N log N)\` time. Using a frequency array takes a single pass, resulting in \`O(N)\` time, which is strictly faster for large strings.`
  },
  4: {
    title: "Linked Lists",
    whatIsIt: `A Linked List is a dynamic data structure made up of independent "Nodes". Unlike arrays, which require a massive block of contiguous memory, Linked List nodes are scattered randomly throughout the computer's RAM. 
    
How do they stay together? Each node contains a pointer (a memory address) linking it to the next node in the chain. This distributed architecture makes adding or removing elements incredibly fast (\`O(1)\`)—you just change a couple of pointers. However, you completely lose the ability to instantly jump to an index; finding the 100th element requires walking through the first 99 elements one by one (\`O(N)\`).`,
    concept: `### Node Structure and Pointers

\`\`\`text
Head Pointer                  
     │
   [ 10 | ──────> [ 20 | ──────> [ 30 | NULL ]
   Node 1         Node 2         Node 3
   (Addr 0xA1)    (Addr 0xB2)    (Addr 0xC3)
\`\`\`

- **Head:** The only way to access the list is by holding a reference to the first node (Head). If you lose the Head pointer, the entire list is lost to memory leaks!
- **Tail:** The final node always points to \`NULL\` (or \`nullptr\`), signaling the end of the list.
- **Doubly Linked Lists:** Nodes contain a \`prev\` pointer as well, allowing traversal in both directions at the cost of extra memory.`,
    code: `// C++ Implementation of Linked List operations
#include <bits/stdc++.h>
using namespace std;

// Standard Linked List Node Definition
struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

// 1. Reversing a Linked List (The most common interview question)
// O(N) Time, O(1) Space
ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    
    while (curr != nullptr) {
        ListNode* nextTemp = curr->next; // 1. Save the next node
        curr->next = prev;               // 2. Reverse the pointer
        prev = curr;                     // 3. Move prev forward
        curr = nextTemp;                 // 4. Move curr forward
    }
    
    // prev is now the new head of the reversed list
    return prev; 
}

// 2. Detecting a Cycle (Floyd's Tortoise and Hare Algorithm)
// O(N) Time, O(1) Space
bool hasCycle(ListNode *head) {
    if (!head || !head->next) return false;
    
    ListNode* slow = head;
    ListNode* fast = head;
    
    // Fast moves 2 steps, slow moves 1 step. 
    // If there is a circle, fast will eventually lap slow.
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        
        if (slow == fast) {
            return true; // Cycle detected
        }
    }
    return false;
}`,
    dryRun: `### Dry Run: Reversing a Linked List

Given List: \`1 -> 2 -> 3 -> NULL\`

1. **Initialization:**
   - \`prev = NULL\`
   - \`curr = Node(1)\`
2. **Iteration 1 (curr = 1):**
   - \`nextTemp = 2\` *(save rest of list)*
   - \`curr->next = prev\` *(Node 1 now points to NULL)*
   - \`prev = Node 1\`
   - \`curr = Node 2\`
   *State: NULL <- 1 (prev)   2(curr) -> 3 -> NULL*
3. **Iteration 2 (curr = 2):**
   - \`nextTemp = 3\`
   - \`curr->next = prev\` *(Node 2 now points to Node 1)*
   - \`prev = Node 2\`
   - \`curr = Node 3\`
   *State: NULL <- 1 <- 2(prev)   3(curr) -> NULL*
4. **Iteration 3 (curr = 3):**
   - \`nextTemp = NULL\`
   - \`curr->next = prev\` *(Node 3 now points to Node 2)*
   - \`prev = Node 3\`
   - \`curr = NULL\`
5. **End of Loop:** \`curr\` is NULL. Return \`prev\` (Node 3).
*Final List: 3 -> 2 -> 1 -> NULL*`,
    complexity: `### Time and Space Constraints

| Operation | Time Complexity | Explanation |
| :--- | :--- | :--- |
| **Access by Index** | \`O(N)\` | Must traverse from the Head pointer node-by-node. |
| **Search by Value** | \`O(N)\` | Must check each node sequentially. |
| **Insert/Delete at Head** | \`O(1)\` | Instantly rewire the Head pointer. |
| **Insert/Delete in Middle** | \`O(1)\` | Assuming you *already have a pointer* to the target location, rewiring takes constant time. |`,
    problems: `### Classic Problems to Master

1. **[Easy] Reverse Linked List:** (Pattern: Keep track of previous, current, and next pointers).
2. **[Easy] Merge Two Sorted Lists:** (Pattern: Use a "Dummy Head" node to cleanly build a new list without edge case null checks).
3. **[Medium] Linked List Cycle / Find the Duplicate Number:** (Pattern: Floyd's Fast & Slow Pointers).
4. **[Medium] Remove Nth Node From End of List:** (Pattern: Use two pointers spaced \`N\` steps apart. When the fast pointer hits the end, the slow pointer is right before the target).
5. **[Hard] Reverse Nodes in k-Group:** (Pattern: Complex pointer manipulation in chunks).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **The Dummy Node Strategy:** When a problem requires you to potentially modify or delete the Head of a list, always create a ` + "`" + `Dummy Node` + "`" + ` that points to the head (\`dummy->next = head\`). Iterate using the dummy, and at the end, return \`dummy->next\`. This eliminates 90% of null pointer exceptions and messy if/else blocks.
- **Fast and Slow Pointers:** Also known as the Tortoise and Hare algorithm. It's the ultimate tool for finding the exact middle of a list (fast moves 2x, slow moves 1x; when fast hits the end, slow is in the exact middle) or detecting cycles.
- **Null Pointer Exceptions:** Always check \`if (!node || !node->next)\` before attempting to access \`node->next->next\`.

> **Checkpoint Question:** If inserting into a linked list takes \`O(1)\` time, why does inserting a value at index 500 still take \`O(N)\` time overall?
> **Answer:** While the physical insertion (rewiring the pointers) takes \`O(1)\` time, finding the 500th index requires traversing the list from the beginning, which takes \`O(N)\` time.`
  },
  5: {
    title: "Stacks & Queues",
    whatIsIt: `Stacks and Queues are logical, high-level data structures that control the order in which elements are processed. They can be implemented under the hood using either Arrays or Linked Lists, but they strictly restrict access to enforce their specific ordering rules.

- **Stack:** LIFO (Last In, First Out). Think of a stack of dinner plates. You can only add a plate to the top, and you must take a plate off the top. Used heavily for undo/redo features, parsing syntax (parentheses), and simulating recursion (Call Stack).
- **Queue:** FIFO (First In, First Out). Think of a line of people waiting for a ticket. You join the back of the line, and the person at the front is served first. Used heavily for breadth-first traversals (BFS), task scheduling, and buffering.`,
    concept: `### Data Flow Visualized

**Stack (LIFO)**
Pushing 1, 2, 3:
\`[ 1 ]\` -> \`[ 1, 2 ]\` -> \`[ 1, 2, 3 ]\` (Top is 3)
Pop: Removes and returns 3. Remaining: \`[ 1, 2 ]\`

**Queue (FIFO)**
Enqueueing 1, 2, 3:
\`[ 1 ]\` -> \`[ 1, 2 ]\` -> \`[ 1, 2, 3 ]\` (Front is 1, Back is 3)
Dequeue: Removes and returns 1. Remaining: \`[ 2, 3 ]\`

**Deque (Double Ended Queue)**
A hybrid structure where you can push and pop from both the front AND the back in \`O(1)\` time. Crucial for sliding window algorithms.`,
    code: `// C++ Implementation of Stacks and Queues
#include <bits/stdc++.h>
using namespace std;

// 1. Valid Parentheses using a Stack
// O(N) Time, O(N) Space
bool isValid(string s) {
    stack<char> st;
    
    for (char c : s) {
        // Push opening brackets onto the stack
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            // If we see a closing bracket but stack is empty, it's invalid
            if (st.empty()) return false;
            
            // Check if the closing bracket matches the top of the stack
            char top = st.top();
            if ((c == ')' && top == '(') || 
                (c == '}' && top == '{') || 
                (c == ']' && top == '[')) {
                st.pop(); // Valid pair, remove the opening bracket
            } else {
                return false; // Mismatched pair
            }
        }
    }
    // If the stack is empty, all opening brackets were matched!
    return st.empty();
}

// 2. Queue usage example (BFS stub)
void queueExample() {
    queue<int> q;
    q.push(10); // Enqueue
    q.push(20);
    
    int frontElement = q.front(); // Returns 10 without removing
    q.pop(); // Dequeue (removes 10)
}`,
    dryRun: `### Dry Run: Valid Parentheses

Given string: \`s = "{ [ ] }"\`

1. **Char \`{\`**: It's an opening bracket. Push to stack. Stack: \`['{']\`
2. **Char \`[\`**: It's an opening bracket. Push to stack. Stack: \`['{', '[']\`
3. **Char \`]\`**: It's a closing bracket. 
   - Check \`st.top()\`. It is \`[\`.
   - \`[\` and \`]\` are a valid match.
   - Pop from stack. Stack: \`['{']\`
4. **Char \`}\`**: It's a closing bracket.
   - Check \`st.top()\`. It is \`{\`.
   - \`{\` and \`}\` are a valid match.
   - Pop from stack. Stack: \`[]\` (Empty)
   
**End of string.** The stack is empty, so we return \`true\`. 
*(If the string was \`"{ ]"\`, at step 3, \`]\` would not match \`{\`, returning \`false\` immediately).*`,
    complexity: `### Time and Space Constraints

| Operation | Stack | Queue | Explanation |
| :--- | :--- | :--- | :--- |
| **Push / Enqueue** | \`O(1)\` | \`O(1)\` | Adding to the top/back is instant. |
| **Pop / Dequeue** | \`O(1)\` | \`O(1)\` | Removing from the top/front is instant. |
| **Peek / Top** | \`O(1)\` | \`O(1)\` | Viewing the element to be removed next. |
| **Search / Access** | \`O(N)\` | \`O(N)\` | You must pop elements one by one to find something deep inside. |`,
    problems: `### Classic Problems to Master

1. **[Easy] Valid Parentheses:** (Pattern: Push opening tags, pop and compare when hitting a closing tag).
2. **[Medium] Min Stack:** Design a stack that supports push, pop, top, and retrieving the minimum element in \`O(1)\` time. (Pattern: Use two parallel stacks, one storing values, one storing the running minimum).
3. **[Medium] Daily Temperatures / Next Greater Element:** (Pattern: Monotonic Stack. Maintain a stack of elements that are strictly increasing or decreasing to efficiently find the "next" element that breaks the trend).
4. **[Hard] Sliding Window Maximum:** (Pattern: Monotonic Deque. Store indices in a Deque, removing smaller elements from the back, and popping out-of-bounds indices from the front).`,
    tricks: `### Tricks, Edge Cases, & Common Traps

- **Monotonic Stacks:** The secret weapon for hard array questions. If a question asks you to find the "next greater" or "next smaller" element for every item in an array, a Monotonic Stack will solve it in \`O(N)\` time.
- **Implementing a Queue with Arrays:** Be careful! Removing from the front of a standard Array/Vector takes \`O(N)\` time because of shifting. Real queues use a Linked List or a Ring Buffer Array under the hood to ensure \`O(1)\` Dequeues.
- **Empty Stack Crashes:** Calling \`.pop()\` or \`.top()\` on an empty stack in C++ results in Undefined Behavior (usually a crash). Always check \`!st.empty()\` first.

> **Checkpoint Question:** How can you implement a Queue using only two Stacks?
> **Answer:** Push elements into \`Stack1\`. When a Dequeue is requested, pop all elements from \`Stack1\` and push them into \`Stack2\`. The order reverses, so the bottom of \`Stack1\` (the oldest element) is now the top of \`Stack2\`, ready to be popped.`
  }
};
