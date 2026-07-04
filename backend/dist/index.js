"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const services_1 = require("./services");
const leetcodeService_1 = require("./leetcodeService");
const aiService_1 = require("./aiService");
const templates_1 = require("./templates");
const seedComprehensiveDSA_1 = require("./seedComprehensiveDSA");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3001;
const NEXTAUTH_SECRETS = Array.from(new Set([process.env.NEXTAUTH_SECRET, process.env.AUTH_SECRET]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)));
if (NEXTAUTH_SECRETS.length === 0) {
    throw new Error("NEXTAUTH_SECRET (or AUTH_SECRET) is required");
}
const LOGIN_MAIL_COOLDOWN_MS = 30 * 60 * 1000;
const loginNotificationCache = new Map();
const userCache = new Map();
const corsOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const isProgressStatus = (value) => value === "TODO" || value === "DOING" || value === "DONE";
const isDifficulty = (value) => value === "EASY" || value === "MEDIUM" || value === "HARD";
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const notifyFrom = process.env.NOTIFY_FROM || smtpUser || "noreply@dsa-tracker.local";
const notifyTo = process.env.LOGIN_NOTIFY_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "rajat.sharma.myid1@gmail.com";
const mailTransporter = smtpHost && smtpUser && smtpPass
    ? nodemailer_1.default.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    })
    : null;
const notifyLogin = async (email) => {
    if (!mailTransporter) {
        return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const lastNotifiedAt = loginNotificationCache.get(normalizedEmail) || 0;
    if (Date.now() - lastNotifiedAt < LOGIN_MAIL_COOLDOWN_MS) {
        return;
    }
    try {
        await mailTransporter.sendMail({
            from: notifyFrom,
            to: notifyTo,
            subject: "DSA Tracker login alert",
            text: `A user logged in to DSA Tracker.\n\nEmail: ${normalizedEmail}\nTime (UTC): ${new Date().toISOString()}\n`,
        });
        loginNotificationCache.set(normalizedEmail, Date.now());
    }
    catch (error) {
        console.error("Failed to send login notification email:", error);
    }
};
const buildNextAction = (weakTopics, revisions, solvedLast7d = 0) => {
    const revision = revisions[0];
    if (revision) {
        return {
            mode: "REVISION",
            title: `Review ${revision.title}`,
            topic: revision.topicName,
            reason: `This problem is already due for spaced repetition after ${revision.daysSince} days.`,
            cta: "Open review queue",
            difficulty: "REVIEW",
            estimatedMinutes: Math.max(10, Math.min(45, revision.daysSince * 5)),
        };
    }
    const weakTopic = weakTopics[0];
    if (weakTopic) {
        return {
            mode: "WEAKNESS",
            title: `Practice ${weakTopic.name}`,
            topic: weakTopic.name,
            reason: weakTopic.avgTimeSpent
                ? `This is slowing you down at about ${weakTopic.avgTimeSpent} minutes per solved problem.`
                : weakTopic.completionPct !== undefined
                    ? `This topic is only ${Math.round(weakTopic.completionPct)}% complete.`
                    : "This is one of your weakest topics right now.",
            cta: "Start practice",
            difficulty: "EASY",
            estimatedMinutes: Math.max(20, weakTopic.avgTimeSpent || 20),
        };
    }
    if (solvedLast7d === 0) {
        return {
            mode: "BUILD_MOMENTUM",
            title: "Solve one easy problem",
            topic: "Warm-up",
            reason: "There is not enough recent activity this week. A short warm-up keeps the streak alive.",
            cta: "Pick an easy win",
            difficulty: "EASY",
            estimatedMinutes: 20,
        };
    }
    return {
        mode: "BALANCED",
        title: "Mix review with new practice",
        topic: "Balanced practice",
        reason: "You are in a steady state. Blend one review problem with one new problem to keep recall and growth active.",
        cta: "Open recommendations",
        difficulty: "MEDIUM",
        estimatedMinutes: 30,
    };
};
const getNextRevisionInterval = (currentInterval) => {
    if (currentInterval <= 0)
        return 2;
    if (currentInterval <= 2)
        return 7;
    if (currentInterval <= 7)
        return 21;
    return Math.max(21, Math.round(currentInterval * 1.6));
};
app.use((0, cors_1.default)(corsOrigins.length > 0
    ? {
        origin: corsOrigins,
        credentials: true,
    }
    : undefined));
app.use(express_1.default.json());
// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Auth Header: ${req.headers.authorization ? "Present" : "Missing"}`);
    next();
});
// Auto-admin hook for specific email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
const resolveAuthenticatedUser = async (authHeader) => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.split(" ")[1];
    let decoded = null;
    for (const secret of NEXTAUTH_SECRETS) {
        try {
            decoded = jsonwebtoken_1.default.verify(token, secret);
            break;
        }
        catch {
            // Try next secret candidate.
        }
    }
    if (!decoded?.email) {
        return null;
    }
    let user = userCache.get(decoded.email.toLowerCase());
    if (!user) {
        const dbUser = (await prisma.user.upsert({
            where: { email: decoded.email },
            update: {},
            create: {
                email: decoded.email,
                role: "USER",
            },
        }));
        user = { id: dbUser.id, email: dbUser.email, role: dbUser.role };
        if (ADMIN_EMAIL &&
            user.email.toLowerCase() === ADMIN_EMAIL &&
            user.role !== "ADMIN") {
            const promoted = await prisma.user.update({
                where: { id: user.id },
                data: { role: "ADMIN" },
            });
            user.role = promoted.role;
        }
        userCache.set(user.email.toLowerCase(), user);
    }
    await notifyLogin(decoded.email);
    return { id: user.id, role: user.role };
};
// Authentication Middleware
const requireAuth = async (req, res, next) => {
    try {
        const user = await resolveAuthenticatedUser(req.headers.authorization);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};
const attachOptionalAuth = async (req, _res, next) => {
    try {
        const user = await resolveAuthenticatedUser(req.headers.authorization);
        if (user) {
            req.user = user;
        }
    }
    catch {
        // Public browse routes should still work without auth.
    }
    next();
};
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    next();
};
// 1. Get Dashboard Stats
app.get("/api/dashboard", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [totalProblems, solvedProblems, streak, weakTopics, revisions] = await Promise.all([
            prisma.problem.count(),
            prisma.progress.count({
                where: { userId, status: "DONE" },
            }),
            prisma.streak.findUnique({
                where: { userId },
            }),
            (0, services_1.getWeakTopics)(userId),
            (0, services_1.getRevisionReminders)(userId),
        ]);
        const nextAction = buildNextAction(weakTopics, revisions);
        res.json({
            totalProblems,
            solvedProblems,
            progressPercentage: totalProblems === 0
                ? 0
                : Math.round((solvedProblems / totalProblems) * 100),
            currentStreak: streak?.currentStreak || 0,
            longestStreak: streak?.longestStreak || 0,
            weakTopics,
            revisions,
            nextAction,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// 2. Get All Topics with Progress
app.get("/api/topics", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const topics = await prisma.topic.findMany({
            include: {
                problems: {
                    include: {
                        progress: {
                            where: { userId },
                        },
                    },
                },
            },
            orderBy: { orderIndex: "asc" },
        });
        const enrichedTopics = topics.map((topic) => {
            const total = topic.problems.length;
            const solved = topic.problems.filter((p) => p.progress[0]?.status === "DONE").length;
            return {
                id: topic.id,
                name: topic.name,
                description: topic.description,
                totalProblems: total,
                solvedProblems: solved,
                progressPercentage: total === 0 ? 0 : Math.round((solved / total) * 100),
            };
        });
        res.json(enrichedTopics);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
// 3. Get Problems for a Topic
app.get("/api/topics/:topicId/problems", requireAuth, async (req, res) => {
    try {
        const topicId = req.params.topicId;
        const userId = req.user.id;
        const problems = await prisma.problem.findMany({
            where: { topicId },
            include: {
                progress: {
                    where: { userId },
                },
            },
            orderBy: { orderIndex: "asc" },
        });
        const enrichedProblems = problems.map((problem) => ({
            ...problem,
            status: problem.progress[0]?.status || "TODO",
            timeSpent: problem.progress[0]?.timeSpent || 0,
            leetcodeRuntime: problem.progress[0]?.leetcodeRuntime || null,
            leetcodeMemory: problem.progress[0]?.leetcodeMemory || null,
        }));
        res.json(enrichedProblems);
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get Single Problem by ID
app.get("/api/problems/:problemId", requireAuth, async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const userId = req.user.id;
        const problem = await prisma.problem.findUnique({
            where: { id: problemId },
            include: {
                topic: true,
                progress: {
                    where: { userId },
                },
            },
        });
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }
        const enrichedProblem = {
            ...problem,
            status: problem.progress[0]?.status || "TODO",
            timeSpent: problem.progress[0]?.timeSpent || 0,
            leetcodeRuntime: problem.progress[0]?.leetcodeRuntime || null,
            leetcodeMemory: problem.progress[0]?.leetcodeMemory || null,
        };
        res.json(enrichedProblem);
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});
// === THEORY / LEARN ROUTES ===
const BASE_FALLBACK_LEARN_TRACKS = [
    {
        id: "fallback-track-cpp-foundations",
        slug: "cpp-foundations",
        title: "C++ Foundations",
        description: "Build language fluency and complexity instincts for interviews.",
        orderIndex: 1,
        totalLessons: 4,
        completedLessons: 0,
        progressPercent: 0,
        modules: [
            {
                id: "fallback-module-cpp-basics",
                slug: "cpp-basics-for-dsa",
                title: "C++ Basics For DSA",
                summary: "Syntax, STL, complexity, and memory-safe patterns.",
                orderIndex: 1,
                estimatedMinutes: 60,
                totalLessons: 2,
                completedLessons: 0,
                progressPercent: 0,
                lessons: [
                    {
                        id: "fallback-lesson-setup-complexity",
                        slug: "cpp-setup-and-complexity",
                        title: "C++ Setup and Big-O",
                        summary: "Understand compilation, STL basics, and runtime complexity.",
                        orderIndex: 1,
                        estimatedMinutes: 20,
                        difficulty: "BEGINNER",
                        status: "NOT_STARTED",
                        progressPercent: 0,
                        learningObjectives: [
                            "Understand O(1), O(log n), O(n), O(n log n)",
                            "Write fast I/O boilerplate in C++",
                            "Know when vectors vs arrays matter",
                        ],
                    },
                    {
                        id: "fallback-lesson-hashmap-two-pointer",
                        slug: "cpp-hashmap-and-two-pointer",
                        title: "HashMap and Two Pointer Patterns",
                        summary: "Theory behind two common interview optimization patterns.",
                        orderIndex: 2,
                        estimatedMinutes: 25,
                        difficulty: "BEGINNER",
                        status: "NOT_STARTED",
                        progressPercent: 0,
                        learningObjectives: [
                            "Identify when to use unordered_map",
                            "Convert brute force to linear scans",
                            "Avoid common two-pointer edge cases",
                        ],
                    },
                ],
            },
            {
                id: "fallback-module-cpp-advanced",
                slug: "cpp-memory-and-templates",
                title: "Memory and Templates",
                summary: "References, pointers, and template utilities for cleaner code.",
                orderIndex: 2,
                estimatedMinutes: 70,
                totalLessons: 2,
                completedLessons: 0,
                progressPercent: 0,
                lessons: [
                    {
                        id: "fallback-lesson-pointers-references",
                        slug: "pointers-references-and-raii",
                        title: "Pointers, References, and RAII",
                        summary: "Master safe memory handling in competitive coding contexts.",
                        orderIndex: 1,
                        estimatedMinutes: 30,
                        difficulty: "INTERMEDIATE",
                        status: "NOT_STARTED",
                        progressPercent: 0,
                        learningObjectives: [
                            "Differentiate stack and heap allocation",
                            "Use references to avoid unnecessary copies",
                            "Apply RAII for exception-safe resource management",
                        ],
                    },
                    {
                        id: "fallback-lesson-template-patterns",
                        slug: "template-patterns-for-dsa",
                        title: "Template Patterns for DSA",
                        summary: "Use templates and helpers to build reusable solutions.",
                        orderIndex: 2,
                        estimatedMinutes: 25,
                        difficulty: "INTERMEDIATE",
                        status: "NOT_STARTED",
                        progressPercent: 0,
                        learningObjectives: [
                            "Write generic helper functions",
                            "Use lambda comparators with STL",
                            "Avoid template overengineering in interviews",
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "fallback-track-algorithmic-patterns",
        slug: "algorithmic-patterns",
        title: "Algorithmic Patterns",
        description: "Learn transferable patterns used across most DSA questions.",
        orderIndex: 2,
        totalLessons: 4,
        completedLessons: 0,
        progressPercent: 0,
        modules: [
            {
                id: "fallback-module-linear-patterns",
                slug: "linear-patterns",
                title: "Linear Scan Patterns",
                summary: "Two pointers, sliding windows, and prefix transforms.",
                orderIndex: 1,
                estimatedMinutes: 75,
                totalLessons: 2,
                completedLessons: 0,
                progressPercent: 0,
                lessons: [
                    {
                        id: "fallback-lesson-two-pointers",
                        slug: "two-pointers-mastery",
                        title: "Two Pointers Mastery",
                        summary: "Sort + sweep strategy for pair and range problems.",
                        orderIndex: 1,
                        estimatedMinutes: 35,
                        difficulty: "BEGINNER",
                        status: "NOT_STARTED",
                        progressPercent: 0,
                        learningObjectives: [
                            "Recognize monotonic movement opportunities",
                            "Track invariants while moving pointers",
                            "Handle duplicates and boundary conditions",
                        ],
                    },
                    {
                        id: "fallback-lesson-sliding-window",
                        slug: "sliding-window-system",
                        title: "Sliding Window System",
                        summary: "Expand/contract windows to optimize contiguous ranges.",
                        orderIndex: 2,
                        estimatedMinutes: 30,
                        difficulty: "INTERMEDIATE",
                        status: "NOT_STARTED",
                        progressPercent: 0,
                        learningObjectives: [
                            "Model fixed vs variable windows",
                            "Track counts/frequencies efficiently",
                            "Convert nested loops to linear scans",
                        ],
                    },
                ],
            },
            {
                id: "fallback-module-state-patterns",
                slug: "state-patterns",
                title: "State Transition Patterns",
                summary: "Greedy choices, dynamic programming, and state compression.",
                orderIndex: 2,
                estimatedMinutes: 80,
                totalLessons: 2,
                completedLessons: 0,
                progressPercent: 0,
                lessons: [
                    {
                        id: "fallback-lesson-greedy-proof",
                        slug: "greedy-choice-proofing",
                        title: "Greedy Choice Proofing",
                        summary: "When local optimum decisions lead to global optimum.",
                        orderIndex: 1,
                        estimatedMinutes: 30,
                        difficulty: "INTERMEDIATE",
                        status: "NOT_STARTED",
                        progressPercent: 0,
                        learningObjectives: [
                            "Identify exchange arguments",
                            "Prove correctness with invariants",
                            "Spot cases where greedy fails",
                        ],
                    },
                    {
                        id: "fallback-lesson-dp-transitions",
                        slug: "dp-state-transitions",
                        title: "DP State Transitions",
                        summary: "Design states, transitions, and base cases systematically.",
                        orderIndex: 2,
                        estimatedMinutes: 40,
                        difficulty: "ADVANCED",
                        status: "NOT_STARTED",
                        progressPercent: 0,
                        learningObjectives: [
                            "Define minimal sufficient state",
                            "Optimize recursion to tabulation",
                            "Reduce dimensions when dependencies allow",
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "fallback-track-data-structures",
        slug: "data-structures-systems",
        title: "Data Structure Systems",
        description: "Core structures and traversal logic used in problem solving.",
        orderIndex: 3,
        totalLessons: 4,
        completedLessons: 0,
        progressPercent: 0,
        modules: [
            {
                id: "fallback-module-trees-graphs",
                slug: "trees-and-graphs",
                title: "Trees and Graphs",
                summary: "Traversal strategies and path/state representations.",
                orderIndex: 1,
                estimatedMinutes: 90,
                totalLessons: 2,
                completedLessons: 0,
                progressPercent: 0,
                lessons: [
                    {
                        id: "fallback-lesson-tree-traversals",
                        slug: "tree-traversal-playbook",
                        title: "Tree Traversal Playbook",
                        summary: "DFS/BFS templates and subtree decomposition methods.",
                        orderIndex: 1,
                        estimatedMinutes: 35,
                        difficulty: "BEGINNER",
                        status: "NOT_STARTED",
                        progressPercent: 0,
                        learningObjectives: [
                            "Choose preorder/inorder/postorder intentionally",
                            "Use recursion and iterative stack forms",
                            "Model subtree return values cleanly",
                        ],
                    },
                    {
                        id: "fallback-lesson-graph-traversal",
                        slug: "graph-traversal-toolkit",
                        title: "Graph Traversal Toolkit",
                        summary: "Visited-state, components, and shortest-path basics.",
                        orderIndex: 2,
                        estimatedMinutes: 40,
                        difficulty: "INTERMEDIATE",
                        status: "NOT_STARTED",
                        progressPercent: 0,
                        learningObjectives: [
                            "Represent graphs as adjacency lists",
                            "Use BFS for unweighted shortest paths",
                            "Detect cycles and connected components",
                        ],
                    },
                ],
            },
            {
                id: "fallback-module-heaps-tries",
                slug: "heaps-and-tries",
                title: "Heaps and Tries",
                summary: "Priority queues and prefix-indexed retrieval patterns.",
                orderIndex: 2,
                estimatedMinutes: 65,
                totalLessons: 2,
                completedLessons: 0,
                progressPercent: 0,
                lessons: [
                    {
                        id: "fallback-lesson-heaps-priority",
                        slug: "heaps-priority-queues",
                        title: "Heaps and Priority Queues",
                        summary: "Top-k, scheduling, and streaming statistics problems.",
                        orderIndex: 1,
                        estimatedMinutes: 30,
                        difficulty: "INTERMEDIATE",
                        status: "NOT_STARTED",
                        progressPercent: 0,
                        learningObjectives: [
                            "Pick min-heap vs max-heap approaches",
                            "Maintain top-k efficiently",
                            "Use lazy deletion when needed",
                        ],
                    },
                    {
                        id: "fallback-lesson-tries-prefix",
                        slug: "tries-and-prefix-indexing",
                        title: "Tries and Prefix Indexing",
                        summary: "Prefix search, dictionary constraints, and pruning.",
                        orderIndex: 2,
                        estimatedMinutes: 30,
                        difficulty: "ADVANCED",
                        status: "NOT_STARTED",
                        progressPercent: 0,
                        learningObjectives: [
                            "Model node structure for character sets",
                            "Balance memory and lookup speed",
                            "Combine Trie with DFS backtracking",
                        ],
                    },
                ],
            },
        ],
    },
];
const TARGET_FALLBACK_LESSON_COUNT = 65;
const expandFallbackLearnTracks = (tracks) => {
    const expanded = tracks.map((track) => ({
        ...track,
        modules: track.modules.map((module) => ({
            ...module,
            lessons: module.lessons.map((lesson) => ({ ...lesson })),
        })),
    }));
    const countLessons = () => expanded.reduce((trackSum, track) => trackSum +
        track.modules.reduce((moduleSum, module) => moduleSum + module.lessons.length, 0), 0);
    let runningIndex = countLessons() + 1;
    let trackCursor = 0;
    while (countLessons() < TARGET_FALLBACK_LESSON_COUNT) {
        const track = expanded[trackCursor % expanded.length];
        const module = track.modules[trackCursor % track.modules.length];
        const lessonNumber = module.lessons.length + 1;
        module.lessons.push({
            id: `fallback-lesson-${track.slug}-${module.slug}-${runningIndex}`,
            slug: `lesson-${module.slug}-${runningIndex}`,
            title: `Practice Theory ${runningIndex}`,
            summary: `Concept reinforcement lesson ${runningIndex} for ${module.title}.`,
            orderIndex: lessonNumber,
            estimatedMinutes: 20 + (runningIndex % 4) * 5,
            difficulty: runningIndex % 5 === 0
                ? "ADVANCED"
                : runningIndex % 2 === 0
                    ? "INTERMEDIATE"
                    : "BEGINNER",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
                `Apply pattern ${runningIndex} in interview-style constraints`,
                "Choose the right data structure for trade-offs",
                "Write and reason about edge cases quickly",
            ],
        });
        runningIndex += 1;
        trackCursor += 1;
    }
    for (const track of expanded) {
        for (const module of track.modules) {
            module.totalLessons = module.lessons.length;
            module.completedLessons = 0;
            module.progressPercent = 0;
        }
        track.totalLessons = track.modules.reduce((sum, module) => sum + module.lessons.length, 0);
        track.completedLessons = 0;
        track.progressPercent = 0;
    }
    return expanded;
};
const FALLBACK_LEARN_TRACKS = expandFallbackLearnTracks(BASE_FALLBACK_LEARN_TRACKS);
const toSentence = (value) => {
    const trimmed = value.trim();
    if (!trimmed)
        return "";
    return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};
const normalizeLearningObjectives = (value) => {
    if (!Array.isArray(value))
        return [];
    return value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
};
const buildDetailedLessonMarkdown = (params) => {
    const { trackTitle, moduleTitle, lessonTitle, lessonSummary, learningObjectives, } = params;
    const objectiveLines = learningObjectives.length > 0
        ? learningObjectives
            .map((objective) => `- ${toSentence(objective)}`)
            .join("\n")
        : "- Understand the core pattern and why it is preferred over brute force.\n- Analyze time-space trade-offs before coding.\n- Validate edge cases with a dry run.";
    const summaryLine = lessonSummary
        ? toSentence(lessonSummary)
        : `${lessonTitle} builds an interview-ready mental model for ${moduleTitle.toLowerCase()} problems.`;
    return [
        `### Detailed Theory`,
        `${summaryLine}`,
        "",
        `This lesson belongs to **${trackTitle}** and focuses on **${moduleTitle}**. Use this flow whenever you solve a related problem:`,
        "1. Identify the input shape and constraints.",
        "2. Map the problem to the underlying pattern.",
        "3. Choose the most efficient data structure for that pattern.",
        "4. Validate with edge cases before finalizing code.",
        "",
        `### Topic Objectives`,
        `${objectiveLines}`,
        "",
        `### Example`,
        `Suppose you are solving a **${lessonTitle}** style question. Start with a small input and manually trace your state transitions at each step. Track the invariant (what always remains true) while updating pointers, indices, recursion state, or helper structures. This dry run highlights bugs early and reveals whether your approach is truly optimal.`,
        "",
        `### Practice Question`,
        `Design and solve one interview-level problem for **${moduleTitle}** where a brute-force approach is too slow.`,
        `- Write the brute-force complexity and explain why it fails constraints.`,
        `- Derive an optimized approach using the pattern from **${lessonTitle}**.`,
        `- Provide final time and space complexity and test at least 3 edge cases.`,
    ].join("\n");
};
const appendDetailedTheoryBlock = (params) => {
    const { blocks, lessonId, trackTitle, moduleTitle, lessonTitle, lessonSummary, learningObjectives, } = params;
    const alreadyHasPracticePrompt = blocks.some((block) => {
        if (block.blockType !== "MARKDOWN")
            return false;
        if (typeof block.content !== "object" || block.content === null)
            return false;
        const markdown = block.content.markdown;
        return (typeof markdown === "string" &&
            /practice question|detailed theory|### example/i.test(markdown));
    });
    if (alreadyHasPracticePrompt) {
        return blocks;
    }
    const nextOrder = blocks.length > 0
        ? Math.max(...blocks.map((block) => Number(block.orderIndex) || 0)) + 1
        : 1;
    return [
        ...blocks,
        {
            id: `${lessonId}-auto-theory-practice`,
            blockType: "MARKDOWN",
            orderIndex: nextOrder,
            content: {
                markdown: buildDetailedLessonMarkdown({
                    trackTitle,
                    moduleTitle,
                    lessonTitle,
                    lessonSummary,
                    learningObjectives,
                }),
            },
            language: null,
        },
    ];
};
const getFallbackLearnLesson = (trackSlug, moduleSlug, lessonSlug) => {
    const track = FALLBACK_LEARN_TRACKS.find((t) => t.slug === trackSlug);
    if (!track)
        return null;
    const module = track.modules.find((m) => m.slug === moduleSlug);
    if (!module)
        return null;
    const lesson = module.lessons.find((l) => l.slug === lessonSlug);
    if (!lesson)
        return null;
    const learningObjectives = normalizeLearningObjectives(lesson.learningObjectives);
    const blocks = [
        {
            id: `${lesson.id}-block-1`,
            blockType: "MARKDOWN",
            orderIndex: 1,
            content: {
                markdown: buildDetailedLessonMarkdown({
                    trackTitle: track.title,
                    moduleTitle: module.title,
                    lessonTitle: lesson.title,
                    lessonSummary: lesson.summary,
                    learningObjectives,
                }),
            },
            language: null,
        },
        {
            id: `${lesson.id}-block-2`,
            blockType: "MARKDOWN",
            orderIndex: 2,
            content: {
                markdown: `### Learning Objectives\n${learningObjectives.map((o) => `- ${toSentence(o)}`).join("\\n")}`,
            },
            language: null,
        },
    ];
    return {
        lesson: {
            id: lesson.id,
            title: lesson.title,
            summary: lesson.summary,
            difficulty: lesson.difficulty,
            estimatedMinutes: lesson.estimatedMinutes,
            learningObjectives,
            module: {
                id: module.id,
                title: module.title,
                slug: module.slug,
            },
            track: {
                title: track.title,
                slug: track.slug,
            },
        },
        blocks,
        progress: {
            status: "NOT_STARTED",
            progressPercent: 0,
            timeSpentSeconds: 0,
            completedAt: null,
        },
        isUnlocked: false,
        siblings: module.lessons.map((s) => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            orderIndex: s.orderIndex,
            status: "NOT_STARTED",
        })),
        problems: [],
    };
};
const ensureTheorySchemaExists = async () => {
    await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TheoryDifficulty') THEN
        CREATE TYPE "TheoryDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
      END IF;
    END
    $$;
  `);
    await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TheoryBlockType') THEN
        CREATE TYPE "TheoryBlockType" AS ENUM ('MARKDOWN', 'CODE', 'NOTE', 'QUIZ', 'IMAGE');
      END IF;
    END
    $$;
  `);
    await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TheoryProgressStatus') THEN
        CREATE TYPE "TheoryProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
      END IF;
    END
    $$;
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS theory_tracks (
      id uuid PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      description text NULL,
      order_index integer NOT NULL DEFAULT 0,
      is_published boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS theory_modules (
      id uuid PRIMARY KEY,
      track_id uuid NOT NULL REFERENCES theory_tracks(id) ON DELETE CASCADE,
      topic_id uuid NULL REFERENCES "Topic"(id) ON DELETE SET NULL,
      slug text NOT NULL,
      title text NOT NULL,
      summary text NULL,
      order_index integer NOT NULL DEFAULT 0,
      estimated_minutes integer NOT NULL DEFAULT 0,
      is_published boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW(),
      UNIQUE(track_id, slug)
    );
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS theory_lessons (
      id uuid PRIMARY KEY,
      module_id uuid NOT NULL REFERENCES theory_modules(id) ON DELETE CASCADE,
      slug text NOT NULL,
      title text NOT NULL,
      summary text NULL,
      order_index integer NOT NULL DEFAULT 0,
      difficulty "TheoryDifficulty" NOT NULL DEFAULT 'BEGINNER',
      estimated_minutes integer NOT NULL DEFAULT 0,
      learning_objectives jsonb NULL,
      is_published boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW(),
      UNIQUE(module_id, slug)
    );
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS theory_lesson_blocks (
      id uuid PRIMARY KEY,
      lesson_id uuid NOT NULL REFERENCES theory_lessons(id) ON DELETE CASCADE,
      block_type "TheoryBlockType" NOT NULL,
      order_index integer NOT NULL,
      content jsonb NOT NULL,
      language text NULL,
      UNIQUE(lesson_id, order_index)
    );
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS theory_problem_links (
      id uuid PRIMARY KEY,
      lesson_id uuid NULL REFERENCES theory_lessons(id) ON DELETE CASCADE,
      module_id uuid NULL REFERENCES theory_modules(id) ON DELETE CASCADE,
      problem_id uuid NOT NULL REFERENCES "Problem"(id) ON DELETE CASCADE,
      required boolean NOT NULL DEFAULT true,
      order_index integer NOT NULL DEFAULT 0
    );
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_theory_lesson_progress (
      user_id uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      lesson_id uuid NOT NULL REFERENCES theory_lessons(id) ON DELETE CASCADE,
      status "TheoryProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
      progress_percent integer NOT NULL DEFAULT 0,
      time_spent_seconds integer NOT NULL DEFAULT 0,
      completed_at timestamptz NULL,
      last_seen_block_id text NULL,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW(),
      PRIMARY KEY(user_id, lesson_id)
    );
  `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_theory_modules_topic_id ON theory_modules(topic_id);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_theory_problem_links_lesson_id ON theory_problem_links(lesson_id);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_theory_problem_links_module_id ON theory_problem_links(module_id);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_theory_problem_links_problem_id ON theory_problem_links(problem_id);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_user_theory_lesson_progress_lesson_id ON user_theory_lesson_progress(lesson_id);`);
};
const seedStarterTheoryContent = async () => {
    await ensureTheorySchemaExists();
    const publishedTrackCount = await prisma.$queryRaw `
    SELECT COUNT(*)::bigint AS count FROM theory_tracks WHERE is_published = true
  `;
    if (Number(publishedTrackCount[0]?.count || 0) > 0) {
        return {
            seeded: false,
            tracks: 0,
            modules: 0,
            lessons: 0,
            message: "Published theory data already exists",
        };
    }
    const totalTrackCount = await prisma.$queryRaw `
    SELECT COUNT(*)::bigint AS count FROM theory_tracks
  `;
    if (Number(totalTrackCount[0]?.count || 0) > 0) {
        await prisma.$executeRaw `
      UPDATE theory_tracks
      SET is_published = true, updated_at = NOW()
      WHERE is_published = false
    `;
        await prisma.$executeRaw `
      UPDATE theory_modules
      SET is_published = true, updated_at = NOW()
      WHERE is_published = false
    `;
        await prisma.$executeRaw `
      UPDATE theory_lessons
      SET is_published = true, updated_at = NOW()
      WHERE is_published = false
    `;
        return {
            seeded: false,
            tracks: 0,
            modules: 0,
            lessons: 0,
            message: "Published existing theory data",
        };
    }
    const arraysTopic = await prisma.topic.findFirst({
        where: { name: { contains: "Array", mode: "insensitive" } },
    });
    const starterProblems = await prisma.problem.findMany({
        where: arraysTopic ? { topicId: arraysTopic.id } : undefined,
        orderBy: [{ orderIndex: "asc" }],
        take: 3,
    });
    const trackId = (0, crypto_1.randomUUID)();
    const moduleId = (0, crypto_1.randomUUID)();
    const lessonOneId = (0, crypto_1.randomUUID)();
    const lessonTwoId = (0, crypto_1.randomUUID)();
    await prisma.$executeRaw `
    INSERT INTO theory_tracks (id, slug, title, description, order_index, is_published, created_at, updated_at)
    VALUES (
      ${trackId},
      'cpp-foundations',
      'C++ Foundations',
      'Learn core C++ theory before solving DSA questions.',
      1,
      true,
      NOW(),
      NOW()
    )
  `;
    await prisma.$executeRaw `
    INSERT INTO theory_modules (id, track_id, topic_id, slug, title, summary, order_index, estimated_minutes, is_published, created_at, updated_at)
    VALUES (
      ${moduleId},
      ${trackId},
      ${arraysTopic?.id || null},
      'cpp-basics-for-dsa',
      'C++ Basics For DSA',
      'Syntax, data structures, and complexity thinking with C++.',
      1,
      45,
      true,
      NOW(),
      NOW()
    )
  `;
    await prisma.$executeRaw `
    INSERT INTO theory_lessons (id, module_id, slug, title, summary, order_index, difficulty, estimated_minutes, learning_objectives, is_published, created_at, updated_at)
    VALUES (
      ${lessonOneId},
      ${moduleId},
      'cpp-setup-and-complexity',
      'C++ Setup and Big-O',
      'Understand compilation, STL basics, and runtime complexity.',
      1,
      'BEGINNER',
      20,
      ${JSON.stringify([
        "Understand O(1), O(log n), O(n), O(n log n)",
        "Write fast I/O boilerplate in C++",
        "Know when vectors vs arrays matter",
    ])}::jsonb,
      true,
      NOW(),
      NOW()
    )
  `;
    await prisma.$executeRaw `
    INSERT INTO theory_lessons (id, module_id, slug, title, summary, order_index, difficulty, estimated_minutes, learning_objectives, is_published, created_at, updated_at)
    VALUES (
      ${lessonTwoId},
      ${moduleId},
      'cpp-hashmap-and-two-pointer',
      'HashMap and Two Pointer Patterns',
      'Theory behind two most common interview patterns.',
      2,
      'BEGINNER',
      25,
      ${JSON.stringify([
        "Identify when to use unordered_map",
        "Convert brute force to linear scans",
        "Avoid common two-pointer edge cases",
    ])}::jsonb,
      true,
      NOW(),
      NOW()
    )
  `;
    const lessonOneBlocks = [
        {
            type: "MARKDOWN",
            content: {
                markdown: "### Why theory before problems?\nStrong fundamentals reduce trial-and-error coding and improve interview speed.",
            },
        },
        {
            type: "CODE",
            content: {
                title: "Fast I/O template",
                code: "ios_base::sync_with_stdio(false);\\ncin.tie(nullptr);",
            },
            language: "cpp",
        },
        {
            type: "NOTE",
            content: {
                markdown: "For many DSA questions, reducing nested loops to one pass is the main optimization goal.",
            },
        },
    ];
    for (let i = 0; i < lessonOneBlocks.length; i++) {
        const block = lessonOneBlocks[i];
        await prisma.$executeRaw `
      INSERT INTO theory_lesson_blocks (id, lesson_id, block_type, order_index, content, language)
      VALUES (
        ${(0, crypto_1.randomUUID)()},
        ${lessonOneId},
        ${block.type}::"TheoryBlockType",
        ${i + 1},
        ${JSON.stringify(block.content)}::jsonb,
        ${block.language || null}
      )
    `;
    }
    const lessonTwoBlocks = [
        {
            type: "MARKDOWN",
            content: {
                markdown: "### Hash map pattern\nUse value->index maps when you need complement lookup in constant average time.",
            },
        },
        {
            type: "MARKDOWN",
            content: {
                markdown: "### Two pointer pattern\nUse left/right pointers on sorted data when target conditions depend on pair sums or windows.",
            },
        },
    ];
    for (let i = 0; i < lessonTwoBlocks.length; i++) {
        const block = lessonTwoBlocks[i];
        await prisma.$executeRaw `
      INSERT INTO theory_lesson_blocks (id, lesson_id, block_type, order_index, content, language)
      VALUES (
        ${(0, crypto_1.randomUUID)()},
        ${lessonTwoId},
        ${block.type}::"TheoryBlockType",
        ${i + 1},
        ${JSON.stringify(block.content)}::jsonb,
        NULL
      )
    `;
    }
    for (let i = 0; i < starterProblems.length; i++) {
        await prisma.$executeRaw `
      INSERT INTO theory_problem_links (id, lesson_id, module_id, problem_id, required, order_index)
      VALUES (
        ${(0, crypto_1.randomUUID)()},
        ${lessonTwoId},
        NULL,
        ${starterProblems[i].id},
        true,
        ${i + 1}
      )
    `;
    }
    return {
        seeded: true,
        tracks: 1,
        modules: 1,
        lessons: 2,
    };
};
app.get("/api/learn/tracks", attachOptionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id ?? null;
        let tracks = await prisma.$queryRaw `
      SELECT
        id,
        slug,
        title,
        description,
        "orderIndex"
      FROM theory_tracks
      WHERE "isPublished" = true
      ORDER BY "orderIndex" ASC, "createdAt" ASC
    `;
        if (tracks.length === 0) {
            try {
                await seedStarterTheoryContent();
                tracks = await prisma.$queryRaw `
          SELECT
            id,
            slug,
            title,
            description,
            "orderIndex"
          FROM theory_tracks
          WHERE "isPublished" = true
          ORDER BY "orderIndex" ASC, "createdAt" ASC
        `;
            }
            catch (seedError) {
                console.error("Auto-seed learn tracks failed:", seedError);
            }
            if (tracks.length === 0) {
                return res.json(FALLBACK_LEARN_TRACKS);
            }
        }
        const trackIds = tracks.map((t) => t.id);
        const modules = await prisma.$queryRaw(client_1.Prisma.sql `
      SELECT
        id,
        "trackId",
        slug,
        title,
        summary,
        "orderIndex",
        "estimatedMinutes"
      FROM theory_modules
      WHERE "isPublished" = true
        AND "trackId" IN (${client_1.Prisma.join(trackIds)})
      ORDER BY "orderIndex" ASC, "createdAt" ASC
    `);
        const moduleIds = modules.map((m) => m.id);
        const lessons = moduleIds.length > 0
            ? await prisma.$queryRaw(client_1.Prisma.sql `
          SELECT
            id,
            "moduleId",
            slug,
            title,
            summary,
            "orderIndex",
            "estimatedMinutes",
            difficulty::text AS difficulty
          FROM theory_lessons
          WHERE "isPublished" = true
            AND "moduleId" IN (${client_1.Prisma.join(moduleIds)})
          ORDER BY "orderIndex" ASC, "createdAt" ASC
        `)
            : [];
        const lessonIds = lessons.map((l) => l.id);
        const progressRows = userId && lessonIds.length > 0
            ? await prisma.$queryRaw(client_1.Prisma.sql `
          SELECT
            "lessonId",
            status::text AS status,
            "progressPercent"
          FROM user_theory_lesson_progress
          WHERE "userId" = ${userId}
            AND "lessonId" IN (${client_1.Prisma.join(lessonIds)})
        `)
            : [];
        const progressByLesson = new Map(progressRows.map((p) => [p.lessonId, p]));
        const lessonsByModule = new Map();
        for (const lesson of lessons) {
            const progress = progressByLesson.get(lesson.id) ||
                { status: "NOT_STARTED", progressPercent: 0 };
            if (!lessonsByModule.has(lesson.moduleId)) {
                lessonsByModule.set(lesson.moduleId, []);
            }
            lessonsByModule.get(lesson.moduleId).push({
                ...lesson,
                status: progress.status,
                progressPercent: progress.progressPercent,
            });
        }
        const modulesByTrack = new Map();
        for (const module of modules) {
            const moduleLessons = lessonsByModule.get(module.id) || [];
            const completed = moduleLessons.filter((l) => l.status === "COMPLETED").length;
            const progressPercent = moduleLessons.length > 0
                ? Math.round((completed / moduleLessons.length) * 100)
                : 0;
            if (!modulesByTrack.has(module.trackId)) {
                modulesByTrack.set(module.trackId, []);
            }
            modulesByTrack.get(module.trackId).push({
                ...module,
                totalLessons: moduleLessons.length,
                completedLessons: completed,
                progressPercent,
                lessons: moduleLessons,
            });
        }
        const payload = tracks.map((track) => {
            const trackModules = modulesByTrack.get(track.id) || [];
            const totalLessons = trackModules.reduce((sum, module) => sum + module.totalLessons, 0);
            const completedLessons = trackModules.reduce((sum, module) => sum + module.completedLessons, 0);
            return {
                ...track,
                totalLessons,
                completedLessons,
                progressPercent: totalLessons > 0
                    ? Math.round((completedLessons / totalLessons) * 100)
                    : 0,
                modules: trackModules,
            };
        });
        res.json(payload);
    }
    catch (error) {
        console.error("Learn tracks error:", error);
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('relation "theory_tracks" does not exist') ||
            message.includes("42P01")) {
            try {
                await ensureTheorySchemaExists();
                await seedStarterTheoryContent();
                const tracksAfterBootstrap = await prisma.$queryRaw `
            SELECT
              id,
              slug,
              title,
              description,
              order_index AS "orderIndex"
            FROM theory_tracks
            WHERE is_published = true
            ORDER BY order_index ASC, created_at ASC
          `;
                return res.json(tracksAfterBootstrap.length > 0
                    ? tracksAfterBootstrap.map((track) => ({
                        ...track,
                        totalLessons: 0,
                        completedLessons: 0,
                        progressPercent: 0,
                        modules: [],
                    }))
                    : []);
            }
            catch (bootstrapError) {
                console.error("Learn bootstrap error:", bootstrapError);
                return res.json(FALLBACK_LEARN_TRACKS);
            }
        }
        if (message.toLowerCase().includes("permission denied") ||
            message.toLowerCase().includes("must be owner")) {
            return res.json(FALLBACK_LEARN_TRACKS);
        }
        res.status(500).json({
            error: "Failed to load learn tracks",
            hint: "Ensure theory migration has been applied.",
        });
    }
});
app.get("/api/learn/tracks/:trackSlug/modules/:moduleSlug/lessons/:lessonSlug", attachOptionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id ?? null;
        const trackSlug = String(req.params.trackSlug);
        const moduleSlug = String(req.params.moduleSlug);
        const lessonSlug = String(req.params.lessonSlug);
        const lessons = await prisma.$queryRaw `
        SELECT
          l.id,
          l.title,
          l.summary,
          l.difficulty::text AS difficulty,
          l."estimatedMinutes",
          l."learningObjectives",
          m.id AS "moduleId",
          m.title AS "moduleTitle",
          m.slug AS "moduleSlug",
          t.title AS "trackTitle",
          t.slug AS "trackSlug"
        FROM theory_lessons l
        INNER JOIN theory_modules m ON m.id = l."moduleId"
        INNER JOIN theory_tracks t ON t.id = m."trackId"
        WHERE t.slug = ${trackSlug}
          AND m.slug = ${moduleSlug}
          AND l.slug = ${lessonSlug}
          AND t."isPublished" = true
          AND m."isPublished" = true
          AND l."isPublished" = true
        LIMIT 1
      `;
        const lesson = lessons[0];
        if (!lesson) {
            const fallbackLesson = getFallbackLearnLesson(trackSlug, moduleSlug, lessonSlug);
            if (fallbackLesson) {
                return res.json(fallbackLesson);
            }
            return res.status(404).json({ error: "Lesson not found" });
        }
        const blocks = await prisma.$queryRaw `
        SELECT
          id,
          "blockType"::text AS "blockType",
          "orderIndex",
          content,
          language
        FROM theory_lesson_blocks
        WHERE "lessonId" = ${lesson.id}
        ORDER BY "orderIndex" ASC
      `;
        const normalizedObjectives = normalizeLearningObjectives(lesson.learningObjectives);
        const enrichedBlocks = appendDetailedTheoryBlock({
            blocks,
            lessonId: lesson.id,
            trackTitle: lesson.trackTitle,
            moduleTitle: lesson.moduleTitle,
            lessonTitle: lesson.title,
            lessonSummary: lesson.summary,
            learningObjectives: normalizedObjectives,
        });
        const progressRows = userId
            ? await prisma.$queryRaw `
        SELECT
          status::text AS status,
          "progressPercent",
          "timeSpentSeconds",
          "completedAt"
        FROM user_theory_lesson_progress
        WHERE "userId" = ${userId}
          AND "lessonId" = ${lesson.id}
      `
            : [];
        const progress = progressRows[0] ||
            {
                status: "NOT_STARTED",
                progressPercent: 0,
                timeSpentSeconds: 0,
                completedAt: null,
            };
        const siblingLessons = await prisma.$queryRaw `
        SELECT id, slug, title, "orderIndex"
        FROM theory_lessons
        WHERE "moduleId" = ${lesson.moduleId}
          AND "isPublished" = true
        ORDER BY "orderIndex" ASC, "createdAt" ASC
      `;
        const siblingProgressRows = userId
            ? await prisma.$queryRaw `
        SELECT
          "lessonId",
          status::text AS status
        FROM user_theory_lesson_progress
        WHERE "userId" = ${userId}
          AND "lessonId" IN (
            SELECT id FROM theory_lessons WHERE "moduleId" = ${lesson.moduleId}
          )
      `
            : [];
        const siblingProgress = new Map(siblingProgressRows.map((row) => [row.lessonId, row.status]));
        const problems = await prisma.$queryRaw `
        SELECT
          p.id,
          p.title,
          p.difficulty::text AS difficulty,
          p.link,
          t.name AS "topicName",
          tpl.required,
          tpl."orderIndex",
          CASE WHEN pr.status = 'DONE' THEN true ELSE false END AS solved
        FROM theory_problem_links tpl
          INNER JOIN "Problem" p ON p.id = tpl."problemId"
        LEFT JOIN "Topic" t ON t.id = p."topicId"
        LEFT JOIN "Progress" pr ON pr."problemId" = p.id AND pr."userId" = ${userId}
          WHERE tpl."lessonId" = ${lesson.id}
            OR (tpl."lessonId" IS NULL AND tpl."moduleId" = ${lesson.moduleId})
          ORDER BY tpl."orderIndex" ASC
      `;
        const isUnlocked = progress.status === "COMPLETED";
        res.json({
            lesson: {
                id: lesson.id,
                title: lesson.title,
                summary: lesson.summary,
                difficulty: lesson.difficulty,
                estimatedMinutes: lesson.estimatedMinutes,
                learningObjectives: normalizedObjectives,
                module: {
                    id: lesson.moduleId,
                    title: lesson.moduleTitle,
                    slug: lesson.moduleSlug,
                },
                track: {
                    title: lesson.trackTitle,
                    slug: lesson.trackSlug,
                },
            },
            blocks: enrichedBlocks,
            progress,
            isUnlocked,
            siblings: siblingLessons.map((s) => ({
                ...s,
                status: siblingProgress.get(s.id) || "NOT_STARTED",
            })),
            problems: problems.map((problem) => ({
                ...problem,
                unlocked: isUnlocked,
            })),
        });
    }
    catch (error) {
        console.error("Learn lesson detail error:", error);
        const fallbackLesson = getFallbackLearnLesson(String(req.params.trackSlug), String(req.params.moduleSlug), String(req.params.lessonSlug));
        if (fallbackLesson) {
            return res.json(fallbackLesson);
        }
        res.status(500).json({ error: "Failed to load lesson" });
    }
});
app.post("/api/learn/lessons/:lessonId/progress", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const lessonId = req.params.lessonId;
        const rawStatus = String(req.body.status || "IN_PROGRESS");
        const allowed = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];
        if (!allowed.includes(rawStatus)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        const requestedPercent = Number(req.body.progressPercent ?? 0);
        const progressPercent = Math.max(0, Math.min(100, rawStatus === "COMPLETED" ? 100 : requestedPercent));
        const timeSpentSeconds = Math.max(0, Number(req.body.timeSpentSeconds ?? 0));
        const lastSeenBlockId = req.body.lastSeenBlockId
            ? String(req.body.lastSeenBlockId)
            : null;
        const completedAt = rawStatus === "COMPLETED" ? new Date() : null;
        const lessonExists = await prisma.$queryRaw `
        SELECT id
        FROM theory_lessons
        WHERE id = ${lessonId}
        LIMIT 1
      `;
        if (lessonExists.length === 0) {
            return res.status(404).json({ error: "Lesson not found" });
        }
        const rows = await prisma.$queryRaw `
        INSERT INTO user_theory_lesson_progress (
          user_id,
          lesson_id,
          status,
          progress_percent,
          time_spent_seconds,
          completed_at,
          last_seen_block_id,
          created_at,
          updated_at
        )
        VALUES (
          ${userId},
          ${lessonId},
          ${rawStatus}::"TheoryProgressStatus",
          ${progressPercent},
          ${timeSpentSeconds},
          ${completedAt},
          ${lastSeenBlockId},
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id, lesson_id)
        DO UPDATE SET
          status = EXCLUDED.status,
          progress_percent = EXCLUDED.progress_percent,
          time_spent_seconds = EXCLUDED.time_spent_seconds,
          completed_at = EXCLUDED.completed_at,
          last_seen_block_id = EXCLUDED.last_seen_block_id,
          updated_at = NOW()
        RETURNING
          status::text AS status,
          progress_percent AS "progressPercent",
          time_spent_seconds AS "timeSpentSeconds",
          completed_at AS "completedAt",
          updated_at AS "updatedAt"
      `;
        res.json(rows[0]);
    }
    catch (error) {
        console.error("Update theory progress error:", error);
        res.status(500).json({ error: "Failed to update lesson progress" });
    }
});
app.post("/api/admin/learn/seed", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const seededResult = await seedStarterTheoryContent();
        res.json({
            success: true,
            ...seededResult,
        });
    }
    catch (error) {
        console.error("Theory seed error:", error);
        res.status(500).json({ error: "Failed to seed theory content" });
    }
});
app.post("/api/admin/learn/seed-comprehensive", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const result = await (0, seedComprehensiveDSA_1.seedComprehensiveDSA)();
        res.json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        console.error("Comprehensive DSA seed error:", error);
        res
            .status(500)
            .json({ error: "Failed to seed comprehensive DSA content" });
    }
});
// 4. Update Problem Progress
app.post("/api/progress", requireAuth, async (req, res) => {
    try {
        const { problemId, status, timeSpent } = req.body;
        const userId = req.user.id;
        const normalizedProblemId = typeof problemId === "string" ? problemId.trim() : "";
        const normalizedTimeSpent = Number(timeSpent);
        if (!isNonEmptyString(normalizedProblemId)) {
            return res.status(400).json({ error: "Invalid problemId" });
        }
        if (!isProgressStatus(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        if (!Number.isFinite(normalizedTimeSpent) ||
            normalizedTimeSpent < 0 ||
            normalizedTimeSpent > 24 * 60) {
            return res.status(400).json({ error: "Invalid timeSpent" });
        }
        const progress = await prisma.progress.upsert({
            where: {
                userId_problemId: {
                    userId,
                    problemId: normalizedProblemId,
                },
            },
            update: {
                status,
                timeSpent: Math.round(normalizedTimeSpent),
                completedAt: status === "DONE" ? new Date() : null,
            },
            create: {
                userId,
                problemId: normalizedProblemId,
                status,
                timeSpent: Math.round(normalizedTimeSpent),
                completedAt: status === "DONE" ? new Date() : null,
            },
        });
        // Spaced Repetition logic (SM-2 simplified)
        if (status === "DONE") {
            const existing = (await prisma.progress.findUnique({
                where: { userId_problemId: { userId, problemId: normalizedProblemId } },
            }));
            let nextInterval = 2;
            let nextEF = existing?.easinessFactor || 2.5;
            nextInterval = getNextRevisionInterval(existing?.interval || 0);
            const nextReview = new Date();
            nextReview.setDate(nextReview.getDate() + nextInterval);
            await prisma.progress.update({
                where: {
                    userId_problemId: { userId, problemId: normalizedProblemId },
                },
                data: {
                    interval: nextInterval,
                    easinessFactor: nextEF,
                    nextReviewDate: nextReview,
                },
            });
            const streak = await prisma.streak.upsert({
                where: { userId },
                update: {},
                create: {
                    userId,
                    currentStreak: 0,
                    longestStreak: 0,
                    lastActivityDate: new Date(0),
                },
            });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const lastActivity = new Date(streak.lastActivityDate);
            lastActivity.setHours(0, 0, 0, 0);
            const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                // Increment streak
                await prisma.streak.update({
                    where: { userId },
                    data: {
                        currentStreak: { increment: 1 },
                        longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
                        lastActivityDate: new Date(),
                    },
                });
            }
            else if (diffDays > 1) {
                // Reset streak
                await prisma.streak.update({
                    where: { userId },
                    data: {
                        currentStreak: 1,
                        lastActivityDate: new Date(),
                    },
                });
            }
        }
        res.json(progress);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// === INTERVIEW ROUTES ===
app.get("/api/interviews", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const interviews = await prisma.mockInterview.findMany({
            where: { userId },
            orderBy: { date: "desc" },
        });
        res.json(interviews);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.post("/api/interviews", requireAuth, async (req, res) => {
    try {
        const { date, score, feedback } = req.body;
        const userId = req.user.id;
        const newInterview = await prisma.mockInterview.create({
            data: {
                userId,
                date: new Date(date),
                score: parseInt(score),
                feedback,
            },
        });
        res.json(newInterview);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// === ADMIN ROUTES ===
// 5. Get All Users (Admin only)
app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Update user role
app.patch("/api/admin/users/:id/role", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;
        if (role !== "USER" && role !== "ADMIN") {
            return res.status(400).json({ error: "Invalid role value" });
        }
        const user = await prisma.user.update({
            where: { id: userId },
            data: { role: role },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Error updating user" });
    }
});
// Topic Management
app.post("/api/admin/topics", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, description, orderIndex } = req.body;
        const topic = await prisma.topic.create({
            data: { name, description, orderIndex: parseInt(orderIndex) },
        });
        res.json(topic);
    }
    catch (error) {
        res.status(500).json({ error: "Error creating topic" });
    }
});
app.put("/api/admin/topics/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, description, orderIndex } = req.body;
        const topicId = req.params.id;
        const topic = await prisma.topic.update({
            where: { id: topicId },
            data: { name, description, orderIndex: parseInt(orderIndex) },
        });
        res.json(topic);
    }
    catch (error) {
        res.status(500).json({ error: "Error updating topic" });
    }
});
app.delete("/api/admin/topics/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const topicId = req.params.id;
        await prisma.topic.delete({ where: { id: topicId } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting topic" });
    }
});
// Problem Management
app.post("/api/admin/problems", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { title, link, difficulty, topicId, orderIndex } = req.body;
        const problem = await prisma.problem.create({
            data: {
                title,
                link,
                difficulty,
                topicId,
                orderIndex: parseInt(orderIndex),
            },
        });
        res.json(problem);
    }
    catch (error) {
        res.status(500).json({ error: "Error creating problem" });
    }
});
app.put("/api/admin/problems/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { title, link, difficulty, topicId, orderIndex } = req.body;
        const probId = req.params.id;
        const problem = await prisma.problem.update({
            where: { id: probId },
            data: {
                title,
                link,
                difficulty,
                topicId,
                orderIndex: parseInt(orderIndex),
            },
        });
        res.json(problem);
    }
    catch (error) {
        res.status(500).json({ error: "Error updating problem" });
    }
});
app.delete("/api/admin/problems/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const probId = req.params.id;
        await prisma.problem.delete({ where: { id: probId } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting problem" });
    }
});
// Seed roadmap topics + problems from dsa-roadmap-seed.json (idempotent)
app.post("/api/admin/seed", requireAuth, requireAdmin, async (req, res) => {
    try {
        const seedDataPath = path_1.default.join(__dirname, "../dsa-roadmap-seed.json");
        if (!fs_1.default.existsSync(seedDataPath)) {
            return res.status(500).json({ error: "Seed data file not found" });
        }
        const seedData = JSON.parse(fs_1.default.readFileSync(seedDataPath, "utf8"));
        let topicsUpserted = 0;
        let problemsUpserted = 0;
        for (const topicData of seedData.topics) {
            const topic = await prisma.topic.upsert({
                where: { name: topicData.name },
                update: {
                    description: topicData.description,
                    orderIndex: topicData.order,
                },
                create: {
                    name: topicData.name,
                    description: topicData.description,
                    orderIndex: topicData.order,
                },
            });
            topicsUpserted++;
            for (const problemData of topicData.problems) {
                const existing = await prisma.problem.findFirst({
                    where: { title: problemData.title, topicId: topic.id },
                });
                if (existing) {
                    await prisma.problem.update({
                        where: { id: existing.id },
                        data: {
                            link: problemData.leetcode,
                            difficulty: problemData.difficulty.toUpperCase(),
                            orderIndex: problemData.order,
                        },
                    });
                }
                else {
                    await prisma.problem.create({
                        data: {
                            title: problemData.title,
                            link: problemData.leetcode,
                            difficulty: problemData.difficulty.toUpperCase(),
                            orderIndex: problemData.order,
                            topicId: topic.id,
                        },
                    });
                }
                problemsUpserted++;
            }
        }
        res.json({ success: true, topicsUpserted, problemsUpserted });
    }
    catch (error) {
        console.error("Seed error:", error);
        res.status(500).json({ error: "Seed failed" });
    }
});
// 5. Get Activity Data for Heatmap
app.get("/api/analytics/activity", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const progress = await prisma.progress.findMany({
            where: { userId, status: "DONE" },
            select: { completedAt: true },
        });
        const activity = {};
        progress.forEach((p) => {
            if (p.completedAt) {
                const completedAt = new Date(p.completedAt);
                if (Number.isNaN(completedAt.getTime())) {
                    return;
                }
                if (completedAt.getFullYear() < 2000) {
                    return;
                }
                const yyyy = completedAt.getFullYear();
                const mm = String(completedAt.getMonth() + 1).padStart(2, "0");
                const dd = String(completedAt.getDate()).padStart(2, "0");
                const date = `${yyyy}-${mm}-${dd}`;
                activity[date] = (activity[date] || 0) + 1;
            }
        });
        const formattedActivity = Object.entries(activity).map(([date, count]) => ({
            date,
            count,
        }));
        res.json(formattedActivity);
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get("/api/analytics/mastery", requireAuth, async (req, res) => {
    try {
        const stats = await (0, services_1.getMasteryStats)(req.user.id);
        res.json(stats);
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});
// 6. Update LeetCode Username
app.patch("/api/user/leetcode", requireAuth, async (req, res) => {
    try {
        const { leetcodeUsername } = req.body;
        const userId = req.user.id;
        const normalizedUsername = typeof leetcodeUsername === "string"
            ? leetcodeUsername.trim().toLowerCase()
            : "";
        if (!/^[a-z0-9_-]{1,30}$/i.test(normalizedUsername)) {
            return res.status(400).json({ error: "Invalid LeetCode username" });
        }
        await prisma.user.update({
            where: { id: userId },
            data: { leetcodeUsername: normalizedUsername },
        });
        res.json({ success: true, leetcodeUsername: normalizedUsername });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update username" });
    }
});
// 7. Sync LeetCode Data
app.post("/api/user/sync-leetcode", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = (await prisma.user.findUnique({
            where: { id: userId },
        }));
        if (!user?.leetcodeUsername) {
            return res.status(400).json({ error: "LeetCode username not set" });
        }
        // Build solved problem map: prefer authenticated full-list API only when
        // session cookie owner matches configured username.
        const solvedMap = new Map();
        let syncSource = "username";
        let sessionUsername = null;
        let sessionMismatchWarning = null;
        if (user.leetcodeSession) {
            sessionUsername = await (0, leetcodeService_1.fetchSessionUsername)(user.leetcodeSession);
            const normalizedSessionUser = sessionUsername?.trim().toLowerCase();
            const normalizedConfiguredUser = user.leetcodeUsername
                .trim()
                .toLowerCase();
            if (normalizedSessionUser &&
                normalizedSessionUser === normalizedConfiguredUser) {
                syncSource = "session";
                // Fetch ALL accepted problems via authenticated paginated API
                const allSolved = await (0, leetcodeService_1.fetchAllSolvedProblems)(user.leetcodeSession);
                for (const q of allSolved) {
                    solvedMap.set(q.titleSlug, {
                        title: q.title,
                        titleSlug: q.titleSlug,
                        difficulty: q.difficulty,
                        timestamp: 0, // not available from this endpoint
                    });
                }
                console.log(`Syncing LeetCode for ${user.leetcodeUsername}: Found ${solvedMap.size} unique accepted problems (full history via matching session).`);
            }
            else {
                // Safety: prevent syncing the wrong account when stale session is set.
                sessionMismatchWarning = sessionUsername
                    ? `Session belongs to '${sessionUsername}', but configured username is '${user.leetcodeUsername}'. Falling back to username sync.`
                    : "LeetCode session could not be validated. Falling back to username sync.";
                console.warn(sessionMismatchWarning);
            }
        }
        if (solvedMap.size === 0) {
            // Username-based sync (recent accepted submissions)
            const data = await (0, leetcodeService_1.fetchLeetCodeSolvedProblems)(user.leetcodeUsername);
            const recentSubmissions = data.recentSubmissionList || [];
            recentSubmissions.forEach((sub) => {
                if (sub.statusDisplay === "Accepted" &&
                    (!solvedMap.has(sub.titleSlug) ||
                        sub.timestamp > solvedMap.get(sub.titleSlug).timestamp)) {
                    solvedMap.set(sub.titleSlug, sub);
                }
            });
            console.log(`Syncing LeetCode for ${user.leetcodeUsername}: Found ${solvedMap.size} unique accepted problems via username (recent submissions).`);
        }
        const results = [];
        for (const [slug, sub] of solvedMap.entries()) {
            // Find matching problem in our DB
            const problem = await prisma.problem.findFirst({
                where: {
                    OR: [
                        { title: { equals: sub.title, mode: "insensitive" } },
                        { link: { contains: slug } },
                    ],
                },
            });
            // Attempt to get runtime and memory details if user.leetcodeSession is set
            let runtimeOpt = null;
            let memoryOpt = null;
            let timestampOpt = typeof sub.timestamp === "number" && sub.timestamp > 0
                ? sub.timestamp
                : null;
            if (syncSource === "session" && user.leetcodeSession) {
                try {
                    const subs = await (0, leetcodeService_1.fetchProblemSubmissions)(slug, user.leetcodeSession);
                    const acceptedSubs = subs?.questionSubmissionList?.submissions?.filter((s) => s.statusDisplay === "Accepted") || [];
                    const theSub = acceptedSubs[0];
                    if (theSub) {
                        // These strings look like: "45 ms" or "16.4 MB"
                        runtimeOpt = theSub.runtime;
                        memoryOpt = theSub.memory;
                    }
                    // Prefer the earliest known accepted timestamp for a stable historical heatmap.
                    const acceptedTimestamps = acceptedSubs
                        .map((s) => Number(s?.timestamp))
                        .filter((t) => Number.isFinite(t) && t > 0);
                    if (acceptedTimestamps.length > 0) {
                        timestampOpt = Math.min(...acceptedTimestamps);
                    }
                }
                catch (e) {
                    // Silent fallback, could be invalid session or quota limits
                }
            }
            if (problem) {
                const existingProgress = await prisma.progress.findUnique({
                    where: {
                        userId_problemId: {
                            userId,
                            problemId: problem.id,
                        },
                    },
                    select: {
                        completedAt: true,
                    },
                });
                const completedAt = timestampOpt
                    ? new Date(timestampOpt * 1000)
                    : existingProgress?.completedAt || new Date();
                await prisma.progress.upsert({
                    where: { userId_problemId: { userId, problemId: problem.id } },
                    update: {
                        status: "DONE",
                        completedAt,
                        ...(runtimeOpt && { leetcodeRuntime: runtimeOpt }),
                        ...(memoryOpt && { leetcodeMemory: memoryOpt }),
                    },
                    create: {
                        userId,
                        problemId: problem.id,
                        status: "DONE",
                        completedAt,
                        leetcodeRuntime: runtimeOpt,
                        leetcodeMemory: memoryOpt,
                    },
                });
                results.push(problem.title);
            }
            else {
                // Auto-populate missing problem into a 'Misc / Uncategorized' topic
                console.log(`LeetCode problem not found in roadmap: ${sub.title} (${slug}). Injecting as Extra Practice.`);
                // Find or create the Misc topic
                let miscTopic = await prisma.topic.findFirst({
                    where: { name: "Extra Practice (Auto-Synced)" },
                });
                if (!miscTopic) {
                    const maxOrderTopic = await prisma.topic.findFirst({
                        orderBy: { orderIndex: "desc" },
                    });
                    miscTopic = await prisma.topic.create({
                        data: {
                            name: "Extra Practice (Auto-Synced)",
                            description: "Problems solved on LeetCode that are not part of the standard curriculum.",
                            orderIndex: (maxOrderTopic?.orderIndex || 99) + 1,
                        },
                    });
                }
                // Get highest order index for problems in this topic to append to the end
                const maxOrderProblem = await prisma.problem.findFirst({
                    where: { topicId: miscTopic.id },
                    orderBy: { orderIndex: "desc" },
                });
                // Create the new problem
                const newProblem = await prisma.problem.create({
                    data: {
                        title: sub.title,
                        link: `https://leetcode.com/problems/${slug}/`,
                        difficulty: "MEDIUM", // Defaulting to medium as the basic API doesn't return difficulty in recent subs easily, but it's safe fallback
                        topicId: miscTopic.id,
                        orderIndex: (maxOrderProblem?.orderIndex || 0) + 1,
                    },
                });
                // Mark it as done
                await prisma.progress.create({
                    data: {
                        userId,
                        problemId: newProblem.id,
                        status: "DONE",
                        completedAt: timestampOpt
                            ? new Date(timestampOpt * 1000)
                            : new Date(),
                        leetcodeRuntime: runtimeOpt,
                        leetcodeMemory: memoryOpt,
                    },
                });
                results.push(newProblem.title);
            }
        }
        console.log(`Sync complete. Matched ${results.length} problems.`);
        res.json({
            success: true,
            syncSource,
            configuredUsername: user.leetcodeUsername,
            sessionUsername,
            warning: sessionMismatchWarning,
            syncedCount: results.length,
            syncedProblems: results,
        });
    }
    catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ error: "Failed to sync with LeetCode" });
    }
});
// Update LeetCode Session Cookie
app.patch("/api/user/leetcode-session", requireAuth, async (req, res) => {
    try {
        const { leetcodeSession } = req.body;
        const userId = req.user.id;
        const rawSessionInput = typeof leetcodeSession === "string" ? leetcodeSession.trim() : "";
        const fromNamedCookie = rawSessionInput.match(/(?:^|[;\s])LEETCODE_SESSION=([^;\s]+)/i)?.[1];
        const normalizedSession = (fromNamedCookie || rawSessionInput)
            .trim()
            .replace(/^"|"$/g, "");
        if (normalizedSession.length > 0 &&
            (normalizedSession.length < 20)) {
            return res.status(400).json({
                error: "Invalid LeetCode session. Paste either the LEETCODE_SESSION value only, or a full cookie string containing LEETCODE_SESSION=...",
            });
        }
        await prisma.user.update({
            where: { id: userId },
            data: { leetcodeSession: normalizedSession },
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update leetcode session" });
    }
});
// Extension direct sync (bypass normal requireAuth by using leetcodeSession)
app.post("/api/extension/sync", async (req, res) => {
    try {
        const { problemSlug, leetcodeSession } = req.body;
        const normalizedSlug = typeof problemSlug === "string" ? problemSlug.trim().toLowerCase() : "";
        const normalizedSession = typeof leetcodeSession === "string" ? leetcodeSession.trim() : "";
        if (!normalizedSlug ||
            !/^[a-z0-9-]+$/.test(normalizedSlug) ||
            !normalizedSession ||
            normalizedSession.length < 20) {
            return res.status(400).json({ error: "Missing problemSlug or session" });
        }
        const user = (await prisma.user.findFirst({
            where: { leetcodeSession: normalizedSession },
        }));
        if (!user) {
            return res
                .status(401)
                .json({ error: "No user linked to this LeetCode session" });
        }
        const data = await (0, leetcodeService_1.fetchProblemSubmissions)(normalizedSlug, normalizedSession);
        const submissions = data?.questionSubmissionList?.submissions || [];
        const acceptedSub = submissions.find((s) => s.statusDisplay === "Accepted");
        if (!acceptedSub) {
            return res.status(400).json({ error: "No accepted submission found" });
        }
        let problem = await prisma.problem.findFirst({
            where: { link: { contains: problemSlug } },
        });
        // If it doesn't exist, we create it just like normal sync
        if (!problem) {
            let miscTopic = await prisma.topic.findFirst({
                where: { name: "Extra Practice (Auto-Synced)" },
            });
            if (!miscTopic) {
                const maxOrderTopic = await prisma.topic.findFirst({
                    orderBy: { orderIndex: "desc" },
                });
                miscTopic = await prisma.topic.create({
                    data: {
                        name: "Extra Practice (Auto-Synced)",
                        description: "Problems solved on LeetCode that are not part of the standard curriculum.",
                        orderIndex: (maxOrderTopic?.orderIndex || 99) + 1,
                    },
                });
            }
            const maxOrderProblem = await prisma.problem.findFirst({
                where: { topicId: miscTopic.id },
                orderBy: { orderIndex: "desc" },
            });
            problem = await prisma.problem.create({
                data: {
                    title: acceptedSub.title,
                    link: `https://leetcode.com/problems/${normalizedSlug}/`,
                    difficulty: isDifficulty(acceptedSub.difficulty)
                        ? acceptedSub.difficulty
                        : "MEDIUM",
                    topicId: miscTopic.id,
                    orderIndex: (maxOrderProblem?.orderIndex || 0) + 1,
                },
            });
        }
        // Now upsert progress
        await prisma.progress.upsert({
            where: {
                userId_problemId: {
                    userId: user.id,
                    problemId: problem.id,
                },
            },
            update: {
                status: "DONE",
                completedAt: new Date(acceptedSub.timestamp * 1000),
                leetcodeRuntime: acceptedSub.runtime,
                leetcodeMemory: acceptedSub.memory,
            },
            create: {
                userId: user.id,
                problemId: problem.id,
                status: "DONE",
                timeSpent: 0,
                completedAt: new Date(acceptedSub.timestamp * 1000),
                leetcodeRuntime: acceptedSub.runtime,
                leetcodeMemory: acceptedSub.memory,
            },
        });
        res.json({
            success: true,
            message: `Synced ${problem.title} from extension!`,
        });
    }
    catch (err) {
        console.error("Extension Sync Error:", err);
        res.status(500).json({ error: "Extension sync failed" });
    }
});
// Get LeetCode Submissions for a problem
app.get("/api/leetcode/submissions/:problemSlug", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = (await prisma.user.findUnique({
            where: { id: userId },
        }));
        if (!user?.leetcodeSession) {
            return res
                .status(400)
                .json({ error: "LeetCode session cookie not set" });
        }
        const data = await (0, leetcodeService_1.fetchProblemSubmissions)(req.params.problemSlug, user.leetcodeSession);
        const submissions = data?.questionSubmissionList?.submissions || [];
        res.json(submissions);
    }
    catch (error) {
        console.error("Fetch Submissions Error:", error);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
});
// Get LeetCode Daily Challenge
app.get("/api/leetcode/daily-challenge", requireAuth, async (req, res) => {
    try {
        const data = await (0, leetcodeService_1.fetchActiveDailyCodingChallengeQuestion)();
        const activeChallenge = data?.activeDailyCodingChallengeQuestion || null;
        res.json(activeChallenge);
    }
    catch (error) {
        console.error("Fetch Daily Challenge Error:", error);
        res.status(500).json({ error: "Failed to fetch daily challenge" });
    }
});
// Get Problem Details with Code Snippets
app.get("/api/leetcode/problem/:titleSlug", requireAuth, async (req, res) => {
    try {
        const problemDetails = await (0, leetcodeService_1.fetchProblemDetails)(req.params.titleSlug);
        res.json(problemDetails);
    }
    catch (error) {
        console.error("Fetch Problem Details Error:", error);
        res.status(500).json({ error: "Failed to fetch problem details" });
    }
});
// === USER SETTINGS ===
// Get User Settings
app.get("/api/user/settings", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = (await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                leetcodeUsername: true,
                leetcodeSession: true,
            },
        }));
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            leetcodeUsername: user.leetcodeUsername || "",
            leetcodeSession: user.leetcodeSession || "",
        });
    }
    catch (error) {
        console.error("Get Settings Error:", error);
        res.status(500).json({ error: "Failed to load settings" });
    }
});
// Update LeetCode Session
app.put("/api/user/settings/leetcode", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { leetcodeSession } = req.body;
        if (!leetcodeSession || typeof leetcodeSession !== "string") {
            return res
                .status(400)
                .json({ error: "Invalid LeetCode session cookie" });
        }
        const rawSessionInput = leetcodeSession.trim();
        const fromNamedCookie = rawSessionInput.match(/(?:^|[;\s])LEETCODE_SESSION=([^;\s]+)/i)?.[1];
        const normalizedSession = (fromNamedCookie || rawSessionInput)
            .trim()
            .replace(/^"|"$/g, "");
        if (normalizedSession.length < 20) {
            return res.status(400).json({
                error: "Invalid LeetCode session. Paste either the LEETCODE_SESSION value only, or a full cookie string containing LEETCODE_SESSION=...",
            });
        }
        await prisma.user.update({
            where: { id: userId },
            data: { leetcodeSession: normalizedSession },
        });
        res.json({
            success: true,
            message: "LeetCode session updated successfully",
        });
    }
    catch (error) {
        console.error("Update LeetCode Session Error:", error);
        res.status(500).json({ error: "Failed to update LeetCode session" });
    }
});
// Submit Code to LeetCode
app.post("/api/leetcode/submit", requireAuth, async (req, res) => {
    try {
        const { questionSlug, code, lang } = req.body;
        const userId = req.user.id;
        const user = (await prisma.user.findUnique({
            where: { id: userId },
        }));
        if (!user?.leetcodeSession) {
            return res.status(400).json({
                error: "LeetCode session cookie not set. Please add it in settings.",
            });
        }
        const result = await (0, leetcodeService_1.submitCodeToLeetCode)(questionSlug, code, lang, user.leetcodeSession);
        res.json(result);
    }
    catch (error) {
        console.error("Submit Code Error:", error);
        res.status(500).json({
            error: "Failed to submit code to LeetCode",
            details: error.response?.data || error.message,
        });
    }
});
// Check Submission Result
app.get("/api/leetcode/submission/:submissionId/check", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = (await prisma.user.findUnique({
            where: { id: userId },
        }));
        if (!user?.leetcodeSession) {
            return res
                .status(400)
                .json({ error: "LeetCode session cookie not set" });
        }
        const result = await (0, leetcodeService_1.checkSubmissionResult)(req.params.submissionId, user.leetcodeSession);
        res.json(result);
    }
    catch (error) {
        console.error("Check Submission Error:", error);
        res.status(500).json({ error: "Failed to check submission result" });
    }
});
// Get LeetCode Submission Details (Code)
app.get("/api/leetcode/submission/:submissionId/code", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = (await prisma.user.findUnique({
            where: { id: userId },
        }));
        if (!user?.leetcodeSession) {
            return res
                .status(400)
                .json({ error: "LeetCode session cookie not set" });
        }
        const data = await (0, leetcodeService_1.fetchSubmissionDetails)(req.params.submissionId, user.leetcodeSession);
        const submissionDetails = data?.submissionDetails || null;
        res.json(submissionDetails);
    }
    catch (error) {
        console.error("Fetch Submission Details Error:", error);
        res.status(500).json({ error: "Failed to fetch submission details" });
    }
});
// 8. Challenge Modes (Interview Training)
app.post("/api/challenges/start", requireAuth, async (req, res) => {
    try {
        const { topicId, duration } = req.body;
        const userId = req.user.id;
        // Pick random problems from topic
        const problems = await prisma.problem.findMany({
            where: { topicId },
            take: 2, // Assign 2 problems
        });
        if (problems.length === 0) {
            return res
                .status(404)
                .json({ error: "No problems found for this topic" });
        }
        // Shuffle and pick
        const shuffled = problems.sort(() => 0.5 - Math.random());
        const assignedIds = shuffled.slice(0, 2).map((p) => p.id);
        const session = await prisma.challengeSession.create({
            data: {
                userId,
                problemIds: assignedIds,
                duration: parseInt(duration) || 30, // Default 30 mins
            },
        });
        res.json(session);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to start challenge" });
    }
});
app.get("/api/challenges/:id", requireAuth, async (req, res) => {
    try {
        const session = (await prisma.challengeSession.findUnique({
            where: { id: req.params.id },
        }));
        if (!session)
            return res.status(404).json({ error: "Session not found" });
        const problems = await prisma.problem.findMany({
            where: { id: { in: session.problemIds } },
            include: { topic: true },
        });
        res.json({ ...session, problems });
    }
    catch (err) {
        res.status(500).json({ error: "Error fetching session" });
    }
});
app.post("/api/challenges/:id/complete", requireAuth, async (req, res) => {
    try {
        const { status } = req.body; // COMPLETED or FAILED
        const session = await prisma.challengeSession.update({
            where: { id: req.params.id },
            data: {
                status: status,
                endTime: new Date(),
            },
        });
        res.json(session);
    }
    catch (err) {
        res.status(500).json({ error: "Error completing session" });
    }
});
// 9. AI Pattern Mentor
app.post("/api/ai/hint", requireAuth, async (req, res) => {
    try {
        const { problemId } = req.body;
        const problem = await prisma.problem.findUnique({
            where: { id: problemId },
            include: { topic: true },
        });
        if (!problem)
            return res.status(404).json({ error: "Problem not found" });
        const hint = await (0, aiService_1.getAIHint)(problem.title, problem.topic.name, problem.difficulty);
        res.json({ hint });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI Error" });
    }
});
app.get("/api/ai/pattern/:topicId", requireAuth, async (req, res) => {
    try {
        const topic = await prisma.topic.findUnique({
            where: { id: req.params.topicId },
        });
        if (!topic)
            return res.status(404).json({ error: "Topic not found" });
        const explanation = await (0, aiService_1.getPatternExplanation)(topic.name);
        res.json({ explanation });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI Error" });
    }
});
app.post("/api/ai/review", requireAuth, async (req, res) => {
    try {
        const { problemId, code } = req.body;
        const problem = await prisma.problem.findUnique({
            where: { id: problemId },
            include: { topic: true },
        });
        if (!problem)
            return res.status(404).json({ error: "Problem not found" });
        const review = await (0, aiService_1.getAICodeReview)(code, problem.title, problem.topic.name);
        res.json({ review });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI Error during code review" });
    }
});
app.post("/api/ai/trace", requireAuth, async (req, res) => {
    try {
        const { problemId, code } = req.body;
        const problem = await prisma.problem.findUnique({
            where: { id: problemId },
        });
        if (!problem)
            return res.status(404).json({ error: "Problem not found" });
        const trace = await (0, aiService_1.getAlgoTracing)(code, problem.title);
        res.json({ trace });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI Error during algorithm tracing" });
    }
});
app.post("/api/ai/evaluate", requireAuth, async (req, res) => {
    try {
        const { problemId, code, language } = req.body;
        const problem = await prisma.problem.findUnique({
            where: { id: problemId },
            include: { topic: true },
        });
        if (!problem)
            return res.status(404).json({ error: "Problem not found" });
        const evaluation = await (0, aiService_1.evaluateCode)(code, problem.title, problem.topic.name, problem.difficulty, language);
        res.json({ evaluation });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI Error during code evaluation" });
    }
});
// === DSA WIKI / VAULT ===
// Get all pattern templates
app.get("/api/vault/templates", requireAuth, async (req, res) => {
    res.json(templates_1.DSA_TEMPLATES);
});
// Get notes for a specific problem
app.get("/api/notes/:problemId", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const notes = await prisma.problemNote.findMany({
            where: { userId, problemId: req.params.problemId },
            orderBy: { createdAt: "desc" },
        });
        res.json(notes);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});
// Get ALL notes for the user (for the vault page)
app.get("/api/notes", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const notes = await prisma.problemNote.findMany({
            where: { userId },
            include: {
                problem: { select: { title: true, topic: { select: { name: true } } } },
            },
            orderBy: { updatedAt: "desc" },
        });
        res.json(notes);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});
// Create a note
app.post("/api/notes", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { problemId, content, type } = req.body;
        const note = await prisma.problemNote.create({
            data: { userId, problemId, content, type: type || "LEARNING" },
        });
        res.json(note);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create note" });
    }
});
// Update a note
app.put("/api/notes/:noteId", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { content, type } = req.body;
        const note = await prisma.problemNote.updateMany({
            where: { id: req.params.noteId, userId },
            data: { content, type },
        });
        res.json(note);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update note" });
    }
});
// Delete a note
app.delete("/api/notes/:noteId", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.problemNote.deleteMany({
            where: { id: req.params.noteId, userId },
        });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete note" });
    }
});
// === DAILY PROBLEM ===
app.get("/api/daily-problem", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const daily = await (0, services_1.getDailyProblem)(userId);
        res.json(daily);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get daily problem" });
    }
});
// === TIME ANALYTICS ===
app.get("/api/analytics/time", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const analytics = await (0, services_1.getTimeAnalytics)(userId);
        res.json(analytics);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get time analytics" });
    }
});
// === ACHIEVEMENTS ===
app.get("/api/achievements", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await (0, services_1.getAchievements)(userId);
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get achievements" });
    }
});
// === WEEKLY REPORT ===
app.get("/api/weekly-report", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await (0, services_1.getWeeklyReport)(userId);
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get weekly report" });
    }
});
// ============================================================
// === NEW FEATURES ===
// ============================================================
// === SOLUTION HISTORY ===
// Save a solution
app.post("/api/solutions", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { problemId, code, language, isCorrect, score, verdict, timeComplexity, spaceComplexity, isOptimal, isAIGenerated, } = req.body;
        const solution = await prisma.solutionHistory.create({
            data: {
                userId,
                problemId,
                code,
                language,
                isCorrect: isCorrect || false,
                score: score || 0,
                verdict: verdict || null,
                timeComplexity: timeComplexity || null,
                spaceComplexity: spaceComplexity || null,
                isOptimal: isOptimal || false,
                isAIGenerated: isAIGenerated || "UNKNOWN",
            },
        });
        res.json(solution);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save solution" });
    }
});
// Get solution history for a problem
app.get("/api/solutions/:problemId", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.problemId;
        const solutions = await prisma.solutionHistory.findMany({
            where: { userId, problemId },
            orderBy: { createdAt: "desc" },
        });
        res.json(solutions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get solution history" });
    }
});
// Get all solutions for a user (for analytics)
app.get("/api/solutions", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const solutions = await prisma.solutionHistory.findMany({
            where: { userId },
            include: { problem: { include: { topic: true } } },
            orderBy: { createdAt: "desc" },
            take: 100,
        });
        res.json(solutions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get solutions" });
    }
});
// === BOOKMARKS ===
// Toggle bookmark
app.post("/api/bookmarks/toggle", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { problemId } = req.body;
        const existing = await prisma.bookmark.findUnique({
            where: { userId_problemId: { userId, problemId } },
        });
        if (existing) {
            await prisma.bookmark.delete({ where: { id: existing.id } });
            res.json({ bookmarked: false });
        }
        else {
            await prisma.bookmark.create({ data: { userId, problemId } });
            res.json({ bookmarked: true });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to toggle bookmark" });
    }
});
// Get all bookmarks
app.get("/api/bookmarks", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const bookmarks = await prisma.bookmark.findMany({
            where: { userId },
            include: {
                problem: {
                    include: {
                        topic: true,
                        progress: { where: { userId } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(bookmarks);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get bookmarks" });
    }
});
// Check if a problem is bookmarked
app.get("/api/bookmarks/check/:problemId", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.problemId;
        const bookmark = await prisma.bookmark.findUnique({
            where: { userId_problemId: { userId, problemId } },
        });
        res.json({ bookmarked: !!bookmark });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to check bookmark" });
    }
});
// === TAGS ===
// Create a tag
app.post("/api/tags", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, color } = req.body;
        const tag = await prisma.userTag.create({
            data: { userId, name, color: color || "#6366f1" },
        });
        res.json(tag);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create tag" });
    }
});
// Get all user tags
app.get("/api/tags", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const tags = await prisma.userTag.findMany({
            where: { userId },
            include: { problems: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(tags);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to get tags" });
    }
});
// Delete a tag
app.delete("/api/tags/:tagId", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const tagId = req.params.tagId;
        await prisma.userTag.delete({ where: { id: tagId, userId } });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete tag" });
    }
});
// Tag a problem
app.post("/api/tags/:tagId/problems", requireAuth, async (req, res) => {
    try {
        const tagId = req.params.tagId;
        const problemId = req.body.problemId;
        const existing = await prisma.problemTag.findUnique({
            where: { problemId_tagId: { problemId, tagId } },
        });
        if (existing) {
            await prisma.problemTag.delete({ where: { id: existing.id } });
            res.json({ tagged: false });
        }
        else {
            await prisma.problemTag.create({ data: { problemId, tagId } });
            res.json({ tagged: true });
        }
    }
    catch (err) {
        res.status(500).json({ error: "Failed to tag problem" });
    }
});
// Get tags for a problem
app.get("/api/problems/:problemId/tags", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.problemId;
        const problemTags = await prisma.problemTag.findMany({
            where: { problemId, tag: { userId } },
            include: { tag: true },
        });
        res.json(problemTags.map((pt) => pt.tag));
    }
    catch (err) {
        res.status(500).json({ error: "Failed to get problem tags" });
    }
});
// === SEARCH & FILTERS ===
// Global search for problems
app.get("/api/search", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { q, difficulty, status, topicId, bookmarked, tagId } = req.query;
        const where = {};
        if (q) {
            where.title = { contains: q, mode: "insensitive" };
        }
        if (difficulty) {
            where.difficulty = difficulty;
        }
        if (topicId) {
            where.topicId = topicId;
        }
        // Add status filtering directly in SQL via Prisma
        if (status) {
            if (status === "TODO") {
                where.progress = {
                    none: { userId },
                };
            }
            else {
                where.progress = {
                    some: {
                        userId,
                        status: status,
                    },
                };
            }
        }
        // Add bookmark filtering directly in SQL
        if (bookmarked === "true") {
            where.bookmarks = {
                some: { userId },
            };
        }
        // Add tag filtering directly in SQL
        if (tagId) {
            where.problemTags = {
                some: { tagId: tagId },
            };
        }
        const problems = await prisma.problem.findMany({
            where,
            include: {
                topic: true,
                progress: { where: { userId } },
                bookmarks: { where: { userId } },
                problemTags: { include: { tag: true }, where: { tag: { userId } } },
            },
            orderBy: [{ topic: { orderIndex: "asc" } }, { orderIndex: "asc" }],
        });
        const result = problems.map((p) => ({
            id: p.id,
            title: p.title,
            link: p.link,
            difficulty: p.difficulty,
            topicId: p.topicId,
            topicName: p.topic.name,
            orderIndex: p.orderIndex,
            status: p.progress[0]?.status || "TODO",
            timeSpent: p.progress[0]?.timeSpent || 0,
            nextReviewDate: p.progress[0]?.nextReviewDate,
            isBookmarked: p.bookmarks.length > 0,
            tags: p.problemTags.map((pt) => pt.tag),
        }));
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Search failed" });
    }
});
// === SPACED REPETITION / REVIEW QUEUE ===
// Get review queue (problems due for review)
app.get("/api/review-queue", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const dueReviews = await prisma.progress.findMany({
            where: {
                userId,
                status: "DONE",
                nextReviewDate: { lte: now },
            },
            include: {
                problem: { include: { topic: true } },
            },
            orderBy: { nextReviewDate: "asc" },
        });
        const upcoming = await prisma.progress.findMany({
            where: {
                userId,
                status: "DONE",
                nextReviewDate: { gt: now },
            },
            include: {
                problem: { include: { topic: true } },
            },
            orderBy: { nextReviewDate: "asc" },
            take: 20,
        });
        res.json({
            due: dueReviews.map((r) => ({
                progressId: r.id,
                problemId: r.problemId,
                title: r.problem.title,
                difficulty: r.problem.difficulty,
                topicName: r.problem.topic.name,
                link: r.problem.link,
                nextReviewDate: r.nextReviewDate,
                interval: r.interval,
                easinessFactor: r.easinessFactor,
                daysOverdue: Math.floor((now.getTime() - (r.nextReviewDate?.getTime() || 0)) /
                    (1000 * 60 * 60 * 24)),
            })),
            upcoming: upcoming.map((r) => ({
                progressId: r.id,
                problemId: r.problemId,
                title: r.problem.title,
                difficulty: r.problem.difficulty,
                topicName: r.problem.topic.name,
                link: r.problem.link,
                nextReviewDate: r.nextReviewDate,
                interval: r.interval,
            })),
            stats: {
                totalDue: dueReviews.length,
                totalUpcoming: upcoming.length,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get review queue" });
    }
});
// Complete a review (SM-2 spaced repetition algorithm)
app.post("/api/review-queue/complete", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { problemId, quality } = req.body; // quality: 0-5 (0=blackout, 5=perfect)
        const progress = await prisma.progress.findUnique({
            where: { userId_problemId: { userId, problemId } },
        });
        if (!progress)
            return res.status(404).json({ error: "Progress not found" });
        // Quality-adaptive 2-7-21 progression with reset on weak recall.
        let { easinessFactor, interval } = progress;
        const q = Math.min(5, Math.max(0, quality));
        if (q >= 3) {
            interval = getNextRevisionInterval(interval);
        }
        else {
            interval = 2;
        }
        easinessFactor =
            easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        if (easinessFactor < 1.3)
            easinessFactor = 1.3;
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + interval);
        const updated = await prisma.progress.update({
            where: { userId_problemId: { userId, problemId } },
            data: { easinessFactor, interval, nextReviewDate },
        });
        res.json({
            ...updated,
            nextReviewIn: `${interval} day${interval !== 1 ? "s" : ""}`,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to complete review" });
    }
});
app.get("/api/analytics/readiness", requireAuth, async (req, res) => {
    try {
        const readiness = await (0, services_1.getInterviewReadinessIndex)(req.user.id);
        res.json(readiness);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get interview readiness" });
    }
});
// === EXPORT PROGRESS ===
app.get("/api/export/progress", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const format = req.query.format || "json";
        const progress = await prisma.progress.findMany({
            where: { userId },
            include: {
                problem: { include: { topic: true } },
            },
            orderBy: [
                { problem: { topic: { orderIndex: "asc" } } },
                { problem: { orderIndex: "asc" } },
            ],
        });
        const data = progress.map((p) => ({
            topic: p.problem.topic.name,
            problem: p.problem.title,
            difficulty: p.problem.difficulty,
            status: p.status,
            timeSpent: p.timeSpent,
            completedAt: p.completedAt,
            link: p.problem.link,
            nextReviewDate: p.nextReviewDate,
        }));
        if (format === "csv") {
            const headers = "Topic,Problem,Difficulty,Status,Time Spent (min),Completed At,Link,Next Review\n";
            const csv = data
                .map((d) => `"${d.topic}","${d.problem}","${d.difficulty}","${d.status}",${d.timeSpent},"${d.completedAt || ""}","${d.link || ""}","${d.nextReviewDate || ""}"`)
                .join("\n");
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", "attachment; filename=dsa-progress.csv");
            res.send(headers + csv);
        }
        else {
            res.json(data);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to export progress" });
    }
});
// === AI RECOMMENDATIONS ===
app.get("/api/ai/recommendations", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [allTopicsWithProblems, solvedProgress, solutions, revisions] = await Promise.all([
            prisma.topic.findMany({
                include: {
                    problems: {
                        select: { id: true },
                    },
                },
                orderBy: { orderIndex: "asc" },
            }),
            prisma.progress.findMany({
                where: { userId, status: "DONE" },
                include: { problem: { include: { topic: true } } },
                orderBy: { completedAt: "desc" },
            }),
            prisma.solutionHistory.findMany({
                where: { userId, isCorrect: true },
                include: { problem: { include: { topic: true } } },
                orderBy: { createdAt: "desc" },
                take: 200,
            }),
            (0, services_1.getRevisionReminders)(userId),
        ]);
        const allTopics = allTopicsWithProblems.map((t) => ({
            id: t.id,
            name: t.name,
            total: t.problems.length,
        }));
        const topicNames = allTopics.map((t) => t.name);
        const recentSolutionByProblem = new Map();
        for (const solution of solutions) {
            if (!recentSolutionByProblem.has(solution.problemId)) {
                recentSolutionByProblem.set(solution.problemId, solution);
            }
        }
        const solvedProblems = solvedProgress.map((p) => {
            const latestSolution = recentSolutionByProblem.get(p.problemId);
            return {
                title: p.problem.title,
                topic: p.problem.topic.name,
                difficulty: p.problem.difficulty,
                score: latestSolution?.score ?? 0,
                isOptimal: latestSolution?.isOptimal ?? false,
            };
        });
        const solvedIds = new Set(solvedProgress.map((p) => p.problemId));
        const topicCompletion = allTopics.map((topic) => {
            const topicProblemIds = new Set(allTopicsWithProblems
                .find((t) => t.id === topic.id)
                ?.problems.map((p) => p.id) || []);
            const solvedInTopic = [...solvedIds].filter((id) => topicProblemIds.has(id)).length;
            const completionPct = topic.total > 0 ? (solvedInTopic / topic.total) * 100 : 0;
            return {
                name: topic.name,
                total: topic.total,
                solved: solvedInTopic,
                completionPct,
            };
        });
        const weakTopics = topicCompletion
            .filter((t) => t.total > 0 && t.completionPct < 50)
            .sort((a, b) => a.completionPct - b.completionPct)
            .map((t) => t.name);
        const strongTopics = topicCompletion
            .filter((t) => t.total > 0 && t.completionPct >= 70)
            .sort((a, b) => b.completionPct - a.completionPct)
            .slice(0, 5)
            .map((t) => t.name);
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        const solvedLast7d = solvedProgress.filter((p) => p.completedAt && new Date(p.completedAt).getTime() >= weekAgo).length;
        const solvedLast30d = solvedProgress.filter((p) => p.completedAt && new Date(p.completedAt).getTime() >= monthAgo).length;
        const recommendations = await (0, aiService_1.getAIRecommendations)(solvedProblems, weakTopics, topicNames, {
            revisionReminders: revisions,
            weakTopicBreakdown: topicCompletion
                .filter((t) => weakTopics.includes(t.name))
                .slice(0, 5)
                .map((topic) => ({
                name: topic.name,
                completionPct: topic.completionPct,
            })),
            solvedLast7d,
            solvedLast30d,
        });
        res.json({
            ...recommendations,
            strongTopics,
            weakTopicBreakdown: topicCompletion
                .filter((t) => weakTopics.includes(t.name))
                .slice(0, 5),
            strongTopicBreakdown: topicCompletion
                .filter((t) => strongTopics.includes(t.name))
                .slice(0, 5),
            realTime: {
                generatedAt: new Date().toISOString(),
                totalSolved: solvedProgress.length,
                solvedLast7d,
                solvedLast30d,
            },
            nextAction: buildNextAction(topicCompletion
                .filter((t) => weakTopics.includes(t.name))
                .slice(0, 5)
                .map((topic) => ({
                name: topic.name,
                completionPct: topic.completionPct,
            })), revisions, solvedLast7d),
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get recommendations" });
    }
});
// === ENHANCED ANALYTICS ===
// Time-of-day productivity
app.get("/api/analytics/productivity", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const solutions = await prisma.solutionHistory.findMany({
            where: { userId },
            select: { createdAt: true, score: true, isCorrect: true },
            orderBy: { createdAt: "desc" },
            take: 200,
        });
        // Group by hour of day
        const hourlyData = {};
        for (let h = 0; h < 24; h++) {
            hourlyData[h] = { count: 0, totalScore: 0, correct: 0 };
        }
        solutions.forEach((s) => {
            const hour = new Date(s.createdAt).getHours();
            hourlyData[hour].count++;
            hourlyData[hour].totalScore += s.score;
            if (s.isCorrect)
                hourlyData[hour].correct++;
        });
        const productivity = Object.entries(hourlyData).map(([hour, data]) => ({
            hour: parseInt(hour),
            submissions: data.count,
            avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
            successRate: data.count > 0 ? Math.round((data.correct / data.count) * 100) : 0,
        }));
        // Difficulty distribution
        const difficultyStats = await prisma.progress.groupBy({
            by: ["status"],
            where: { userId },
            _count: true,
        });
        const solvedByDifficulty = await prisma.progress.findMany({
            where: { userId, status: "DONE" },
            include: { problem: true },
        });
        const diffDist = { EASY: 0, MEDIUM: 0, HARD: 0 };
        solvedByDifficulty.forEach((p) => {
            diffDist[p.problem.difficulty]++;
        });
        // Score trend over time
        const recentSolutions = await prisma.solutionHistory.findMany({
            where: { userId },
            select: { createdAt: true, score: true, isCorrect: true },
            orderBy: { createdAt: "asc" },
            take: 50,
        });
        const scoreTrend = recentSolutions.map((s, idx) => ({
            index: idx + 1,
            score: s.score,
            date: s.createdAt,
        }));
        res.json({
            productivity,
            difficultyDistribution: diffDist,
            scoreTrend,
            totalSubmissions: solutions.length,
            avgScore: solutions.length > 0
                ? Math.round(solutions.reduce((a, b) => a + b.score, 0) / solutions.length)
                : 0,
            successRate: solutions.length > 0
                ? Math.round((solutions.filter((s) => s.isCorrect).length /
                    solutions.length) *
                    100)
                : 0,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get productivity analytics" });
    }
});
// === SERVER START ===
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "DSA Tracker API is running" });
});
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy" });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map