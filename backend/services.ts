import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRevisionReminders = async (userId: string) => {
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
        } as any,
        include: {
            problem: {
                include: { topic: true }
            }
        } as any,
        orderBy: { nextReviewDate: 'asc' } as any,
        take: 5
    }) as any[];

    return staleProblems.map(p => ({
        id: p.problem.id,
        title: p.problem.title,
        topicName: p.problem.topic.name,
        daysSince: p.completedAt ? Math.floor((new Date().getTime() - p.completedAt.getTime()) / (1000 * 3600 * 24)) : 0
    }));
};

export const getWeakTopics = async (userId: string) => {
    // Logic: calculate average time spent per problem per topic among DONE problems
    const progressRecords = await prisma.progress.findMany({
        where: { userId, status: 'DONE' },
        include: { problem: { include: { topic: true }}}
    });

    const topicStats: Record<string, { totalTime: number, count: number, name: string }> = {};

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
