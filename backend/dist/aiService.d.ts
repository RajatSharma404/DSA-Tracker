export declare const getAIHint: (problemTitle: string, topic: string, difficulty: string) => Promise<string>;
export declare const getPatternExplanation: (topic: string) => Promise<string>;
export declare const getAICodeReview: (code: string, problemTitle: string, topic: string) => Promise<{
    type: string;
    data: {
        verdict: string;
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
            edgeCases: {
                case: string;
                handled: boolean;
                note: string;
            }[];
        };
        cleanCode: {
            suggestion: string;
            example: string;
        }[];
        proTip: string;
    };
}>;
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
    edgeCases: {
        case: string;
        handled: boolean;
    }[];
    score: number;
    feedback: string;
    originality: {
        verdict: string;
        confidence: number;
        signals: string[];
        explanation: string;
    };
}>;
export declare const getAlgoTracing: (code: string, problemTitle: string) => Promise<{
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
            items: {
                value: string;
                state: string;
            }[];
        };
    }[];
}>;
export declare const getAIRecommendations: (solvedProblems: Array<{
    title: string;
    topic: string;
    difficulty: string;
    score: number;
    isOptimal: boolean;
}>, weakTopics: string[], allTopics: string[]) => Promise<{
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
    tips: any[];
}>;
//# sourceMappingURL=aiService.d.ts.map