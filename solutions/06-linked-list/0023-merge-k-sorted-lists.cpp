/**
 * Problem: 23. Merge k Sorted Lists
 * Difficulty: Hard
 * Topic: Linked List (Min-Heap / Priority Queue)
 * LeetCode Link: https://leetcode.com/problems/merge-k-sorted-lists/
 * 
 * Complexity:
 * - Time: O(N log k) where N is total nodes and k is number of linked lists
 * - Space: O(k) min-heap space
 */

#include <vector>
#include <queue>

using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

class Solution {
private:
    struct Compare {
        bool operator()(ListNode* a, ListNode* b) {
            return a->val > b->val;
        }
    };

public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        priority_queue<ListNode*, vector<ListNode*>, Compare> minHeap;

        for (ListNode* list : lists) {
            if (list) minHeap.push(list);
        }

        ListNode dummy(0);
        ListNode* tail = &dummy;

        while (!minHeap.empty()) {
            ListNode* node = minHeap.top();
            minHeap.pop();

            tail->next = node;
            tail = tail->next;

            if (node->next) {
                minHeap.push(node->next);
            }
        }

        return dummy.next;
    }
};
