"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklyReport = exports.getAchievements = exports.getTimeAnalytics = exports.getInterviewReadinessIndex = exports.getDailyProblem = exports.getMasteryStats = exports.getWeakTopics = exports.getRevisionReminders = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const difficultyWeight = {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3,
};
const targetSolveMinutes = {
    EASY: 20,
    MEDIUM: 35,
    HARD: 55,
};
const getRevisionReminders = async (userId) => {
    // In a real Spaced Repetition logic, this would check intervals.
    // simplistic approach: Find problems completed more than 3 days ago
    const now = new Date();
    const staleProblems = (await prisma.progress.findMany({
        where: {
            userId,
            status: "DONE",
            nextReviewDate: {
                lte: now,
            },
        },
        include: {
            problem: {
                include: { topic: true },
            },
        },
        orderBy: { nextReviewDate: "asc" },
        take: 5,
    }));
    return staleProblems.map((p) => ({
        id: p.problem.id,
        title: p.problem.title,
        topicName: p.problem.topic.name,
        daysSince: p.completedAt
            ? Math.floor((new Date().getTime() - p.completedAt.getTime()) / (1000 * 3600 * 24))
            : 0,
    }));
};
exports.getRevisionReminders = getRevisionReminders;
const getWeakTopics = async (userId) => {
    const now = new Date();
    const [topics, solvedProgress] = await Promise.all([
        prisma.topic.findMany({
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
        }),
        prisma.progress.findMany({
            where: { userId, status: "DONE" },
            include: {
                problem: {
                    include: { topic: true },
                },
            },
        }),
    ]);
    const byTopic = new Map();
    topics.forEach((topic) => {
        const totalProblems = topic.problems.length;
        const doneProgress = topic.problems
            .map((problem) => problem.progress[0])
            .filter((progress) => progress?.status === "DONE");
        const solvedProblems = doneProgress.length;
        const avgTimeSpent = solvedProblems > 0
            ? Math.round(doneProgress.reduce((sum, progress) => sum + progress.timeSpent, 0) /
                solvedProblems)
            : 0;
        const completionPct = totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0;
        const overdueReviews = doneProgress.filter((progress) => progress.nextReviewDate && new Date(progress.nextReviewDate) <= now).length;
        const coverageComponent = completionPct;
        const speedPenalty = solvedProblems > 0 ? clamp((avgTimeSpent / 45) * 30, 0, 30) : 20;
        const overduePenalty = clamp(overdueReviews * 5, 0, 25);
        const masteryScore = Math.round(clamp(coverageComponent - speedPenalty - overduePenalty, 0, 100));
        const weaknessScore = 100 - masteryScore;
        byTopic.set(topic.id, {
            name: topic.name,
            totalProblems,
            solvedProblems,
            avgTimeSpent,
            completionPct: Math.round(completionPct),
            overdueReviews,
            masteryScore,
            weaknessScore,
        });
    });
    solvedProgress.forEach((progress) => {
        if (!byTopic.has(progress.problem.topicId)) {
            byTopic.set(progress.problem.topicId, {
                name: progress.problem.topic.name,
                totalProblems: 0,
                solvedProblems: 0,
                avgTimeSpent: 0,
                completionPct: 0,
                overdueReviews: 0,
                masteryScore: 0,
                weaknessScore: 100,
            });
        }
    });
    return Array.from(byTopic.values())
        .filter((topic) => topic.totalProblems > 0)
        .sort((a, b) => b.weaknessScore - a.weaknessScore)
        .slice(0, 8);
};
exports.getWeakTopics = getWeakTopics;
const getMasteryStats = async (userId) => {
    const now = new Date();
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
    });
    const stats = topics.map((topic) => {
        let totalPossibleScore = 0;
        let userScore = 0;
        let solvedCount = 0;
        topic.problems.forEach((prob) => {
            const weight = difficultyWeight[prob.difficulty] || 1;
            totalPossibleScore += weight;
            const progress = prob.progress[0];
            if (progress?.status === "DONE") {
                solvedCount += 1;
                const solveTarget = targetSolveMinutes[prob.difficulty] || 30;
                const safeTime = Math.max(10, progress.timeSpent || solveTarget);
                const speedFactor = clamp(solveTarget / safeTime, 0.7, 1.2);
                const daysSinceSolved = progress.completedAt
                    ? Math.floor((now.getTime() - new Date(progress.completedAt).getTime()) /
                        (1000 * 60 * 60 * 24))
                    : 365;
                const recencyFactor = clamp(1.1 - daysSinceSolved / 180, 0.8, 1.1);
                const reviewFactor = progress.nextReviewDate
                    ? new Date(progress.nextReviewDate) <= now
                        ? 0.9
                        : 1.05
                    : 1;
                userScore += weight * speedFactor * recencyFactor * reviewFactor;
            }
        });
        const masteryBoost = totalPossibleScore > 0 ? (userScore / totalPossibleScore) * 100 : 0;
        return {
            subject: topic.name,
            A: Math.round(clamp(masteryBoost, 0, 100)),
            fullMark: 100,
            solved: solvedCount,
            total: topic.problems.length,
        };
    });
    return stats.sort((a, b) => a.subject.localeCompare(b.subject));
};
exports.getMasteryStats = getMasteryStats;
const getDailyProblem = async (userId) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daySeed = today.getFullYear() * 10000 +
        (today.getMonth() + 1) * 100 +
        today.getDate();
    const dueForReview = (await prisma.progress.findMany({
        where: {
            userId,
            status: "DONE",
            nextReviewDate: { lte: now },
        },
        include: {
            problem: { include: { topic: true } },
        },
        orderBy: { nextReviewDate: "asc" },
        take: 3,
    }));
    if (dueForReview.length > 0) {
        const primaryReview = dueForReview[0];
        return {
            source: "REVISION",
            reason: `You have ${dueForReview.length} problem${dueForReview.length > 1 ? "s" : ""} due for review. Start with the oldest due item to protect retention.`,
            problem: {
                id: primaryReview.problem.id,
                title: primaryReview.problem.title,
                difficulty: primaryReview.problem.difficulty,
                link: primaryReview.problem.link,
                topicName: primaryReview.problem.topic.name,
                topicId: primaryReview.problem.topicId,
            },
            plan: {
                mode: "RETENTION_FIRST",
                mix: { weakness: 0, medium: 0, strong: 0, revision: 100 },
                items: dueForReview.map((review) => ({
                    source: "REVISION",
                    id: review.problem.id,
                    title: review.problem.title,
                    difficulty: review.problem.difficulty,
                    topicName: review.problem.topic.name,
                    topicId: review.problem.topicId,
                    link: review.problem.link,
                })),
            },
        };
    }
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
    });
    const weakTopics = (await (0, exports.getWeakTopics)(userId));
    const weakTopicNames = new Set(weakTopics.filter((topic) => (topic.masteryScore || 0) < 45).map((t) => t.name));
    const mediumTopicNames = new Set(weakTopics
        .filter((topic) => {
        const score = topic.masteryScore || 0;
        return score >= 45 && score < 70;
    })
        .map((t) => t.name));
    const strongTopicNames = new Set(weakTopics.filter((topic) => (topic.masteryScore || 0) >= 70).map((t) => t.name));
    const unsolvedByTopic = topics
        .map((topic) => {
        const unsolved = topic.problems.filter((problem) => problem.progress[0]?.status !== "DONE");
        return {
            topicId: topic.id,
            topicName: topic.name,
            problems: unsolved,
        };
    })
        .filter((entry) => entry.problems.length > 0);
    const byName = new Map(unsolvedByTopic.map((entry) => [entry.topicName, entry]));
    const pickItems = (topicNames, count, fallback) => {
        const selected = [];
        const topicPool = topicNames
            .map((name) => byName.get(name))
            .filter((entry) => Boolean(entry));
        const workingPool = topicPool.length > 0 ? topicPool : fallback;
        for (let i = 0; i < count; i++) {
            if (workingPool.length === 0)
                break;
            const topicIndex = (daySeed + i) % workingPool.length;
            const topic = workingPool[topicIndex];
            if (!topic || topic.problems.length === 0)
                continue;
            const problemIndex = (daySeed + i * 3) % topic.problems.length;
            const picked = topic.problems[problemIndex];
            selected.push({
                source: "WEAKNESS",
                id: picked.id,
                title: picked.title,
                difficulty: picked.difficulty,
                topicName: topic.topicName,
                topicId: topic.topicId,
                link: picked.link,
            });
        }
        return selected;
    };
    const weakItems = pickItems(Array.from(weakTopicNames), 3, unsolvedByTopic);
    const mediumItems = pickItems(Array.from(mediumTopicNames), 1, unsolvedByTopic);
    const strongItems = pickItems(Array.from(strongTopicNames), 1, unsolvedByTopic);
    const planItems = [...weakItems, ...mediumItems, ...strongItems].slice(0, 5);
    if (planItems.length > 0) {
        const primary = planItems[0];
        return {
            source: "WEAKNESS",
            reason: "Today is weakness-first day: 60% weak topics, 30% medium-confidence, 10% strong-topic retention.",
            problem: {
                id: primary.id,
                title: primary.title,
                difficulty: primary.difficulty,
                link: primary.link,
                topicName: primary.topicName,
                topicId: primary.topicId,
            },
            plan: {
                mode: "WEAKNESS_FIRST",
                mix: { weakness: 60, medium: 30, strong: 10, revision: 0 },
                items: planItems,
            },
        };
    }
    const userProgress = await prisma.progress.findMany({
        where: { userId },
    });
    const solvedIds = new Set(userProgress.filter((p) => p.status === "DONE").map((p) => p.problemId));
    // Calculate completion % per topic
    const topicScores = topics
        .map((topic) => {
        const total = topic.problems.length;
        const solved = topic.problems.filter((p) => solvedIds.has(p.id)).length;
        const unsolved = topic.problems.filter((p) => !solvedIds.has(p.id));
        return {
            topic,
            total,
            solved,
            completionPct: total > 0 ? (solved / total) * 100 : 100,
            unsolved,
        };
    })
        .filter((t) => t.unsolved.length > 0) // Only topics with unsolved problems
        .sort((a, b) => a.completionPct - b.completionPct); // Weakest first
    if (topicScores.length > 0) {
        const weakest = topicScores[0];
        // Use date as seed for deterministic daily pick
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
            (1000 * 3600 * 24));
        const idx = dayOfYear % weakest.unsolved.length;
        const picked = weakest.unsolved[idx];
        return {
            source: "WEAKNESS",
            reason: `From your weakest area: ${weakest.topic.name} (${weakest.solved}/${weakest.total} completed). Focus here to level up.`,
            problem: {
                id: picked.id,
                title: picked.title,
                difficulty: picked.difficulty,
                link: picked.link,
                topicName: weakest.topic.name,
                topicId: weakest.topic.id,
            },
            plan: {
                mode: "SINGLE_PICK",
                mix: { weakness: 100, medium: 0, strong: 0, revision: 0 },
                items: [
                    {
                        source: "WEAKNESS",
                        id: picked.id,
                        title: picked.title,
                        difficulty: picked.difficulty,
                        topicName: weakest.topic.name,
                        topicId: weakest.topic.id,
                        link: picked.link,
                    },
                ],
            },
        };
    }
    // Priority 3: All done — no problems left
    return null;
};
exports.getDailyProblem = getDailyProblem;
const getInterviewReadinessIndex = async (userId) => {
    const now = new Date();
    const last14d = new Date(now);
    last14d.setDate(last14d.getDate() - 14);
    const [progress, topics] = await Promise.all([
        prisma.progress.findMany({
            where: { userId, status: "DONE" },
            include: { problem: true },
        }),
        prisma.topic.findMany({ include: { problems: true } }),
    ]);
    if (progress.length === 0) {
        return {
            score: 0,
            level: "Not Ready",
            metrics: {
                timedMediumHard: 0,
                consistency14d: 0,
                revisionReliability: 0,
                topicCoverage: 0,
            },
            snapshot: {
                solvedLast14d: 0,
                solvedTotal: 0,
                mediumHardSolved: 0,
                coveredTopics: 0,
                totalTopics: topics.length,
            },
        };
    }
    const mediumHard = progress.filter((entry) => entry.problem.difficulty === "MEDIUM" || entry.problem.difficulty === "HARD");
    const mediumHardTimed = mediumHard.filter((entry) => {
        const limit = entry.problem.difficulty === "MEDIUM" ? 45 : 70;
        return entry.timeSpent > 0 && entry.timeSpent <= limit;
    });
    const timedMediumHard = mediumHard.length > 0
        ? Math.round((mediumHardTimed.length / mediumHard.length) * 100)
        : 0;
    const solvedLast14d = progress.filter((entry) => entry.completedAt && new Date(entry.completedAt) >= last14d).length;
    const consistency14d = Math.round(clamp((solvedLast14d / 14) * 100, 0, 100));
    const reviewTracked = progress.filter((entry) => entry.nextReviewDate !== null);
    const reviewOnTrack = reviewTracked.filter((entry) => entry.nextReviewDate && new Date(entry.nextReviewDate) > now);
    const revisionReliability = reviewTracked.length > 0
        ? Math.round((reviewOnTrack.length / reviewTracked.length) * 100)
        : 100;
    const solvedSet = new Set(progress.map((entry) => entry.problemId));
    const coveredTopics = topics.filter((topic) => topic.problems.some((problem) => solvedSet.has(problem.id))).length;
    const topicCoverage = topics.length > 0 ? Math.round((coveredTopics / topics.length) * 100) : 0;
    const score = Math.round(timedMediumHard * 0.35 +
        consistency14d * 0.25 +
        revisionReliability * 0.2 +
        topicCoverage * 0.2);
    const level = score >= 80
        ? "Interview Ready"
        : score >= 60
            ? "Nearly Ready"
            : score >= 40
                ? "Developing"
                : "Foundational";
    return {
        score,
        level,
        metrics: {
            timedMediumHard,
            consistency14d,
            revisionReliability,
            topicCoverage,
        },
        snapshot: {
            solvedLast14d,
            solvedTotal: progress.length,
            mediumHardSolved: mediumHard.length,
            coveredTopics,
            totalTopics: topics.length,
        },
    };
};
exports.getInterviewReadinessIndex = getInterviewReadinessIndex;
const getTimeAnalytics = async (userId) => {
    const allProgress = await prisma.progress.findMany({
        where: { userId, status: "DONE" },
        include: { problem: { include: { topic: true } } },
        orderBy: { completedAt: "asc" },
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
    allProgress.forEach((p) => {
        const diff = p.problem.difficulty;
        if (byDifficulty[diff]) {
            byDifficulty[diff].total += p.timeSpent;
            byDifficulty[diff].count += 1;
        }
        totalTime += p.timeSpent;
        if (p.timeSpent > 0) {
            if (!fastest || p.timeSpent < fastest.timeSpent) {
                fastest = {
                    title: p.problem.title,
                    topicName: p.problem.topic.name,
                    timeSpent: p.timeSpent,
                    difficulty: p.problem.difficulty,
                };
            }
            if (!slowest || p.timeSpent > slowest.timeSpent) {
                slowest = {
                    title: p.problem.title,
                    topicName: p.problem.topic.name,
                    timeSpent: p.timeSpent,
                    difficulty: p.problem.difficulty,
                };
            }
        }
    });
    const avgByDifficulty = {
        EASY: byDifficulty.EASY.count > 0
            ? Math.round(byDifficulty.EASY.total / byDifficulty.EASY.count)
            : 0,
        MEDIUM: byDifficulty.MEDIUM.count > 0
            ? Math.round(byDifficulty.MEDIUM.total / byDifficulty.MEDIUM.count)
            : 0,
        HARD: byDifficulty.HARD.count > 0
            ? Math.round(byDifficulty.HARD.total / byDifficulty.HARD.count)
            : 0,
    };
    // === Weekly trends (last 8 weeks) ===
    const now = new Date();
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
        const end = new Date(now);
        end.setDate(end.getDate() - i * 7);
        const start = new Date(end);
        start.setDate(start.getDate() - 7);
        const label = `W${8 - i}`;
        weeks.push({ weekLabel: label, startDate: start, endDate: end });
    }
    const weeklyTrends = weeks.map((w) => {
        const weekProblems = allProgress.filter((p) => {
            const completed = p.completedAt ? new Date(p.completedAt) : null;
            return completed && completed >= w.startDate && completed < w.endDate;
        });
        const easyAvg = weekProblems.filter((p) => p.problem.difficulty === "EASY");
        const medAvg = weekProblems.filter((p) => p.problem.difficulty === "MEDIUM");
        const hardAvg = weekProblems.filter((p) => p.problem.difficulty === "HARD");
        const avg = (arr) => arr.length > 0
            ? Math.round(arr.reduce((s, p) => s + p.timeSpent, 0) / arr.length)
            : 0;
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
    const recentProblems = allProgress.filter((p) => p.completedAt && new Date(p.completedAt) >= twoWeeksAgo);
    const olderProblems = allProgress.filter((p) => p.completedAt &&
        new Date(p.completedAt) >= fourWeeksAgo &&
        new Date(p.completedAt) < twoWeeksAgo);
    const speedInsights = [];
    for (const diff of ["EASY", "MEDIUM", "HARD"]) {
        const recent = recentProblems.filter((p) => p.problem.difficulty === diff);
        const older = olderProblems.filter((p) => p.problem.difficulty === diff);
        const recentAvg = recent.length > 0
            ? Math.round(recent.reduce((s, p) => s + p.timeSpent, 0) / recent.length)
            : 0;
        const olderAvg = older.length > 0
            ? Math.round(older.reduce((s, p) => s + p.timeSpent, 0) / older.length)
            : 0;
        let change = 0;
        if (olderAvg > 0 && recentAvg > 0) {
            change = Math.round(((olderAvg - recentAvg) / olderAvg) * 100);
        }
        speedInsights.push({ difficulty: diff, recentAvg, olderAvg, change });
    }
    // === Topic breakdown ===
    const topicMap = {};
    allProgress.forEach((p) => {
        const name = p.problem.topic.name;
        if (!topicMap[name])
            topicMap[name] = { name, totalTime: 0, count: 0 };
        topicMap[name].totalTime += p.timeSpent;
        topicMap[name].count += 1;
    });
    const topicBreakdown = Object.values(topicMap)
        .map((t) => ({ ...t, avgTime: Math.round(t.totalTime / t.count) }))
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
const pct = (value, target) => {
    if (target <= 0)
        return 0;
    return Math.max(0, Math.min(100, (value / target) * 100));
};
const getAchievements = async (userId) => {
    const [progress, streak, topics] = await Promise.all([
        prisma.progress.findMany({
            where: { userId },
            include: { problem: { include: { topic: true } } },
            orderBy: { updatedAt: "desc" },
        }),
        prisma.streak.findFirst({ where: { userId } }),
        prisma.topic.findMany({ include: { problems: true } }),
    ]);
    const solvedProgress = progress.filter((p) => p.status === "DONE");
    const totalSolved = solvedProgress.length;
    const currentStreak = streak?.currentStreak || 0;
    const longestStreak = streak?.longestStreak || 0;
    // Count per difficulty
    const easySolved = solvedProgress.filter((p) => p.problem.difficulty === "EASY").length;
    const medSolved = solvedProgress.filter((p) => p.problem.difficulty === "MEDIUM").length;
    const hardSolved = solvedProgress.filter((p) => p.problem.difficulty === "HARD").length;
    // Topics fully completed
    const solvedIds = new Set(solvedProgress.map((p) => p.problemId));
    const completedTopics = topics.filter((t) => t.problems.length > 0 && t.problems.every((p) => solvedIds.has(p.id)));
    // Topics with at least one attempted problem (DOING or DONE)
    const attemptedProblemIds = new Set(progress
        .filter((p) => p.status === "DOING" || p.status === "DONE")
        .map((p) => p.problemId));
    const touchedTopics = topics.filter((t) => t.problems.some((p) => attemptedProblemIds.has(p.id)));
    // Best completion percentage among all topics for "Topic Master" progress
    const bestTopicProgress = topics.reduce((best, topic) => {
        if (topic.problems.length === 0)
            return best;
        const solvedInTopic = topic.problems.filter((p) => solvedIds.has(p.id)).length;
        const progressPct = (solvedInTopic / topic.problems.length) * 100;
        return Math.max(best, progressPct);
    }, 0);
    const badges = [
        // Solve milestones
        {
            id: "first-blood",
            name: "First Blood",
            description: "Solve your first problem",
            icon: "🩸",
            category: "Milestones",
            unlocked: totalSolved >= 1,
            progress: pct(totalSolved, 1),
        },
        {
            id: "getting-started",
            name: "Getting Started",
            description: "Solve 10 problems",
            icon: "🚀",
            category: "Milestones",
            unlocked: totalSolved >= 10,
            progress: pct(totalSolved, 10),
        },
        {
            id: "quarter-century",
            name: "Quarter Century",
            description: "Solve 25 problems",
            icon: "🎯",
            category: "Milestones",
            unlocked: totalSolved >= 25,
            progress: pct(totalSolved, 25),
        },
        {
            id: "half-century",
            name: "Half Century",
            description: "Solve 50 problems",
            icon: "⚡",
            category: "Milestones",
            unlocked: totalSolved >= 50,
            progress: pct(totalSolved, 50),
        },
        {
            id: "centurion",
            name: "Centurion",
            description: "Solve 100 problems",
            icon: "💯",
            category: "Milestones",
            unlocked: totalSolved >= 100,
            progress: pct(totalSolved, 100),
        },
        {
            id: "grinder",
            name: "The Grinder",
            description: "Solve 200 problems",
            icon: "🏭",
            category: "Milestones",
            unlocked: totalSolved >= 200,
            progress: pct(totalSolved, 200),
        },
        // Streak badges
        {
            id: "streak-3",
            name: "Warming Up",
            description: "3-day streak",
            icon: "🔥",
            category: "Consistency",
            unlocked: longestStreak >= 3,
            progress: pct(longestStreak, 3),
        },
        {
            id: "streak-7",
            name: "Week Warrior",
            description: "7-day streak",
            icon: "⚔️",
            category: "Consistency",
            unlocked: longestStreak >= 7,
            progress: pct(longestStreak, 7),
        },
        {
            id: "streak-14",
            name: "Fortnight Fighter",
            description: "14-day streak",
            icon: "🛡️",
            category: "Consistency",
            unlocked: longestStreak >= 14,
            progress: pct(longestStreak, 14),
        },
        {
            id: "streak-30",
            name: "Monthly Master",
            description: "30-day streak",
            icon: "👑",
            category: "Consistency",
            unlocked: longestStreak >= 30,
            progress: pct(longestStreak, 30),
        },
        // Difficulty badges
        {
            id: "easy-10",
            name: "Easy Breezy",
            description: "Solve 10 Easy problems",
            icon: "🟢",
            category: "Difficulty",
            unlocked: easySolved >= 10,
            progress: pct(easySolved, 10),
        },
        {
            id: "med-10",
            name: "Medium Rare",
            description: "Solve 10 Medium problems",
            icon: "🟡",
            category: "Difficulty",
            unlocked: medSolved >= 10,
            progress: pct(medSolved, 10),
        },
        {
            id: "hard-5",
            name: "Hardened",
            description: "Solve 5 Hard problems",
            icon: "🔴",
            category: "Difficulty",
            unlocked: hardSolved >= 5,
            progress: pct(hardSolved, 5),
        },
        {
            id: "hard-10",
            name: "Beast Mode",
            description: "Solve 10 Hard problems",
            icon: "💀",
            category: "Difficulty",
            unlocked: hardSolved >= 10,
            progress: pct(hardSolved, 10),
        },
        // Topic badges
        {
            id: "explorer",
            name: "Explorer",
            description: "Attempt problems from 5 different topics",
            icon: "🧭",
            category: "Exploration",
            unlocked: touchedTopics.length >= 5,
            progress: pct(touchedTopics.length, 5),
        },
        {
            id: "well-rounded",
            name: "Well Rounded",
            description: "Attempt problems from 10 different topics",
            icon: "🌍",
            category: "Exploration",
            unlocked: touchedTopics.length >= 10,
            progress: pct(touchedTopics.length, 10),
        },
        {
            id: "topic-master",
            name: "Topic Master",
            description: "Complete all problems in any topic",
            icon: "🏅",
            category: "Mastery",
            unlocked: completedTopics.length >= 1,
            progress: completedTopics.length >= 1 ? 100 : Math.round(bestTopicProgress),
        },
        {
            id: "multi-master",
            name: "Multi-Master",
            description: "Complete all problems in 3 topics",
            icon: "🎖️",
            category: "Mastery",
            unlocked: completedTopics.length >= 3,
            progress: pct(completedTopics.length, 3),
        },
        {
            id: "completionist",
            name: "Completionist",
            description: "Complete all problems in 5 topics",
            icon: "🏆",
            category: "Mastery",
            unlocked: completedTopics.length >= 5,
            progress: pct(completedTopics.length, 5),
        },
    ];
    const unlockedCount = badges.filter((b) => b.unlocked).length;
    return {
        badges,
        stats: {
            totalBadges: badges.length,
            unlocked: unlockedCount,
            totalSolved,
            currentStreak,
            longestStreak,
            completedTopics: completedTopics.length,
        },
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
            include: { problem: { include: { topic: true } } },
        }),
        prisma.streak.findFirst({ where: { userId } }),
        prisma.topic.findMany({ include: { problems: true } }),
    ]);
    const solvedAll = allProgress.filter((p) => p.status === "DONE");
    const solvedIds = new Set(solvedAll.map((p) => p.problemId));
    // This week's solves
    const thisWeekSolves = solvedAll.filter((p) => p.completedAt && new Date(p.completedAt) >= weekAgo);
    // Last week's solves
    const lastWeekSolves = solvedAll.filter((p) => p.completedAt &&
        new Date(p.completedAt) >= twoWeeksAgo &&
        new Date(p.completedAt) < weekAgo);
    // Difficulty breakdown this week
    const diffBreakdown = {
        EASY: thisWeekSolves.filter((p) => p.problem.difficulty === "EASY").length,
        MEDIUM: thisWeekSolves.filter((p) => p.problem.difficulty === "MEDIUM")
            .length,
        HARD: thisWeekSolves.filter((p) => p.problem.difficulty === "HARD").length,
    };
    // Topics touched this week
    const topicsTouched = new Set(thisWeekSolves.map((p) => p.problem.topic.name));
    // Topics progress
    const topicProgress = topics
        .map((t) => {
        const total = t.problems.length;
        const solved = t.problems.filter((p) => solvedIds.has(p.id)).length;
        return {
            name: t.name,
            total,
            solved,
            pct: total > 0 ? Math.round((solved / total) * 100) : 0,
        };
    })
        .sort((a, b) => b.pct - a.pct);
    // Weakest topics (< 30% completion with at least 1 problem)
    const weakTopics = topicProgress
        .filter((t) => t.total > 0 && t.pct < 30)
        .slice(0, 3);
    // Strongest topics
    const strongTopics = topicProgress
        .filter((t) => t.pct >= 70 && t.total > 0)
        .slice(0, 3);
    // Week over week change
    const solvedChange = thisWeekSolves.length - lastWeekSolves.length;
    // Time this week
    const timeThisWeek = thisWeekSolves.reduce((s, p) => s + p.timeSpent, 0);
    // Generate summary text
    let summaryText = "";
    if (thisWeekSolves.length === 0) {
        summaryText =
            "No problems solved this week. Jump back in — consistency is key!";
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