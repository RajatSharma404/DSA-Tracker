import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import { ErrorBoundary, ErrorFallback, useAsyncErrorBoundary } from "../ErrorBoundary";

describe("ErrorBoundary Component", () => {
  const FailingChild = () => {
    throw new Error("Simulated Crash");
  };

  it("should catch errors and display fallback", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<div>Fallback UI</div>}>
        <FailingChild />
      </ErrorBoundary>
    );
    expect(screen.getByText("Fallback UI")).toBeDefined();
    spy.mockRestore();
  });

  it("should render default ErrorFallback and call onReset", () => {
    const onReset = vi.fn();
    render(<ErrorFallback error={new Error("Detailed Error")} onReset={onReset} />);
    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText("Detailed Error")).toBeDefined();

    fireEvent.click(screen.getByText("Try Again"));
    expect(onReset).toHaveBeenCalled();
  });

  it("should support useAsyncErrorBoundary hook", () => {
    const { result } = renderHook(() => useAsyncErrorBoundary());
    expect(() => result.current.clearError()).not.toThrow();
    expect(() => result.current.showError(new Error("Async Error"))).toThrow("Async Error");
  });
});
