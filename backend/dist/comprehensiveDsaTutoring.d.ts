/**
 * Comprehensive DSA Tutoring Guide - All 19 Topics
 * Format: What is it? → Core concept with diagram → C++ code → Dry run → Complexity → 3 problems → Tricks → Checkpoint
 */
export declare const COMPREHENSIVE_DSA_TOPICS: {
    id: number;
    slug: string;
    title: string;
    modules: {
        slug: string;
        title: string;
        lessons: {
            slug: string;
            title: string;
            difficulty: string;
            estimatedMinutes: number;
            learningObjectives: string[];
            theory: string;
        }[];
    }[];
}[];
export declare function getTutorContent(topicId: number): {
    id: number;
    slug: string;
    title: string;
    modules: {
        slug: string;
        title: string;
        lessons: {
            slug: string;
            title: string;
            difficulty: string;
            estimatedMinutes: number;
            learningObjectives: string[];
            theory: string;
        }[];
    }[];
};
//# sourceMappingURL=comprehensiveDsaTutoring.d.ts.map