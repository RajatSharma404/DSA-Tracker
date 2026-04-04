/**
 * Error Boundary Component
 */

"use client";

import React, { ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/design-tokens";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary - Class component for error catching
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Error Boundary caught:", error);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorFallback error={this.state.error} onReset={this.resetError} />
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback UI
 */
export interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div
      className={`
        p-6 rounded-2xl border
        ${DESIGN_TOKENS.colors.border.medium}
        ${DESIGN_TOKENS.colors.status.error.bg}
        flex flex-col gap-4
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            p-2 rounded-lg shrink-0
            ${DESIGN_TOKENS.colors.status.error.bg}
            ${DESIGN_TOKENS.colors.status.error.icon}
          `}
        >
          <AlertTriangle size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-white mb-1">
            Something went wrong
          </h2>
          <p
            className={`text-sm ${DESIGN_TOKENS.colors.status.error.text} mb-2`}
          >
            {error?.message || "An unexpected error occurred"}
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-2 text-xs text-gray-400 bg-black/30 p-2 rounded">
              <summary className="cursor-pointer font-mono">
                Stack trace
              </summary>
              <pre className="mt-2 overflow-auto text-[10px]">
                {error?.stack || "No stack trace available"}
              </pre>
            </details>
          )}
        </div>
      </div>
      <button
        onClick={onReset}
        className={`
          flex items-center gap-2
          px-4 py-2 rounded-lg font-medium
          bg-white/5 hover:bg-white/10
          ${DESIGN_TOKENS.transitions.fast}
          text-white
        `}
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    </div>
  );
}

/**
 * Async Error Boundary Hook - For runtime errors in effects
 */
export interface UseAsyncErrorBoundaryReturn {
  showError: (error: Error) => void;
  clearError: () => void;
}

export function useAsyncErrorBoundary(): UseAsyncErrorBoundaryReturn {
  return {
    showError: (error: Error) => {
      // Re-throw error to be caught by nearest ErrorBoundary
      throw error;
    },
    clearError: () => {
      // No-op, just for consistency
    },
  };
}
