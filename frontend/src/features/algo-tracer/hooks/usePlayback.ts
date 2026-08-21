import { useState, useEffect, useCallback } from "react";

interface UsePlaybackProps {
  totalSteps: number;
  onRunTrace?: () => void;
}

export function usePlayback({ totalSteps, onRunTrace }: UsePlaybackProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedDelay, setSpeedDelay] = useState(600); // 100ms (fastest) to 1800ms (slowest)

  const goToStep = useCallback(
    (index: number) => {
      if (totalSteps <= 0) {
        setCurrentStepIndex(0);
        return;
      }
      const clamped = Math.max(0, Math.min(totalSteps - 1, index));
      setCurrentStepIndex(clamped);
    },
    [totalSteps],
  );

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev >= totalSteps - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const firstStep = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const lastStep = useCallback(() => {
    if (totalSteps > 0) {
      setCurrentStepIndex(totalSteps - 1);
    }
    setIsPlaying(false);
  }, [totalSteps]);

  const reset = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (currentStepIndex >= totalSteps - 1 && !isPlaying) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentStepIndex, totalSteps, isPlaying]);

  // Playback timer interval
  useEffect(() => {
    let timer: any;
    if (isPlaying && totalSteps > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedDelay);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speedDelay, totalSteps]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      const isInputFocused =
        activeTag === "input" ||
        activeTag === "textarea" ||
        document.activeElement?.classList.contains("monaco-editor");

      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        onRunTrace?.();
        return;
      }

      if (isInputFocused) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextStep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevStep();
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, nextStep, prevStep, reset, onRunTrace]);

  return {
    currentStepIndex,
    isPlaying,
    speedDelay,
    setSpeedDelay,
    goToStep,
    nextStep,
    prevStep,
    firstStep,
    lastStep,
    reset,
    togglePlay,
    setIsPlaying,
  };
}
