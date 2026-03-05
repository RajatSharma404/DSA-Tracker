import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const getAIHint = async (
  problemTitle: string,
  topic: string,
  difficulty: string,
) => {
  const prompt = `
    You are an expert DSA Mentor. 
    Problem: "${problemTitle}"
    Topic: ${topic}
    Difficulty: ${difficulty}

    The user is stuck on this problem. Provide a subtle, progressive hint. 
    Rules:
    1. DO NOT give the full solution.
    2. DO NOT give the code.
    3. Explain the "core intuition" or the "pattern" that needs to be applied (e.g., "Think about using Two Pointers to shrink the window from both ends").
    4. Keep it concise (max 3 sentences).
    5. Be encouraging.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const getPatternExplanation = async (topic: string) => {
  const prompt = `
    Explain the core pattern and mental model for solving "${topic}" problems in DSA.
    Provide:
    1. The core intuition in one sentence.
    2. Common edge cases to watch for.
    3. A "pro-tip" for interviews.
    Keep it in a professional, high-energy mentor tone. Use markdown formatting.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const getAICodeReview = async (
  code: string,
  problemTitle: string,
  topic: string,
) => {
  const prompt = `
    You are an elite Software Engineer and DSA Interviewer. 
    Review the following solution for the problem: "${problemTitle}" (Topic: ${topic}).

    Solution Code:
    \`\`\`
    ${code}
    \`\`\`

    Return ONLY a valid JSON object (no markdown fences, no explanation outside JSON) with this EXACT structure:
    {
      "verdict": "OPTIMAL" or "GOOD" or "NEEDS WORK",
      "summary": "One crisp sentence summarizing the solution quality.",
      "efficiency": {
        "timeComplexity": "O(N log N)",
        "timeExplanation": "Brief explanation of why this is the time complexity.",
        "spaceComplexity": "O(N)",
        "spaceExplanation": "Brief explanation of why this is the space complexity.",
        "isOptimal": true or false,
        "optimalNote": "If not optimal, what would be optimal? If optimal, say why."
      },
      "logic": {
        "isCorrect": true or false,
        "explanation": "Brief analysis of correctness.",
        "edgeCases": [
          { "case": "Empty array", "handled": true, "note": "Handled by the initial check." },
          { "case": "Single element", "handled": false, "note": "Would crash at line X." }
        ]
      },
      "cleanCode": [
        { "suggestion": "Use destructuring for cleaner variable assignment.", "example": "const [a, b] = arr;" }
      ],
      "proTip": "One killer insight about this problem type that interviewers love."
    }

    RULES:
    1. Keep explanations concise (1-2 sentences each).
    2. Provide 2-4 edge cases.
    3. Provide 1-2 clean code suggestions with SHORT code examples.
    4. The proTip should be genuinely insightful — something a senior engineer would say.
    5. Return raw JSON only. No markdown. No code fences around the JSON.
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  // Try to parse as structured JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return { type: "structured", data: JSON.parse(jsonMatch[0]) };
    } catch {
      // Fallback to raw text if JSON parsing fails
      return { type: "markdown", data: text };
    }
  }
  return { type: "markdown", data: text };
};

export const evaluateCode = async (
  code: string,
  problemTitle: string,
  topic: string,
  difficulty: string,
  language: string,
) => {
  const prompt = `
    You are an elite DSA judge and interviewer. Evaluate the following solution for the problem: "${problemTitle}" (Topic: ${topic}, Difficulty: ${difficulty}, Language: ${language}).

    Solution Code:
    \`\`\`${language}
    ${code}
    \`\`\`

    Analyze the code carefully and return ONLY a valid JSON object (no markdown fences, no explanation outside JSON) with this EXACT structure:
    {
      "isCorrect": true or false,
      "verdict": "ACCEPTED" or "WRONG_ANSWER" or "COMPILATION_ERROR" or "RUNTIME_ERROR" or "TIME_LIMIT_EXCEEDED",
      "verdictMessage": "A short human-readable message about the verdict, e.g. 'All test cases would pass' or 'Fails on edge case: empty array'",
      "failingCase": {
        "input": "The specific failing test case input if wrong, or null",
        "expected": "Expected output for the failing case, or null",
        "actual": "What this code would produce, or null"
      },
      "complexity": {
        "time": "O(...)",
        "timeExplanation": "Why this time complexity",
        "space": "O(...)",
        "spaceExplanation": "Why this space complexity"
      },
      "optimalComplexity": {
        "time": "O(...)",
        "space": "O(...)",
        "isCurrentOptimal": true or false,
        "explanation": "If not optimal, explain what optimal looks like"
      },
      "betterApproaches": [
        {
          "name": "Approach name, e.g. Two Pointers / Sliding Window / etc.",
          "timeComplexity": "O(...)",
          "spaceComplexity": "O(...)",
          "description": "2-3 sentence description of the approach and why it's better",
          "pseudocode": "Brief pseudocode (3-6 lines max)"
        }
      ],
      "edgeCases": [
        { "case": "Description of edge case", "handled": true or false }
      ],
      "score": 0-100,
      "feedback": "1-2 sentence overall feedback as a mentor",
      "originality": {
        "verdict": "HUMAN" or "AI_GENERATED" or "AI_ASSISTED" or "TEMPLATE",
        "confidence": 0-100,
        "signals": [
          "Specific signal that led to this verdict, e.g. 'Overly verbose variable names typical of AI', 'Natural shorthand and abbreviations suggest human writing', 'Perfect formatting unusual for manual coding'"
        ],
        "explanation": "1-2 sentence explanation of why you think this code is human-written or AI-generated"
      }
    }

    RULES:
    1. Be accurate about correctness — check for off-by-one errors, edge cases, wrong logic.
    2. If the solution IS optimal, "betterApproaches" should be an empty array [].
    3. If the solution is correct but not optimal, provide 1-2 better approaches.
    4. If the solution is wrong, still analyze complexity and suggest the right approach.
    5. "score" should reflect: correctness (50%), optimality (30%), code quality (20%).
    6. Provide 2-4 edge cases.
    7. For originality detection, look for these AI signals:
       - Overly descriptive variable names (e.g. currentMaximumSum vs maxS)
       - Perfect consistent formatting and spacing throughout
       - Verbose/educational comments explaining obvious things
       - Using uncommon but technically correct constructs
       - Perfectly structured code with no shortcuts or personal style
       - Template-like patterns identical to common AI outputs
       Human signals: shortcuts, abbreviations, inconsistent style, minimal/no comments, personal naming conventions, pragmatic over elegant code.
    8. Return raw JSON only. No markdown. No code fences around the JSON.
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return {
        isCorrect: false,
        verdict: "RUNTIME_ERROR",
        verdictMessage: "Failed to parse evaluation",
        score: 0,
      };
    }
  }
  return {
    isCorrect: false,
    verdict: "RUNTIME_ERROR",
    verdictMessage: "Failed to evaluate code",
    score: 0,
  };
};

export const getAlgoTracing = async (code: string, problemTitle: string) => {
  const prompt = `
    You are an elite DSA instructor creating a step-by-step "Dry Run" walkthrough.
    Problem: "${problemTitle}"
    
    Code:
    \`\`\`
    ${code}
    \`\`\`

    Create a cinematic, educational dry-run of this code using a SIMPLE sample input.
    
    Return ONLY a valid JSON object (no markdown, no code fences) with this EXACT structure:
    {
      "sampleInput": "e.g. nums = [2, 7, 11, 15], target = 9",
      "expectedOutput": "e.g. [0, 1]",
      "approach": "One-line summary of the algorithm strategy",
      "steps": [
        {
          "step": 1,
          "phase": "INIT",
          "codeLine": "let map = new Map();",
          "narrative": "We create an empty HashMap to store numbers we've seen so far. The key will be the number, the value will be its index.",
          "thinking": "Why a Map? Because it gives us O(1) lookup — we can instantly check if a complement exists.",
          "variables": [
            { "name": "map", "value": "{}", "changed": true },
            { "name": "i", "value": "0", "changed": true }
          ],
          "dataStructure": {
            "type": "array|map|stack|pointer",
            "label": "Input Array",
            "items": [
              { "value": "2", "state": "active" },
              { "value": "7", "state": "default" },
              { "value": "11", "state": "default" }
            ]
          }
        }
      ]
    }

    RULES:
    1. Pick a SMALL sample input (3-6 elements max).
    2. Max 10 steps. Each step = one meaningful logical operation.
    3. "phase" must be one of: "INIT", "PROCESS", "CHECK", "FOUND", "RETURN", "LOOP".
    4. "codeLine" = the exact line of code being executed (short).
    5. "narrative" = explain WHAT is happening in plain English (1-2 sentences).
    6. "thinking" = explain WHY this step matters for learning (1 sentence, like an interviewer tip).
    7. For "variables", include ALL active variables and mark "changed": true only for ones that changed THIS step.
    8. "dataStructure.items[].state" must be one of: "default", "active", "highlight", "done", "compare".
       - "active" = currently being processed (blue)
       - "highlight" = match found or important (green)
       - "compare" = being compared against (yellow)
       - "done" = already processed (dim)
    9. IMPORTANT: Return raw JSON only. No markdown fences. No explanation outside JSON.
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  // Try to extract JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch)
    return { sampleInput: "", expectedOutput: "", approach: "", steps: [] };
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { sampleInput: "", expectedOutput: "", approach: "", steps: [] };
  }
};

export const getAIRecommendations = async (
  solvedProblems: Array<{
    title: string;
    topic: string;
    difficulty: string;
    score: number;
    isOptimal: boolean;
  }>,
  weakTopics: string[],
  allTopics: string[],
) => {
  const prompt = `
    You are an expert DSA coach recommending the next problems to focus on.

    Student Profile:
    - Recently solved: ${JSON.stringify(solvedProblems.slice(-10))}
    - Weak topics: ${weakTopics.join(", ") || "None identified yet"}
    - All available topics: ${allTopics.join(", ")}

    Return ONLY a valid JSON object (no markdown, no code fences) with this EXACT structure:
    {
      "recommendations": [
        {
          "reason": "Why this type of problem is recommended next",
          "topic": "Topic name from available topics",
          "difficulty": "EASY" or "MEDIUM" or "HARD",
          "focusArea": "Specific pattern or concept to practice",
          "estimatedTime": "15-30 min"
        }
      ],
      "weeklyPlan": {
        "monday": { "topic": "...", "focus": "...", "problemCount": 2 },
        "tuesday": { "topic": "...", "focus": "...", "problemCount": 2 },
        "wednesday": { "topic": "...", "focus": "...", "problemCount": 2 },
        "thursday": { "topic": "...", "focus": "...", "problemCount": 2 },
        "friday": { "topic": "...", "focus": "...", "problemCount": 3 },
        "saturday": { "topic": "...", "focus": "...", "problemCount": 3 },
        "sunday": { "topic": "Review", "focus": "Revise weak areas", "problemCount": 2 }
      },
      "insight": "One personalized insight about their learning pattern (1-2 sentences)"
    }

    RULES:
    1. Provide 5 recommendations.
    2. Prioritize weak topics but mix in new topics for variety.
    3. Start with easier problems in weak areas, harder in strong areas.
    4. The weekly plan should be realistic and balanced.
    5. Return raw JSON only.
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return {
        recommendations: [],
        weeklyPlan: {},
        insight: "Unable to generate recommendations.",
      };
    }
  }
  return {
    recommendations: [],
    weeklyPlan: {},
    insight: "Unable to generate recommendations.",
  };
};
