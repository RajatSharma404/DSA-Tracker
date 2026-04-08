export declare const getRevisionReminders: (userId: string) => Promise<{
    id: any;
    title: any;
    topicName: any;
    daysSince: number;
}[]>;
export declare const getWeakTopics: (userId: string) => Promise<{
    name: string;
    totalProblems: number;
    solvedProblems: number;
    avgTimeSpent: number;
    completionPct: number;
    overdueReviews: number;
    masteryScore: number;
    weaknessScore: number;
}[]>;
export declare const getMasteryStats: (userId: string) => Promise<{
    subject: string;
    A: number;
    fullMark: number;
    solved: number;
    total: number;
}[]>;
export declare const getDailyProblem: (userId: string) => Promise<{
    source: "REVISION";
    reason: string;
    problem: {
        id: any;
        title: any;
        difficulty: any;
        link: any;
        topicName: any;
        topicId: any;
    };
    plan: {
        mode: string;
        mix: {
            weakness: number;
            medium: number;
            strong: number;
            revision: number;
        };
        items: {
            source: string;
            id: any;
            title: any;
            difficulty: any;
            topicName: any;
            topicId: any;
            link: any;
        }[];
    };
} | {
    source: "WEAKNESS";
    reason: string;
    problem: {
        id: string;
        title: string;
        difficulty: string;
        link: string;
        topicName: string;
        topicId: string;
    };
    plan: {
        mode: string;
        mix: {
            weakness: number;
            medium: number;
            strong: number;
            revision: number;
        };
        items: {
            source: "WEAKNESS" | "BUILD";
            id: string;
            title: string;
            difficulty: string;
            topicName: string;
            topicId: string;
            link: string | null;
        }[];
    };
} | {
    source: "WEAKNESS";
    reason: string;
    problem: {
        id: string;
        title: string;
        difficulty: import(".prisma/client").$Enums.Difficulty;
        link: string;
        topicName: string;
        topicId: string;
    };
    plan: {
        mode: string;
        mix: {
            weakness: number;
            medium: number;
            strong: number;
            revision: number;
        };
        items: {
            source: string;
            id: string;
            title: string;
            difficulty: import(".prisma/client").$Enums.Difficulty;
            topicName: string;
            topicId: string;
            link: string;
        }[];
    };
}>;
export declare const getInterviewReadinessIndex: (userId: string) => Promise<{
    score: number;
    level: string;
    metrics: {
        timedMediumHard: number;
        consistency14d: number;
        revisionReliability: number;
        topicCoverage: number;
    };
    snapshot: {
        solvedLast14d: number;
        solvedTotal: number;
        mediumHardSolved: number;
        coveredTopics: number;
        totalTopics: number;
    };
}>;
export declare const getTimeAnalytics: (userId: string) => Promise<{
    totalTimeMinutes: number;
    totalSolved: number;
    avgByDifficulty: {
        EASY: number;
        MEDIUM: number;
        HARD: number;
    };
    weeklyTrends: {
        week: string;
        solved: number;
        avgTime: number;
        avgEasy: number;
        avgMedium: number;
        avgHard: number;
    }[];
    speedInsights: {
        difficulty: string;
        recentAvg: number;
        olderAvg: number;
        change: number;
    }[];
    topicBreakdown: {
        avgTime: number;
        name: string;
        totalTime: number;
        count: number;
    }[];
    fastest: any;
    slowest: any;
}>;
interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    unlocked: boolean;
    progress?: number;
    unlockedAt?: string;
}
export declare const getAchievements: (userId: string) => Promise<{
    badges: Badge[];
    stats: {
        totalBadges: number;
        unlocked: number;
        totalSolved: number;
        currentStreak: number;
        longestStreak: number;
        completedTopics: number;
    };
}>;
export declare const getWeeklyReport: (userId: string) => Promise<{
    period: {
        start: string;
        end: string;
    };
    summary: string;
    thisWeek: {
        solved: number;
        timeMinutes: number;
        diffBreakdown: {
            EASY: number;
            MEDIUM: number;
            HARD: number;
        };
        topicsTouched: string[];
    };
    lastWeek: {
        solved: number;
    };
    solvedChange: number;
    streak: {
        current: number;
        longest: number;
    };
    overall: {
        totalSolved: number;
        totalProblems: number;
    };
    weakTopics: {
        name: string;
        total: number;
        solved: number;
        pct: number;
    }[];
    strongTopics: {
        name: string;
        total: number;
        solved: number;
        pct: number;
    }[];
    topicProgress: {
        name: string;
        total: number;
        solved: number;
        pct: number;
    }[];
}>;
export {};
//# sourceMappingURL=services.d.ts.map