/**
 * Comprehensive DSA Curriculum Seeding
 * Seeds all 20 DSA topics with complete theory, code examples, problems, and checkpoints
 * Each topic follows: What is it? → Core concept → C++ code → Dry run → Complexity → 3 Problems → Tricks → Checkpoint
 */
export interface SeedResult {
    trackId: string;
    modulesCreated: number;
    lessonsCreated: number;
    blocksCreated: number;
    trackTitle: string;
}
export declare function seedComprehensiveDSA(): Promise<SeedResult>;
export declare function runComprehensiveSeed(): Promise<void>;
//# sourceMappingURL=seedComprehensiveDSA.d.ts.map