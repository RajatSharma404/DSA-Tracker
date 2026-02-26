import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const getAIHint = async (problemTitle: string, topic: string, difficulty: string) => {
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
