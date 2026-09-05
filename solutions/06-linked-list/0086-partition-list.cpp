/**
 * Problem: 86. Partition List
 * Difficulty: Medium
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/partition-list/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* partition(ListNode* head, int x) {
        ListNode lessDummy(0), greaterDummy(0);
        ListNode *less = &lessDummy, *greater = &greaterDummy;
        while (head) {
            if (head->val < x) {
                less->next = head;
                less = less->next;
            } else {
                greater->next = head;
                greater = greater->next;
            }
            head = head->next;
        }
        greater->next = nullptr;
        less->next = greaterDummy.next;
        return lessDummy.next;
    }
};
