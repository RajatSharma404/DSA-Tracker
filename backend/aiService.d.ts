export declare const getAIHint: (problemTitle: string, topic: string, difficulty: string) => Promise<string>;
export declare const getPatternExplanation: (topic: string) => Promise<string>;
export declare const getAICodeReview: (code: string, problemTitle: string, topic: string) => Promise<{
    type: string;
    data: any;
}>;
export declare const evaluateCode: (code: string, problemTitle: string, topic: string, difficulty: string, language: string) => Promise<any>;
export declare const getAlgoTracing: (code: string, problemTitle: string) => Promise<any>;
export declare const getAIRecommendations: (solvedProblems: Array<{
    title: string;
    topic: string;
    difficulty: string;
    score: number;
    isOptimal: boolean;
}>, weakTopics: string[], allTopics: string[]) => Promise<any>;
//# sourceMappingURL=aiService.d.ts.map