"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Hardcoded user ID for MVP
// In a real app, this would come from JWT middleware
const USER_EMAIL = 'user@dsatracker.local';
async function getUserId() {
    const user = await prisma.user.findUnique({
        where: { email: USER_EMAIL }
    });
    return user?.id;
}
// 1. Get Dashboard Stats
app.get('/api/dashboard', async (req, res) => {
    try {
        const userId = await getUserId();
        if (!userId) {
            return res.status(404).json({ error: 'User not found' });
        }
        const totalProblems = await prisma.problem.count();
        const solvedProblems = await prisma.progress.count({
            where: { userId, status: 'DONE' }
        });
        const streak = await prisma.streak.findUnique({
            where: { userId }
        });
        res.json({
            totalProblems,
            solvedProblems,
            progressPercentage: Math.round((solvedProblems / totalProblems) * 100),
            currentStreak: streak?.currentStreak || 0,
            longestStreak: streak?.longestStreak || 0,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 2. Get All Topics with Progress
app.get('/api/topics', async (req, res) => {
    try {
        const userId = await getUserId();
        const topics = await prisma.topic.findMany({
            include: {
                problems: {
                    include: {
                        progress: {
                            where: { userId }
                        }
                    }
                }
            },
            orderBy: { orderIndex: 'asc' }
        });
        const enrichedTopics = topics.map(topic => {
            const total = topic.problems.length;
            const solved = topic.problems.filter(p => p.progress[0]?.status === 'DONE').length;
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
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 3. Get Problems for a Topic
app.get('/api/topics/:topicId/problems', async (req, res) => {
    try {
        const { topicId } = req.params;
        const userId = await getUserId();
        const problems = await prisma.problem.findMany({
            where: { topicId },
            include: {
                progress: {
                    where: { userId }
                }
            },
            orderBy: { orderIndex: 'asc' }
        });
        const enrichedProblems = problems.map(problem => ({
            ...problem,
            status: problem.progress[0]?.status || 'TODO',
            timeSpent: problem.progress[0]?.timeSpent || 0,
        }));
        res.json(enrichedProblems);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 4. Update Problem Progress
app.post('/api/progress', async (req, res) => {
    try {
        const { problemId, status, timeSpent } = req.body;
        const userId = await getUserId();
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const progress = await prisma.progress.upsert({
            where: {
                userId_problemId: {
                    userId,
                    problemId
                }
            },
            update: {
                status,
                timeSpent,
                completedAt: status === 'DONE' ? new Date() : null,
            },
            create: {
                userId,
                problemId,
                status,
                timeSpent,
                completedAt: status === 'DONE' ? new Date() : null,
            }
        });
        // Update Streak logic
        if (status === 'DONE') {
            const streak = await prisma.streak.upsert({
                where: { userId },
                update: {},
                create: {
                    userId,
                    currentStreak: 0,
                    longestStreak: 0,
                    lastActivityDate: new Date(0)
                }
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
                        lastActivityDate: new Date()
                    }
                });
            }
            else if (diffDays > 1) {
                // Reset streak
                await prisma.streak.update({
                    where: { userId },
                    data: {
                        currentStreak: 1,
                        lastActivityDate: new Date()
                    }
                });
            }
        }
        res.json(progress);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map