"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const services_1 = require("./services");
const leetcodeService_1 = require("./leetcodeService");
const aiService_1 = require("./aiService");
const templates_1 = require("./templates");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3001;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Auth Header: ${req.headers.authorization ? "Present" : "Missing"}`);
    next();
});
// Auto-admin hook for specific email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "rajat.sharma.myid1@gmail.com"; // Defaulting to your email
// Authentication Middleware
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, NEXTAUTH_SECRET);
        if (!decoded.email) {
            return res
                .status(401)
                .json({ error: "Unauthorized: Invalid token payload" });
        }
        // Upsert user by email so they're created on first request
        let user = (await prisma.user.upsert({
            where: { email: decoded.email },
            update: {},
            create: {
                email: decoded.email,
                role: "USER",
            },
        }));
        // Auto-promote to ADMIN if email matches
        if (user.email === ADMIN_EMAIL && user.role !== "ADMIN") {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { role: "ADMIN" },
            });
        }
        req.user = { id: user.id, role: user.role };
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
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
        const totalProblems = await prisma.problem.count();
        const solvedProblems = await prisma.progress.count({
            where: { userId, status: "DONE" },
        });
        const streak = await prisma.streak.findUnique({
            where: { userId },
        });
        // Pass userId to services if they require it, adjusting as needed
        const weakTopics = await (0, services_1.getWeakTopics)(userId);
        const revisions = await (0, services_1.getRevisionReminders)(userId);
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
app.get("/api/learn/tracks", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const tracks = await prisma.$queryRaw `
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
        if (tracks.length === 0) {
            return res.json([]);
        }
        const trackIds = tracks.map((t) => t.id);
        const modules = await prisma.$queryRaw(client_1.Prisma.sql `
      SELECT
        id,
        track_id AS "trackId",
        slug,
        title,
        summary,
        order_index AS "orderIndex",
        estimated_minutes AS "estimatedMinutes"
      FROM theory_modules
      WHERE is_published = true
        AND track_id IN (${client_1.Prisma.join(trackIds)})
      ORDER BY order_index ASC, created_at ASC
    `);
        const moduleIds = modules.map((m) => m.id);
        const lessons = moduleIds.length > 0
            ? await prisma.$queryRaw(client_1.Prisma.sql `
          SELECT
            id,
            module_id AS "moduleId",
            slug,
            title,
            summary,
            order_index AS "orderIndex",
            estimated_minutes AS "estimatedMinutes",
            difficulty::text AS difficulty
          FROM theory_lessons
          WHERE is_published = true
            AND module_id IN (${client_1.Prisma.join(moduleIds)})
          ORDER BY order_index ASC, created_at ASC
        `)
            : [];
        const lessonIds = lessons.map((l) => l.id);
        const progressRows = lessonIds.length > 0
            ? await prisma.$queryRaw(client_1.Prisma.sql `
          SELECT
            lesson_id AS "lessonId",
            status::text AS status,
            progress_percent AS "progressPercent"
          FROM user_theory_lesson_progress
          WHERE user_id = ${userId}
            AND lesson_id IN (${client_1.Prisma.join(lessonIds)})
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
        res.status(500).json({
            error: "Failed to load learn tracks",
            hint: "Ensure theory migration has been applied.",
        });
    }
});
app.get("/api/learn/tracks/:trackSlug/modules/:moduleSlug/lessons/:lessonSlug", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { trackSlug, moduleSlug, lessonSlug } = req.params;
        const lessons = await prisma.$queryRaw `
        SELECT
          l.id,
          l.title,
          l.summary,
          l.difficulty::text AS difficulty,
          l.estimated_minutes AS "estimatedMinutes",
          l.learning_objectives AS "learningObjectives",
          m.id AS "moduleId",
          m.title AS "moduleTitle",
          m.slug AS "moduleSlug",
          t.title AS "trackTitle",
          t.slug AS "trackSlug"
        FROM theory_lessons l
        INNER JOIN theory_modules m ON m.id = l.module_id
        INNER JOIN theory_tracks t ON t.id = m.track_id
        WHERE t.slug = ${trackSlug}
          AND m.slug = ${moduleSlug}
          AND l.slug = ${lessonSlug}
          AND t.is_published = true
          AND m.is_published = true
          AND l.is_published = true
        LIMIT 1
      `;
        const lesson = lessons[0];
        if (!lesson) {
            return res.status(404).json({ error: "Lesson not found" });
        }
        const blocks = await prisma.$queryRaw `
        SELECT
          id,
          block_type::text AS "blockType",
          order_index AS "orderIndex",
          content,
          language
        FROM theory_lesson_blocks
        WHERE lesson_id = ${lesson.id}
        ORDER BY order_index ASC
      `;
        const progressRows = await prisma.$queryRaw `
        SELECT
          status::text AS status,
          progress_percent AS "progressPercent",
          time_spent_seconds AS "timeSpentSeconds",
          completed_at AS "completedAt"
        FROM user_theory_lesson_progress
        WHERE user_id = ${userId}
          AND lesson_id = ${lesson.id}
      `;
        const progress = progressRows[0] ||
            {
                status: "NOT_STARTED",
                progressPercent: 0,
                timeSpentSeconds: 0,
                completedAt: null,
            };
        const siblingLessons = await prisma.$queryRaw `
        SELECT id, slug, title, order_index AS "orderIndex"
        FROM theory_lessons
        WHERE module_id = ${lesson.moduleId}
          AND is_published = true
        ORDER BY order_index ASC, created_at ASC
      `;
        const siblingProgressRows = await prisma.$queryRaw `
        SELECT
          lesson_id AS "lessonId",
          status::text AS status
        FROM user_theory_lesson_progress
        WHERE user_id = ${userId}
          AND lesson_id IN (
            SELECT id FROM theory_lessons WHERE module_id = ${lesson.moduleId}
          )
      `;
        const siblingProgress = new Map(siblingProgressRows.map((row) => [row.lessonId, row.status]));
        const problems = await prisma.$queryRaw `
        SELECT
          p.id,
          p.title,
          p.difficulty::text AS difficulty,
          p.link,
          t.name AS "topicName",
          tpl.required,
          tpl.order_index AS "orderIndex",
          CASE WHEN pr.status = 'DONE' THEN true ELSE false END AS solved
        FROM theory_problem_links tpl
        INNER JOIN "Problem" p ON p.id = tpl.problem_id
        LEFT JOIN "Topic" t ON t.id = p."topicId"
        LEFT JOIN "Progress" pr ON pr."problemId" = p.id AND pr."userId" = ${userId}
        WHERE tpl.lesson_id = ${lesson.id}
           OR (tpl.lesson_id IS NULL AND tpl.module_id = ${lesson.moduleId})
        ORDER BY tpl.order_index ASC
      `;
        const isUnlocked = progress.status === "COMPLETED";
        res.json({
            lesson: {
                id: lesson.id,
                title: lesson.title,
                summary: lesson.summary,
                difficulty: lesson.difficulty,
                estimatedMinutes: lesson.estimatedMinutes,
                learningObjectives: lesson.learningObjectives,
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
            blocks,
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
          AND is_published = true
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
        const existing = await prisma.$queryRaw `
        SELECT COUNT(*)::bigint AS count FROM theory_tracks
      `;
        if (Number(existing[0]?.count || 0) > 0) {
            return res.json({
                success: true,
                seeded: false,
                message: "Theory data already exists",
            });
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
        res.json({
            success: true,
            seeded: true,
            tracks: 1,
            modules: 1,
            lessons: 2,
        });
    }
    catch (error) {
        console.error("Theory seed error:", error);
        res.status(500).json({ error: "Failed to seed theory content" });
    }
});
// 4. Update Problem Progress
app.post("/api/progress", requireAuth, async (req, res) => {
    try {
        const { problemId, status, timeSpent } = req.body;
        const userId = req.user.id;
        const progress = await prisma.progress.upsert({
            where: {
                userId_problemId: {
                    userId,
                    problemId,
                },
            },
            update: {
                status,
                timeSpent,
                completedAt: status === "DONE" ? new Date() : null,
            },
            create: {
                userId,
                problemId,
                status,
                timeSpent,
                completedAt: status === "DONE" ? new Date() : null,
            },
        });
        // Spaced Repetition logic (SM-2 simplified)
        if (status === "DONE") {
            const existing = (await prisma.progress.findUnique({
                where: { userId_problemId: { userId, problemId } },
            }));
            let nextInterval = 1;
            let nextEF = existing?.easinessFactor || 2.5;
            if (!existing || existing.interval === 0) {
                nextInterval = 1;
            }
            else if (existing.interval === 1) {
                nextInterval = 6;
            }
            else {
                nextInterval = Math.round(existing.interval * nextEF);
            }
            const nextReview = new Date();
            nextReview.setDate(nextReview.getDate() + nextInterval);
            await prisma.progress.update({
                where: { userId_problemId: { userId, problemId } },
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
                const date = p.completedAt.toISOString().split("T")[0];
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
        await prisma.user.update({
            where: { id: userId },
            data: { leetcodeUsername },
        });
        res.json({ success: true, leetcodeUsername });
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
            if (syncSource === "session" && user.leetcodeSession) {
                try {
                    const subs = await (0, leetcodeService_1.fetchProblemSubmissions)(slug, user.leetcodeSession);
                    const theSub = subs?.questionSubmissionList?.submissions?.find((s) => s.statusDisplay === "Accepted");
                    if (theSub) {
                        // These strings look like: "45 ms" or "16.4 MB"
                        runtimeOpt = theSub.runtime;
                        memoryOpt = theSub.memory;
                    }
                }
                catch (e) {
                    // Silent fallback, could be invalid session or quota limits
                }
            }
            if (problem) {
                await prisma.progress.upsert({
                    where: { userId_problemId: { userId, problemId: problem.id } },
                    update: {
                        status: "DONE",
                        completedAt: new Date(sub.timestamp * 1000),
                        ...(runtimeOpt && { leetcodeRuntime: runtimeOpt }),
                        ...(memoryOpt && { leetcodeMemory: memoryOpt }),
                    },
                    create: {
                        userId,
                        problemId: problem.id,
                        status: "DONE",
                        completedAt: new Date(sub.timestamp * 1000),
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
                        completedAt: new Date(sub.timestamp * 1000),
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
        await prisma.user.update({
            where: { id: userId },
            data: { leetcodeSession },
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
        if (!problemSlug || !leetcodeSession) {
            return res.status(400).json({ error: "Missing problemSlug or session" });
        }
        const user = (await prisma.user.findFirst({
            where: { leetcodeSession },
        }));
        if (!user) {
            return res
                .status(401)
                .json({ error: "No user linked to this LeetCode session" });
        }
        const data = await (0, leetcodeService_1.fetchProblemSubmissions)(problemSlug, leetcodeSession);
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
                    link: `https://leetcode.com/problems/${problemSlug}/`,
                    difficulty: "MEDIUM",
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
        await prisma.user.update({
            where: { id: userId },
            data: { leetcodeSession: leetcodeSession.trim() },
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
        const userId = req.userId;
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
        const userId = req.userId;
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
        const userId = req.userId;
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
        const userId = req.userId;
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
        const userId = req.userId;
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
        const userId = req.userId;
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
        const userId = req.userId;
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
        const userId = req.userId;
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
        const userId = req.userId;
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
        let problems = await prisma.problem.findMany({
            where,
            include: {
                topic: true,
                progress: { where: { userId } },
                bookmarks: { where: { userId } },
                problemTags: { include: { tag: true }, where: { tag: { userId } } },
            },
            orderBy: [{ topic: { orderIndex: "asc" } }, { orderIndex: "asc" }],
        });
        // Filter by progress status (post-query since it's a relation)
        if (status) {
            problems = problems.filter((p) => {
                const prog = p.progress[0];
                if (status === "TODO")
                    return !prog || prog.status === "TODO";
                return prog?.status === status;
            });
        }
        // Filter by bookmarked
        if (bookmarked === "true") {
            problems = problems.filter((p) => p.bookmarks.length > 0);
        }
        // Filter by tag
        if (tagId) {
            problems = problems.filter((p) => p.problemTags.some((pt) => pt.tagId === tagId));
        }
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
        // SM-2 Algorithm
        let { easinessFactor, interval } = progress;
        const q = Math.min(5, Math.max(0, quality));
        if (q >= 3) {
            // Correct response
            if (interval === 0) {
                interval = 1;
            }
            else if (interval === 1) {
                interval = 6;
            }
            else {
                interval = Math.round(interval * easinessFactor);
            }
        }
        else {
            // Incorrect — reset
            interval = 1;
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
        // Get user's solved problems with scores
        const solutions = await prisma.solutionHistory.findMany({
            where: { userId, isCorrect: true },
            include: { problem: { include: { topic: true } } },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        const solvedProblems = solutions.map((s) => ({
            title: s.problem.title,
            topic: s.problem.topic.name,
            difficulty: s.problem.difficulty,
            score: s.score,
            isOptimal: s.isOptimal,
        }));
        // Get weak topics
        const allTopics = await prisma.topic.findMany({
            orderBy: { orderIndex: "asc" },
        });
        const topicNames = allTopics.map((t) => t.name);
        // Calculate weak topics based on progress
        const progressByTopic = await prisma.progress.groupBy({
            by: ["problemId"],
            where: { userId, status: "DONE" },
        });
        const topicCompletionMap = {};
        for (const topic of allTopics) {
            const total = await prisma.problem.count({
                where: { topicId: topic.id },
            });
            const solved = await prisma.progress.count({
                where: { userId, status: "DONE", problem: { topicId: topic.id } },
            });
            topicCompletionMap[topic.name] = total > 0 ? (solved / total) * 100 : 0;
        }
        const weakTopics = Object.entries(topicCompletionMap)
            .filter(([_, pct]) => pct < 50)
            .sort(([_, a], [__, b]) => a - b)
            .map(([name]) => name);
        const recommendations = await (0, aiService_1.getAIRecommendations)(solvedProblems, weakTopics, topicNames);
        res.json(recommendations);
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