/**
 * Problem: 146. LRU Cache
 * Difficulty: Medium
 * Topic: Linked List & Hash Map (Design)
 * LeetCode Link: https://leetcode.com/problems/lru-cache/
 * 
 * Complexity:
 * - Time: O(1) for both get and put
 * - Space: O(capacity)
 */

#include <unordered_map>

using namespace std;

class LRUCache {
private:
    struct Node {
        int key, val;
        Node* prev;
        Node* next;
        Node(int k, int v) : key(k), val(v), prev(nullptr), next(nullptr) {}
    };

    int cap;
    unordered_map<int, Node*> map;
    Node* head;
    Node* tail;

    void addNode(Node* node) {
        node->next = head->next;
        node->prev = head;
        head->next->prev = node;
        head->next = node;
    }

    void removeNode(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }

    void moveToHead(Node* node) {
        removeNode(node);
        addNode(node);
    }

    Node* popTail() {
        Node* res = tail->prev;
        removeNode(res);
        return res;
    }

public:
    LRUCache(int capacity) : cap(capacity) {
        head = new Node(-1, -1);
        tail = new Node(-1, -1);
        head->next = tail;
        tail->prev = head;
    }

    int get(int key) {
        if (!map.count(key)) return -1;
        Node* node = map[key];
        moveToHead(node);
        return node->val;
    }

    void put(int key, int value) {
        if (map.count(key)) {
            Node* node = map[key];
            node->val = value;
            moveToHead(node);
        } else {
            Node* newNode = new Node(key, value);
            map[key] = newNode;
            addNode(newNode);

            if (map.size() > cap) {
                Node* tailNode = popTail();
                map.erase(tailNode->key);
                delete tailNode;
            }
        }
    }
};
