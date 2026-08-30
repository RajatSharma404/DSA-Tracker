import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, fireEvent } from "@testing-library/react";
import { usePlayback } from "../usePlayback";
import { useTraceEngine } from "../useTraceEngine";
import { useAlgoDetector } from "../useAlgoDetector";

describe("Algo Tracer Hooks", () => {
  describe("usePlayback (hooks/usePlayback.ts)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should handle navigation across steps and play/pause controls", () => {
      const { result } = renderHook(() => usePlayback({ totalSteps: 10 }));

      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.isPlaying).toBe(false);

      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStepIndex).toBe(1);

      act(() => {
        result.current.prevStep();
      });
      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        result.current.goToStep(5);
      });
      expect(result.current.currentStepIndex).toBe(5);

      act(() => {
        result.current.goToStep(-10);
      });
      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        result.current.goToStep(50);
      });
      expect(result.current.currentStepIndex).toBe(9);

      act(() => {
        result.current.lastStep();
      });
      expect(result.current.currentStepIndex).toBe(9);

      act(() => {
        result.current.firstStep();
      });
      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        result.current.reset();
      });
      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        result.current.togglePlay();
      });
      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.setSpeedDelay(300);
      });
      expect(result.current.speedDelay).toBe(300);
    });

    it("should advance steps with timer and pause at end", () => {
      const { result } = renderHook(() => usePlayback({ totalSteps: 3 }));

      act(() => {
        result.current.setIsPlaying(true);
      });
      expect(result.current.isPlaying).toBe(true);

      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(result.current.currentStepIndex).toBe(1);

      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(result.current.currentStepIndex).toBe(2);

      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(result.current.isPlaying).toBe(false);
    });

    it("should restart from 0 when playing from the last step", () => {
      const { result } = renderHook(() => usePlayback({ totalSteps: 5 }));

      act(() => {
        result.current.goToStep(4);
      });
      expect(result.current.currentStepIndex).toBe(4);

      act(() => {
        result.current.togglePlay();
      });
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.isPlaying).toBe(true);
    });

    it("should handle totalSteps = 0 safely", () => {
      const { result } = renderHook(() => usePlayback({ totalSteps: 0 }));

      act(() => {
        result.current.goToStep(2);
        result.current.lastStep();
      });
      expect(result.current.currentStepIndex).toBe(0);
    });

    it("should handle global keyboard navigation", () => {
      const onRun = vi.fn();
      const { result } = renderHook(() =>
        usePlayback({ totalSteps: 10, onRunTrace: onRun })
      );

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { ctrlKey: true, key: "Enter" })
        );
      });
      expect(onRun).toHaveBeenCalled();

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      });
      expect(result.current.isPlaying).toBe(true);

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
      });
      expect(result.current.currentStepIndex).toBe(1);

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
      });
      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        result.current.goToStep(5);
      });
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "r" }));
      });
      expect(result.current.currentStepIndex).toBe(0);
    });
  });

  describe("useTraceEngine (hooks/useTraceEngine.ts)", () => {
    it("should generate trace steps automatically on mount", () => {
      const code = `
        function bubbleSort(arr) {
          for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
              if (arr[j] > arr[j + 1]) {}
            }
          }
        }
      `;
      const { result } = renderHook(() =>
        useTraceEngine({
          initialCode: code,
          initialArrayInput: [4, 1, 3],
        })
      );

      expect(result.current.steps.length).toBeGreaterThan(0);
      expect(result.current.error).toBeNull();
      expect(result.current.isTracing).toBe(false);
    });
  });

  describe("useAlgoDetector (hooks/useAlgoDetector.ts)", () => {
    it("should detect algorithm type reactively", () => {
      const { result, rerender } = renderHook(({ code }) => useAlgoDetector(code), {
        initialProps: {
          code: "function binarySearch(arr, target) { let left = 0; }",
        },
      });

      expect(result.current.type).toBe("binary-search");

      rerender({
        code: "function bubbleSort(arr) { for(let i=0; i<arr.length; i++) {} }",
      });
      expect(result.current.type).toBe("bubble-sort");
    });
  });
});
