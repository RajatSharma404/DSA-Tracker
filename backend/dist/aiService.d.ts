/**
 * Enhanced AI & Static Code Analysis Engine
 * Powered by Modern C++ Idioms & Memory Safety Rules (LearnCpp Official Knowledge)
 */
interface CleanCodeSuggestion {
    suggestion: string;
    example: string;
}
interface EdgeCaseCheck {
    case: string;
    handled: boolean;
    note: string;
}
/**
 * Main AI Code Review API (Enhanced with LearnCpp insights)
 */
export declare const getAICodeReview: (code: string, problemTitle: string, topic: string) => Promise<{
    type: string;
    data: {
        verdict: "OPTIMAL" | "GOOD" | "NEEDS WORK";
        summary: string;
        efficiency: {
            timeComplexity: string;
            timeExplanation: string;
            spaceComplexity: string;
            spaceExplanation: string;
            isOptimal: boolean;
            optimalNote: string;
        };
        logic: {
            isCorrect: boolean;
            explanation: string;
            edgeCases: EdgeCaseCheck[];
        };
        cleanCode: CleanCodeSuggestion[];
        proTip: string;
    };
}>;
/**
 * Detailed Code Evaluator API
 */
export declare const evaluateCode: (code: string, problemTitle: string, topic: string, difficulty: string, language: string) => Promise<{
    isCorrect: boolean;
    verdict: string;
    verdictMessage: string;
    failingCase: {
        input: string;
        expected: string;
        actual: string;
    };
    complexity: {
        time: string;
        timeExplanation: string;
        space: string;
        spaceExplanation: string;
    };
    optimalComplexity: {
        time: string;
        space: string;
        isCurrentOptimal: boolean;
        explanation: string;
    };
    betterApproaches: {
        name: string;
        timeComplexity: string;
        spaceComplexity: string;
        description: string;
        pseudocode: string;
    }[];
    edgeCases: EdgeCaseCheck[];
    score: number;
    feedback: string;
    originality: {
        verdict: string;
        confidence: number;
        signals: string[];
        explanation: string;
    };
}>;
/**
 * Algorithm Trace Engine for Live Diagramming
 */
export declare const getAlgoTracing: (code: string, problemTitle: string) => Promise<{
    sampleInput: string;
    expectedOutput: string;
    approach: string;
    steps: ({
        step: number;
        phase: string;
        codeLine: string;
        narrative: string;
        thinking: string;
        variables: {
            name: string;
            value: string;
            changed: boolean;
        }[];
        dataStructure: {
            type: string;
            label: string;
            items: ({
                value: string;
                state: "active";
            } | {
                value: string;
                state: "default";
            })[];
        };
    } | {
        step: number;
        phase: string;
        codeLine: string;
        narrative: string;
        thinking: string;
        variables: {
            name: string;
            value: string;
            changed: boolean;
        }[];
        dataStructure: {
            type: string;
            label: string;
            items: ({
                value: string;
                state: "done";
            } | {
                value: string;
                state: "highlight";
            } | {
                value: string;
                state: "default";
            } | {
                value: string;
                state: "compare";
            })[];
        };
    })[];
} | {
    sampleInput: string;
    expectedOutput: string;
    approach: string;
    steps: {
        step: number;
        phase: string;
        codeLine: string;
        narrative: string;
        thinking: string;
        variables: {
            name: string;
            value: string;
            changed: boolean;
        }[];
        dataStructure: {
            type: string;
            label: string;
            items: ({
                value: string;
                state: "highlight";
            } | {
                value: string;
                state: "default";
            } | {
                value: string;
                state: "active";
            } | {
                value: string;
                state: "done";
            })[];
        };
    }[];
}>;
/**
 * AI Hint Provider
 */
export declare const getAIHint: (problemTitle: string, topic: string, difficulty: string) => Promise<string>;
/**
 * Topic Pattern Deep Dive
 */
export declare const getPatternExplanation: (topic: string) => Promise<string>;
/**
 * Personalized Problem Recommendations
 */
export declare const getAIRecommendations: (solvedProblems: Array<{
    title: string;
    topic: string;
    difficulty: string;
    score: number;
    isOptimal: boolean;
}>, weakTopics: string[], allTopics: string[], context?: {
    revisionReminders?: Array<{
        id: string;
        title: string;
        topicName: string;
        daysSince: number;
    }>;
    weakTopicBreakdown?: Array<{
        name: string;
        avgTimeSpent?: number;
        completionPct?: number;
    }>;
    solvedLast7d?: number;
    solvedLast30d?: number;
}) => Promise<{
    weakTopics: string[];
    suggestedProblems: {
        title: string;
        reason: string;
        topic: string;
        difficulty: string;
    }[];
    weeklyPlan: {
        day: string;
        topic: string;
        focus: string;
        problems: string[];
    }[];
    tips: string[];
    nextAction: {
        mode: "REVISION";
        title: string;
        topic: string;
        reason: string;
        cta: string;
        difficulty: string;
        estimatedMinutes: number;
    } | {
        mode: "WEAKNESS";
        title: string;
        topic: string;
        reason: string;
        cta: string;
        difficulty: string;
        estimatedMinutes: number;
    } | {
        mode: "BALANCED";
        title: string;
        topic: string;
        reason: string;
        cta: string;
        difficulty: string;
        estimatedMinutes: number;
    };
}>;
export {};
//# sourceMappingURL=aiService.d.ts.map