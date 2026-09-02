/**
 * Problem: 138. Copy List with Random Pointer
 * Difficulty: Medium
 * Topic: Linked List (Interweaving Nodes)
 * LeetCode Link: https://leetcode.com/problems/copy-list-with-random-pointer/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) auxiliary space
 */

class Node {
public:
    int val;
    Node* next;
    Node* random;
    Node(int _val) {
        val = _val;
        next = nullptr;
        random = nullptr;
    }
};

class Solution {
public:
    Node* copyRandomList(Node* head) {
        if (!head) return nullptr;

        // 1. Interweave cloned nodes with original nodes
        Node* curr = head;
        while (curr) {
            Node* clone = new Node(curr->val);
            clone->next = curr->next;
            curr->next = clone;
            curr = clone->next;
        }

        // 2. Assign random pointers for cloned nodes
        curr = head;
        while (curr) {
            if (curr->random) {
                curr->next->random = curr->random->next;
            }
            curr = curr->next->next;
        }

        // 3. Separate the two lists
        curr = head;
        Node* clonedHead = head->next;
        Node* clonedCurr = clonedHead;

        while (curr) {
            curr->next = curr->next->next;
            clonedCurr->next = clonedCurr->next ? clonedCurr->next->next : nullptr;
            curr = curr->next;
            clonedCurr = clonedCurr->next;
        }

        return clonedHead;
    }
};
