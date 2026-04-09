#!/bin/bash
# Quick Start Guide for DSA Bootcamp Seeding
# ======================================

echo "🎓 DSA Bootcamp Setup - Quick Start"
echo "===================================="
echo ""

# Step 1: Verify TypeScript compilation
echo "Step 1️⃣ : Verify TypeScript Compilation"
echo "command: cd backend && npx tsc --noEmit"
echo "Expected: No errors"
echo ""

# Step 2: Start backend server
echo "Step 2️⃣ : Start Backend Server"
echo "command: cd backend && npm start"
echo "Expected: Server running on port 3001"
echo ""

# Step 3: Get admin authentication token
echo "Step 3️⃣ : Login as Admin (Get JWT Token)"
echo "command: Login via /api/auth/signin with admin account"
echo "Expected: JWT token returned"
echo ""

# Step 4: Trigger comprehensive seed
echo "Step 4️⃣ : Seed Comprehensive DSA Bootcamp"
echo ""
echo "CURL Command:"
echo "─────────────"
cat << 'EOF'
curl -X POST http://localhost:3001/api/admin/learn/seed-comprehensive \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{}'
EOF
echo ""
echo "Expected Response:"
echo "─────────────────"
cat << 'EOF'
{
  "success": true,
  "trackId": "550e8400-e29b-41d4-a716-446655440000",
  "modulesCreated": 20,
  "lessonsCreated": 20,
  "blocksCreated": 40,
  "trackTitle": "Complete DSA Bootcamp (C++)"
}
EOF
echo ""

# Step 5: Verify in frontend
echo "Step 5️⃣ : Verify in Frontend"
echo "URL: http://localhost:3000/learn"
echo "Expected: New track 'Complete DSA Bootcamp (C++)' appears with 20 topics"
echo ""

# Step 6: Explore content
echo "Step 6️⃣ : Explore Topics"
echo "Navigate through:"
echo "  - Complexity Analysis (topic 1)"
echo "  - Arrays (topic 2)"
echo "  - Any other topics to verify content"
echo ""

echo "✨ Setup Complete!"
echo ""
echo "Topics Seeded (in order):"
echo "1.  Complexity Analysis"
echo "2.  Arrays"
echo "3.  Strings"
echo "4.  Linked Lists"
echo "5.  Stack & Queue"
echo "6.  Hashing"
echo "7.  Binary Trees"
echo "8.  Binary Search Trees"
echo "9.  Heaps & Priority Queues"
echo "10. Tries (Prefix Trees)"
echo "11. Graphs Basics"
echo "12. Sorting Algorithms"
echo "13. Binary Search"
echo "14. Recursion Fundamentals"
echo "15. Backtracking Strategies"
echo "16. Greedy Algorithms"
echo "17. Dynamic Programming"
echo "18. Advanced DSU/Segment Trees/BIT"
echo "19. Bit Manipulation"
echo "20. Advanced Graphs"
echo ""
echo "Each topic includes:"
echo "  ✓ Definition + Real-world analogy"
echo "  ✓ Core concept with ASCII diagram"
echo "  ✓ C++ implementation (working code)"
echo "  ✓ Dry run with step-by-step trace"
echo "  ✓ Time & space complexity table"
echo "  ✓ 3 classic problems (Easy/Medium/Hard)"
echo "  ✓ Common tricks & edge cases"
echo "  ✓ Checkpoint question"
