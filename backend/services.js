"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklyReport = exports.getAchievements = exports.getTimeAnalytics = exports.getDailyProblem = exports.getMasteryStats = exports.getWeakTopics = exports.getRevisionReminders = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getRevisionReminders = async (userId) => {
    // In a real Spaced Repetition logic, this would check intervals.
    // simplistic approach: Find problems completed more than 3 days ago
    const now = new Date();
    const staleProblems = await prisma.progress.findMany({
        where: {
            userId,
            status: 'DONE',
            nextReviewDate: {
                lte: now
            }
        },
        include: {
            problem: {
                include: { topic: true }
            }
        },
        orderBy: { nextReviewDate: 'asc' },
        take: 5
    });
    return staleProblems.map(p => ({
        id: p.problem.id,
        title: p.problem.title,
        topicName: p.problem.topic.name,
        daysSince: p.completedAt ? Math.floor((new Date().getTime() - p.completedAt.getTime()) / (1000 * 3600 * 24)) : 0
    }));
};
exports.getRevisionReminders = getRevisionReminders;
const getWeakTopics = async (userId) => {
    // Logic: calculate average time spent per problem per topic among DONE problems
    const progressRecords = await prisma.progress.findMany({
        where: { userId, status: 'DONE' },
        include: { problem: { include: { topic: true } } }
    });
    const topicStats = {};
    progressRecords.forEach(p => {
        const tId = p.problem.topicId;
        if (!topicStats[tId]) {
            topicStats[tId] = { totalTime: 0, count: 0, name: p.problem.topic.name };
        }
        topicStats[tId].totalTime += p.timeSpent;
        topicStats[tId].count += 1;
    });
    return Object.values(topicStats)
        .map(t => ({
        name: t.name,
        avgTimeSpent: t.count > 0 ? Math.round(t.totalTime / t.count) : 0
    }))
        // Topics with average time > 30 mins are considered weak
        .filter(t => t.avgTimeSpent > 30)
        .sort((a, b) => b.avgTimeSpent - a.avgTimeSpent);
};
exports.getWeakTopics = getWeakTopics;
const getMasteryStats = async (userId) => {
    // Get all topics and their problems
    const topics = await prisma.topic.findMany({
        include: { problems: true }
    });
    const userProgress = await prisma.progress.findMany({
        where: { userId, status: 'DONE' }
    });
    const solvedProblemIds = new Set(userProgress.map(p => p.problemId));
    const difficultyWeights = {
        EASY: 1,
        MEDIUM: 2,
        HARD: 3
    };
    const stats = topics.map(topic => {
        let totalPossibleScore = 0;
        let userScore = 0;
        topic.problems.forEach(prob => {
            const weight = difficultyWeights[prob.difficulty] || 1;
            totalPossibleScore += weight;
            if (solvedProblemIds.has(prob.id)) {
                userScore += weight;
            }
        });
        // Calculate mastery as a percentage (0-100)
        const masteryBoost = totalPossibleScore > 0 ? (userScore / totalPossibleScore) * 100 : 0;
        return {
            subject: topic.name,
            A: Math.round(masteryBoost), // Our current mastery
            fullMark: 100
        };
    });
    // Sort by name or mastery
    return stats.sort((a, b) => a.subject.localeCompare(b.subject));
};
exports.getMasteryStats = getMasteryStats;
const getDailyProblem = async (userId) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Priority 1: Problem due for spaced repetition review
    const dueForReview = await prisma.progress.findFirst({
        where: {
            userId,
            status: 'DONE',
            nextReviewDate: { lte: now }
        },
        include: {
            problem: { include: { topic: true } }
        },
        orderBy: { nextReviewDate: 'asc' },
    });
    if (dueForReview) {
        return {
            source: 'REVISION',
            reason: `This problem is due for spaced repetition review. You solved it ${Math.floor((now.getTime() - (dueForReview.completedAt?.getTime() || now.getTime())) / (1000 * 3600 * 24))} days ago.`,
            problem: {
                id: dueForReview.problem.id,
                title: dueForReview.problem.title,
                difficulty: dueForReview.problem.difficulty,
                link: dueForReview.problem.link,
                topicName: dueForReview.problem.topic.name,
                topicId: dueForReview.problem.topicId,
            }
        };
    }
    // Priority 2: Unsolved problem from the weakest topic
    const topics = await prisma.topic.findMany({
        include: { problems: true }
    });
    const userProgress = await prisma.progress.findMany({
        where: { userId }
    });
    const solvedIds = new Set(userProgress.filter(p => p.status === 'DONE').map(p => p.problemId));
    // Calculate completion % per topic
    const topicScores = topics.map(topic => {
        const total = topic.problems.length;
        const solved = topic.problems.filter(p => solvedIds.has(p.id)).length;
        const unsolved = topic.problems.filter(p => !solvedIds.has(p.id));
        return {
            topic,
            total,
            solved,
            completionPct: total > 0 ? (solved / total) * 100 : 100,
            unsolved
        };
    }).filter(t => t.unsolved.length > 0) // Only topics with unsolved problems
        .sort((a, b) => a.completionPct - b.completionPct); // Weakest first
    if (topicScores.length > 0) {
        const weakest = topicScores[0];
        // Use date as seed for deterministic daily pick
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 3600 * 24));
        const idx = dayOfYear % weakest.unsolved.length;
        const picked = weakest.unsolved[idx];
        return {
            source: 'WEAKNESS',
            reason: `From your weakest area: ${weakest.topic.name} (${weakest.solved}/${weakest.total} completed). Focus here to level up.`,
            problem: {
                id: picked.id,
                title: picked.title,
                difficulty: picked.difficulty,
                link: picked.link,
                topicName: weakest.topic.name,
                topicId: weakest.topic.id,
            }
        };
    }
    // Priority 3: All done — no problems left
    return null;
};
exports.getDailyProblem = getDailyProblem;
const getTimeAnalytics = async (userId) => {
    const allProgress = await prisma.progress.findMany({
        where: { userId, status: 'DONE' },
        include: { problem: { include: { topic: true } } },
        orderBy: { completedAt: 'asc' }
    });
    if (allProgress.length === 0) {
        return {
            totalTimeMinutes: 0,
            totalSolved: 0,
            avgByDifficulty: { EASY: 0, MEDIUM: 0, HARD: 0 },
            weeklyTrends: [],
            speedInsights: [],
            topicBreakdown: [],
            fastest: null,
            slowest: null,
        };
    }
    // === Average time per difficulty ===
    const byDifficulty = {
        EASY: { total: 0, count: 0 },
        MEDIUM: { total: 0, count: 0 },
        HARD: { total: 0, count: 0 },
    };
    let totalTime = 0;
    let fastest = null;
    let slowest = null;
    allProgress.forEach(p => {
        const diff = p.problem.difficulty;
        if (byDifficulty[diff]) {
            byDifficulty[diff].total += p.timeSpent;
            byDifficulty[diff].count += 1;
        }
        totalTime += p.timeSpent;
        if (p.timeSpent > 0) {
            if (!fastest || p.timeSpent < fastest.timeSpent) {
                fastest = { title: p.problem.title, topicName: p.problem.topic.name, timeSpent: p.timeSpent, difficulty: p.problem.difficulty };
            }
            if (!slowest || p.timeSpent > slowest.timeSpent) {
                slowest = { title: p.problem.title, topicName: p.problem.topic.name, timeSpent: p.timeSpent, difficulty: p.problem.difficulty };
            }
        }
    });
    const avgByDifficulty = {
        EASY: byDifficulty.EASY.count > 0 ? Math.round(byDifficulty.EASY.total / byDifficulty.EASY.count) : 0,
        MEDIUM: byDifficulty.MEDIUM.count > 0 ? Math.round(byDifficulty.MEDIUM.total / byDifficulty.MEDIUM.count) : 0,
        HARD: byDifficulty.HARD.count > 0 ? Math.round(byDifficulty.HARD.total / byDifficulty.HARD.count) : 0,
    };
    // === Weekly trends (last 8 weeks) ===
    const now = new Date();
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
        const end = new Date(now);
        end.setDate(end.getDate() - (i * 7));
        const start = new Date(end);
        start.setDate(start.getDate() - 7);
        const label = `W${8 - i}`;
        weeks.push({ weekLabel: label, startDate: start, endDate: end });
    }
    const weeklyTrends = weeks.map(w => {
        const weekProblems = allProgress.filter(p => {
            const completed = p.completedAt ? new Date(p.completedAt) : null;
            return completed && completed >= w.startDate && completed < w.endDate;
        });
        const easyAvg = weekProblems.filter(p => p.problem.difficulty === 'EASY');
        const medAvg = weekProblems.filter(p => p.problem.difficulty === 'MEDIUM');
        const hardAvg = weekProblems.filter(p => p.problem.difficulty === 'HARD');
        const avg = (arr) => arr.length > 0 ? Math.round(arr.reduce((s, p) => s + p.timeSpent, 0) / arr.length) : 0;
        return {
            week: w.weekLabel,
            solved: weekProblems.length,
            avgTime: avg(weekProblems),
            avgEasy: avg(easyAvg),
            avgMedium: avg(medAvg),
            avgHard: avg(hardAvg),
        };
    });
    // === Speed Insights (compare last 2 weeks vs previous 2 weeks) ===
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentProblems = allProgress.filter(p => p.completedAt && new Date(p.completedAt) >= twoWeeksAgo);
    const olderProblems = allProgress.filter(p => p.completedAt && new Date(p.completedAt) >= fourWeeksAgo && new Date(p.completedAt) < twoWeeksAgo);
    const speedInsights = [];
    for (const diff of ['EASY', 'MEDIUM', 'HARD']) {
        const recent = recentProblems.filter(p => p.problem.difficulty === diff);
        const older = olderProblems.filter(p => p.problem.difficulty === diff);
        const recentAvg = recent.length > 0 ? Math.round(recent.reduce((s, p) => s + p.timeSpent, 0) / recent.length) : 0;
        const olderAvg = older.length > 0 ? Math.round(older.reduce((s, p) => s + p.timeSpent, 0) / older.length) : 0;
        let change = 0;
        if (olderAvg > 0 && recentAvg > 0) {
            change = Math.round(((olderAvg - recentAvg) / olderAvg) * 100);
        }
        speedInsights.push({ difficulty: diff, recentAvg, olderAvg, change });
    }
    // === Topic breakdown ===
    const topicMap = {};
    allProgress.forEach(p => {
        const name = p.problem.topic.name;
        if (!topicMap[name])
            topicMap[name] = { name, totalTime: 0, count: 0 };
        topicMap[name].totalTime += p.timeSpent;
        topicMap[name].count += 1;
    });
    const topicBreakdown = Object.values(topicMap)
        .map(t => ({ ...t, avgTime: Math.round(t.totalTime / t.count) }))
        .sort((a, b) => b.totalTime - a.totalTime);
    return {
        totalTimeMinutes: totalTime,
        totalSolved: allProgress.length,
        avgByDifficulty,
        weeklyTrends,
        speedInsights,
        topicBreakdown,
        fastest,
        slowest,
    };
};
exports.getTimeAnalytics = getTimeAnalytics;
const getAchievements = async (userId) => {
    const [progress, streak, topics] = await Promise.all([
        prisma.progress.findMany({
            where: { userId },
            include: { problem: { include: { topic: true } } },
            orderBy: { updatedAt: 'desc' }
        }),
        prisma.streak.findFirst({ where: { userId } }),
        prisma.topic.findMany({ include: { problems: true } }),
    ]);
    const solvedProgress = progress.filter(p => p.status === 'DONE');
    const totalSolved = solvedProgress.length;
    const currentStreak = streak?.currentStreak || 0;
    const longestStreak = streak?.longestStreak || 0;
    // Count per difficulty
    const easySolved = solvedProgress.filter(p => p.problem.difficulty === 'EASY').length;
    const medSolved = solvedProgress.filter(p => p.problem.difficulty === 'MEDIUM').length;
    const hardSolved = solvedProgress.filter(p => p.problem.difficulty === 'HARD').length;
    // Topics fully completed
    const solvedIds = new Set(solvedProgress.map(p => p.problemId));
    const completedTopics = topics.filter(t => t.problems.length > 0 && t.problems.every(p => solvedIds.has(p.id)));
    // Topics with at least one solve
    const touchedTopics = topics.filter(t => t.problems.some(p => solvedIds.has(p.id)));
    const badges = [
        // Solve milestones
        { id: 'first-blood', name: 'First Blood', description: 'Solve your first problem', icon: '🩸', category: 'Milestones', unlocked: totalSolved >= 1, progress: Math.min(100, (totalSolved / 1) * 100) },
        { id: 'getting-started', name: 'Getting Started', description: 'Solve 10 problems', icon: '🚀', category: 'Milestones', unlocked: totalSolved >= 10, progress: Math.min(100, (totalSolved / 10) * 100) },
        { id: 'quarter-century', name: 'Quarter Century', description: 'Solve 25 problems', icon: '🎯', category: 'Milestones', unlocked: totalSolved >= 25, progress: Math.min(100, (totalSolved / 25) * 100) },
        { id: 'half-century', name: 'Half Century', description: 'Solve 50 problems', icon: '⚡', category: 'Milestones', unlocked: totalSolved >= 50, progress: Math.min(100, (totalSolved / 50) * 100) },
        { id: 'centurion', name: 'Centurion', description: 'Solve 100 problems', icon: '💯', category: 'Milestones', unlocked: totalSolved >= 100, progress: Math.min(100, (totalSolved / 100) * 100) },
        { id: 'grinder', name: 'The Grinder', description: 'Solve 200 problems', icon: '🏭', category: 'Milestones', unlocked: totalSolved >= 200, progress: Math.min(100, (totalSolved / 200) * 100) },
        // Streak badges
        { id: 'streak-3', name: 'Warming Up', description: '3-day streak', icon: '🔥', category: 'Consistency', unlocked: longestStreak >= 3, progress: Math.min(100, (longestStreak / 3) * 100) },
        { id: 'streak-7', name: 'Week Warrior', description: '7-day streak', icon: '⚔️', category: 'Consistency', unlocked: longestStreak >= 7, progress: Math.min(100, (longestStreak / 7) * 100) },
        { id: 'streak-14', name: 'Fortnight Fighter', description: '14-day streak', icon: '🛡️', category: 'Consistency', unlocked: longestStreak >= 14, progress: Math.min(100, (longestStreak / 14) * 100) },
        { id: 'streak-30', name: 'Monthly Master', description: '30-day streak', icon: '👑', category: 'Consistency', unlocked: longestStreak >= 30, progress: Math.min(100, (longestStreak / 30) * 100) },
        // Difficulty badges
        { id: 'easy-10', name: 'Easy Breezy', description: 'Solve 10 Easy problems', icon: '🟢', category: 'Difficulty', unlocked: easySolved >= 10, progress: Math.min(100, (easySolved / 10) * 100) },
        { id: 'med-10', name: 'Medium Rare', description: 'Solve 10 Medium problems', icon: '🟡', category: 'Difficulty', unlocked: medSolved >= 10, progress: Math.min(100, (medSolved / 10) * 100) },
        { id: 'hard-5', name: 'Hardened', description: 'Solve 5 Hard problems', icon: '🔴', category: 'Difficulty', unlocked: hardSolved >= 5, progress: Math.min(100, (hardSolved / 5) * 100) },
        { id: 'hard-10', name: 'Beast Mode', description: 'Solve 10 Hard problems', icon: '💀', category: 'Difficulty', unlocked: hardSolved >= 10, progress: Math.min(100, (hardSolved / 10) * 100) },
        // Topic badges
        { id: 'explorer', name: 'Explorer', description: 'Attempt problems from 5 different topics', icon: '🧭', category: 'Exploration', unlocked: touchedTopics.length >= 5, progress: Math.min(100, (touchedTopics.length / 5) * 100) },
        { id: 'well-rounded', name: 'Well Rounded', description: 'Attempt problems from 10 different topics', icon: '🌍', category: 'Exploration', unlocked: touchedTopics.length >= 10, progress: Math.min(100, (touchedTopics.length / 10) * 100) },
        { id: 'topic-master', name: 'Topic Master', description: 'Complete all problems in any topic', icon: '🏅', category: 'Mastery', unlocked: completedTopics.length >= 1, progress: completedTopics.length >= 1 ? 100 : 0 },
        { id: 'multi-master', name: 'Multi-Master', description: 'Complete all problems in 3 topics', icon: '🎖️', category: 'Mastery', unlocked: completedTopics.length >= 3, progress: Math.min(100, (completedTopics.length / 3) * 100) },
        { id: 'completionist', name: 'Completionist', description: 'Complete all problems in 5 topics', icon: '🏆', category: 'Mastery', unlocked: completedTopics.length >= 5, progress: Math.min(100, (completedTopics.length / 5) * 100) },
    ];
    const unlockedCount = badges.filter(b => b.unlocked).length;
    return {
        badges,
        stats: {
            totalBadges: badges.length,
            unlocked: unlockedCount,
            totalSolved,
            currentStreak,
            longestStreak,
            completedTopics: completedTopics.length,
        }
    };
};
exports.getAchievements = getAchievements;
// =====================================================
// WEEKLY PROGRESS REPORT
// =====================================================
const getWeeklyReport = async (userId) => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const [allProgress, streak, topics] = await Promise.all([
        prisma.progress.findMany({
            where: { userId },
            include: { problem: { include: { topic: true } } }
        }),
        prisma.streak.findFirst({ where: { userId } }),
        prisma.topic.findMany({ include: { problems: true } }),
    ]);
    const solvedAll = allProgress.filter(p => p.status === 'DONE');
    const solvedIds = new Set(solvedAll.map(p => p.problemId));
    // This week's solves
    const thisWeekSolves = solvedAll.filter(p => p.completedAt && new Date(p.completedAt) >= weekAgo);
    // Last week's solves
    const lastWeekSolves = solvedAll.filter(p => p.completedAt && new Date(p.completedAt) >= twoWeeksAgo && new Date(p.completedAt) < weekAgo);
    // Difficulty breakdown this week
    const diffBreakdown = {
        EASY: thisWeekSolves.filter(p => p.problem.difficulty === 'EASY').length,
        MEDIUM: thisWeekSolves.filter(p => p.problem.difficulty === 'MEDIUM').length,
        HARD: thisWeekSolves.filter(p => p.problem.difficulty === 'HARD').length,
    };
    // Topics touched this week
    const topicsTouched = new Set(thisWeekSolves.map(p => p.problem.topic.name));
    // Topics progress
    const topicProgress = topics.map(t => {
        const total = t.problems.length;
        const solved = t.problems.filter(p => solvedIds.has(p.id)).length;
        return { name: t.name, total, solved, pct: total > 0 ? Math.round((solved / total) * 100) : 0 };
    }).sort((a, b) => b.pct - a.pct);
    // Weakest topics (< 30% completion with at least 1 problem)
    const weakTopics = topicProgress.filter(t => t.total > 0 && t.pct < 30).slice(0, 3);
    // Strongest topics
    const strongTopics = topicProgress.filter(t => t.pct >= 70 && t.total > 0).slice(0, 3);
    // Week over week change
    const solvedChange = thisWeekSolves.length - lastWeekSolves.length;
    // Time this week
    const timeThisWeek = thisWeekSolves.reduce((s, p) => s + p.timeSpent, 0);
    // Generate summary text
    let summaryText = '';
    if (thisWeekSolves.length === 0) {
        summaryText = "No problems solved this week. Jump back in — consistency is key!";
    }
    else if (solvedChange > 0) {
        summaryText = `Great week! You solved ${thisWeekSolves.length} problems — that's ${solvedChange} more than last week. Keep the momentum!`;
    }
    else if (solvedChange === 0) {
        summaryText = `Solid week with ${thisWeekSolves.length} problems solved — same pace as last week. Can you push for more?`;
    }
    else {
        summaryText = `You solved ${thisWeekSolves.length} problems this week. That's ${Math.abs(solvedChange)} fewer than last week — let's pick it up!`;
    }
    return {
        period: {
            start: weekAgo.toISOString(),
            end: now.toISOString(),
        },
        summary: summaryText,
        thisWeek: {
            solved: thisWeekSolves.length,
            timeMinutes: timeThisWeek,
            diffBreakdown,
            topicsTouched: Array.from(topicsTouched),
        },
        lastWeek: {
            solved: lastWeekSolves.length,
        },
        solvedChange,
        streak: {
            current: streak?.currentStreak || 0,
            longest: streak?.longestStreak || 0,
        },
        overall: {
            totalSolved: solvedAll.length,
            totalProblems: topics.reduce((s, t) => s + t.problems.length, 0),
        },
        weakTopics,
        strongTopics,
        topicProgress: topicProgress.slice(0, 8),
    };
};
exports.getWeeklyReport = getWeeklyReport;
//# sourceMappingURL=services.js.map