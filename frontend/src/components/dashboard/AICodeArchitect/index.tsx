/**
 * AICodeArchitect Component - Main Orchestrator
 * Refactored to use custom hooks and sub-components
 */

"use client";

import { useReducer } from "react";
import { dsaApi } from "@/lib/api";
import { ReviewForm } from "./ReviewForm";
import { ReviewResult } from "./ReviewResult";
import { useToastNotification } from "@/components/providers/ToastProvider";

interface AICodeArchitectProps {
  problemId: string;
  problemTitle: string;
}

interface State {
  code: string;
  review: { type: "structured" | "markdown"; data: any } | null;
  loading: boolean;
}

type Action =
  | { type: "SET_CODE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "SET_REVIEW";
      payload: { type: "structured" | "markdown"; data: any } | null;
    }
  | { type: "RESET" };

const initialState: State = {
  code: "",
  review: null,
  loading: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_CODE":
      return { ...state, code: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_REVIEW":
      return { ...state, review: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

export default function AICodeArchitect({
  problemId,
  problemTitle,
}: AICodeArchitectProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { warning, success, error } = useToastNotification();

  const handleCodeChange = (newCode: string) => {
    dispatch({ type: "SET_CODE", payload: newCode });
  };

  const handleReview = async () => {
    if (!state.code.trim()) {
      warning("Please enter some code first");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await dsaApi.getAICodeReview(problemId, state.code);
      dispatch({ type: "SET_REVIEW", payload: res.review });
      success("Analysis complete!");
    } catch (err) {
      console.error("Review error:", err);
      dispatch({
        type: "SET_REVIEW",
        payload: {
          type: "markdown",
          data: "### ⚠️ Analysis Failed\nPlease try again.",
        },
      });
      error("Failed to analyze code. Please try again.");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <div>
      <ReviewForm
        problemId={problemId}
        problemTitle={problemTitle}
        code={state.code}
        onCodeChange={handleCodeChange}
        onReview={handleReview}
        isReviewing={state.loading}
      />

      <ReviewResult
        loading={state.loading}
        review={state.review}
        problemId={problemId}
        problemTitle={problemTitle}
        code={state.code}
      />
    </div>
  );
}
