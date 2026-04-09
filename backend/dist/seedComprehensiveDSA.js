"use strict";
/**
 * Comprehensive DSA Curriculum Seeding
 * Seeds all 20 DSA topics with complete theory, code examples, problems, and checkpoints
 * Each topic follows: What is it? → Core concept → C++ code → Dry run → Complexity → 3 Problems → Tricks → Checkpoint
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedComprehensiveDSA = seedComprehensiveDSA;
exports.runComprehensiveSeed = runComprehensiveSeed;
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const allTopicsTutoring_1 = require("./allTopicsTutoring");
const prisma = new client_1.PrismaClient();
// Topic sequence (1-20) exactly as user specified
const TOPICS_SEQUENCE = [
    {
        idx: 1,
        name: "Complexity Analysis",
        slug: "complexity-analysis",
        desc: "Master Big-O notation and algorithm scaling analysis",
    },
    {
        idx: 2,
        name: "Arrays",
        slug: "arrays",
        desc: "Fixed-size contiguous memory and operations",
    },
    {
        idx: 3,
        name: "Strings",
        slug: "strings",
        desc: "Character sequences and string algorithms",
    },
    {
        idx: 4,
        name: "Linked Lists",
        slug: "linked-lists",
        desc: "Pointer-based dynamic data structures",
    },
    {
        idx: 5,
        name: "Stack & Queue",
        slug: "stack-queue",
        desc: "LIFO and FIFO collection patterns",
    },
    {
        idx: 6,
        name: "Hashing",
        slug: "hashing",
        desc: "Hash tables, sets, and hash functions",
    },
    {
        idx: 7,
        name: "Binary Trees",
        slug: "binary-trees",
        desc: "Tree structures and traversal patterns",
    },
    {
        idx: 8,
        name: "Binary Search Trees",
        slug: "binary-search-trees",
        desc: "Ordered trees and self-balancing variants",
    },
    {
        idx: 9,
        name: "Heaps & Priority Queues",
        slug: "heaps",
        desc: "Heap data structures and heap-based algorithms",
    },
    {
        idx: 10,
        name: "Tries",
        slug: "tries",
        desc: "Prefix trees for efficient string operations",
    },
    {
        idx: 11,
        name: "Graphs Basics",
        slug: "graphs-basics",
        desc: "Graph representations and basic traversals",
    },
    {
        idx: 12,
        name: "Sorting Algorithms",
        slug: "sorting",
        desc: "Comparison and non-comparison sorting",
    },
    {
        idx: 13,
        name: "Binary Search",
        slug: "binary-search",
        desc: "Logarithmic search and variations",
    },
    {
        idx: 14,
        name: "Recursion Fundamentals",
        slug: "recursion",
        desc: "Recursive problem solving and memoization",
    },
    {
        idx: 15,
        name: "Backtracking Strategies",
        slug: "backtracking",
        desc: "Exhaustive search with intelligent pruning",
    },
    {
        idx: 16,
        name: "Greedy Algorithms",
        slug: "greedy",
        desc: "Locally optimal choices and correctness",
    },
    {
        idx: 17,
        name: "Dynamic Programming",
        slug: "dynamic-programming",
        desc: "Overlapping subproblems and memoization",
    },
    {
        idx: 18,
        name: "Advanced DSU/Segment Trees/BIT",
        slug: "advanced-ds",
        desc: "Disjoint Set Union, Segment Trees, Binary Indexed Trees",
    },
    {
        idx: 19,
        name: "Bit Manipulation",
        slug: "bit-manipulation",
        desc: "Bitwise operations and bit-level tricks",
    },
    {
        idx: 20,
        name: "Advanced Graphs",
        slug: "advanced-graphs",
        desc: "Dijkstra, MST, Topological Sort, Network Flows",
    },
];
async function seedComprehensiveDSA() {
    try {
        const trackId = (0, crypto_1.randomUUID)();
        const trackSlug = "complete-dsa-bootcamp";
        const trackTitle = "Complete DSA Bootcamp (C++)";
        const trackDescription = "Master all 20 essential DSA topics from complexity analysis to advanced graphs. Theory-first approach with detailed C++ implementations, dry runs, and classic problems.\n\n**Format per topic**: What is it? → Core concept with diagram → C++ implementation → Dry run example → Time & space complexity → 3 classic problems → Common tricks & edge cases → Checkpoint question\n\n**Topics covered**: " +
            TOPICS_SEQUENCE.map((t) => t.name).join(" → ");
        // Delete existing track if it exists (idempotency)
        await prisma.theoryTrack.deleteMany({
            where: { slug: trackSlug },
        });
        // Create main track
        const track = await prisma.theoryTrack.create({
            data: {
                id: trackId,
                slug: trackSlug,
                title: trackTitle,
                description: trackDescription,
                orderIndex: 1,
            },
        });
        let totalModulesCreated = 0;
        let totalLessonsCreated = 0;
        let totalBlocksCreated = 0;
        // Create modules and lessons for each topic
        for (const topic of TOPICS_SEQUENCE) {
            // Create module for each topic
            const moduleId = (0, crypto_1.randomUUID)();
            const module = await prisma.theoryModule.create({
                data: {
                    id: moduleId,
                    trackId: trackId,
                    slug: topic.slug,
                    title: topic.name,
                    summary: topic.desc,
                    orderIndex: topic.idx,
                },
            });
            totalModulesCreated++;
            // Create lesson for comprehensive topic content
            const lessonSlug = topic.slug + "-comprehensive";
            const lessonId = (0, crypto_1.randomUUID)();
            const lesson = await prisma.theoryLesson.create({
                data: {
                    id: lessonId,
                    moduleId: moduleId,
                    slug: lessonSlug,
                    title: `Complete ${topic.name} Guide`,
                    difficulty: topic.idx <= 3
                        ? "BEGINNER"
                        : topic.idx <= 10
                            ? "INTERMEDIATE"
                            : "ADVANCED",
                    estimatedMinutes: 45 + topic.idx * 3,
                    learningObjectives: {
                        objectives: [
                            `Master the theory and fundamentals of ${topic.name}`,
                            `Write production-ready C++ code for ${topic.name} problems`,
                            `Analyze ${topic.name} using Big-O notation`,
                            `Solve 3+ classic LeetCode problems using ${topic.name}`,
                            `Identify ${topic.name} interview tricks and edge cases`,
                        ],
                    },
                },
            });
            totalLessonsCreated++;
            // Generate and create comprehensive theory block
            const theoryContent = (0, allTopicsTutoring_1.generateTopicContent)(topic.idx);
            const theoryBlockId = (0, crypto_1.randomUUID)();
            await prisma.theoryLessonBlock.create({
                data: {
                    id: theoryBlockId,
                    lessonId: lessonId,
                    blockType: "MARKDOWN",
                    orderIndex: 1,
                    content: { markdown: theoryContent },
                },
            });
            totalBlocksCreated++;
            // Add a checkpoint/practice block
            const checkpointId = (0, crypto_1.randomUUID)();
            const checkpointContent = `## 📋 Practice this Topic

After studying this module, try these problems:

### Easy Level
- Implement the basic ${topic.name} data structure
- Solve 1-2 LeetCode problems marked "Easy" for ${topic.name}
- Verify your understanding with the checkpoint question above

### Medium Level  
- Solve 1-2 LeetCode problems marked "Medium"
- Apply the algorithms to real data
- Optimize your code

### Hard Level
- Solve 1-2 LeetCode problems marked "Hard"
- Combine multiple concepts
- Interview-level preparation

---

✨ **Progress**: Once you've completed all practice problems, mark this lesson complete!`;
            await prisma.theoryLessonBlock.create({
                data: {
                    id: checkpointId,
                    lessonId: lessonId,
                    blockType: "MARKDOWN",
                    orderIndex: 2,
                    content: { markdown: checkpointContent },
                },
            });
            totalBlocksCreated++;
        }
        return {
            trackId,
            modulesCreated: totalModulesCreated,
            lessonsCreated: totalLessonsCreated,
            blocksCreated: totalBlocksCreated,
            trackTitle: trackTitle,
        };
    }
    catch (error) {
        console.error("Error seeding comprehensive DSA:", error);
        throw error;
    }
}
// Alternative: Run seeding directly with this function
async function runComprehensiveSeed() {
    try {
        const result = await seedComprehensiveDSA();
        console.log("✅ Comprehensive DSA seed completed:", result);
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}
//# sourceMappingURL=seedComprehensiveDSA.js.map