"use client";

import React, { useState, useRef, useEffect } from "react";
import { TraceStep, DiagramType, TheoryData } from "../types";
import { TheoryPanel } from "./TheoryPanel";
import { StepDescriptionBar } from "./StepDescriptionBar";
import { ComplexityHUD } from "./ComplexityHUD";
import { BarDiagram } from "./diagrams/BarDiagram";
import { ArrayBoxDiagram } from "./diagrams/ArrayBoxDiagram";
import { SplitMergeDiagram } from "./diagrams/SplitMergeDiagram";
import { GraphDiagram } from "./diagrams/GraphDiagram";
import { StackDiagram } from "./diagrams/StackDiagram";
import { QueueDiagram } from "./diagrams/QueueDiagram";
import { GripHorizontal } from "lucide-react";

interface TracePanelProps {
  currentStep?: TraceStep;
  allSteps: TraceStep[];
  currentStepIndex: number;
  diagramType: DiagramType;
  theory?: TheoryData;
}

export function TracePanel({
  currentStep,
  allSteps,
  currentStepIndex,
  diagramType,
  theory,
}: TracePanelProps) {
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [theoryHeight, setTheoryHeight] = useState(190);
  const [isDraggingTheory, setIsDraggingTheory] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fallbackStep: TraceStep = {
    stepIndex: 0,
    line: 1,
    type: "init",
    arrayState: [5, 3, 8, 1, 9, 2, 4],
    highlighting: {},
    variables: { status: "READY" },
    description:
      "Write or select an algorithm and click 'Run & Trace' to start visual execution.",
  };

  const activeStep = currentStep || allSteps[currentStepIndex] || fallbackStep;

  // Vertical drag handle listener
  useEffect(() => {
    if (!isDraggingTheory) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const newHeight = e.clientY - rect.top;

      if (newHeight < 45) {
        setIsTheoryOpen(false);
      } else {
        setIsTheoryOpen(true);
        const clamped = Math.max(70, Math.min(380, newHeight));
        setTheoryHeight(clamped);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingTheory(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingTheory]);

  const renderDiagram = () => {
    switch (diagramType) {
      case "bar":
        return (
          <BarDiagram
            step={activeStep}
            allSteps={allSteps}
            currentIndex={currentStepIndex}
          />
        );
      case "array-box":
        return <ArrayBoxDiagram step={activeStep} />;
      case "split-merge":
        return <SplitMergeDiagram step={activeStep} />;
      case "graph":
        return <GraphDiagram step={activeStep} />;
      case "stack":
        return <StackDiagram step={activeStep} />;
      case "queue":
        return <QueueDiagram step={activeStep} />;
      default:
        return (
          <BarDiagram
            step={activeStep}
            allSteps={allSteps}
            currentIndex={currentStepIndex}
          />
        );
    }
  };

  return (
    <div
      ref={panelRef}
      className={`flex flex-col h-full min-h-0 w-full space-y-1.5 overflow-hidden ${
        isDraggingTheory ? "select-none" : ""
      }`}
    >
      {/* 1. Collapsible & Resizable Theory Section */}
      {theory && (
        <div
          style={{ height: isTheoryOpen ? `${theoryHeight}px` : "36px" }}
          className="shrink-0 flex flex-col min-h-0 overflow-hidden transition-[height] duration-150"
        >
          <TheoryPanel
            theory={theory}
            activeTheoryStep={activeStep.theoryStepIndex ?? 0}
            isOpen={isTheoryOpen}
            onToggleOpen={() => {
              const next = !isTheoryOpen;
              setIsTheoryOpen(next);
              if (next && theoryHeight < 120) {
                setTheoryHeight(190);
              }
            }}
          />
        </div>
      )}

      {/* Vertical Drag Handle */}
      {theory && (
        <div
          onMouseDown={() => setIsDraggingTheory(true)}
          role="separator"
          aria-orientation="horizontal"
          title="Drag up/down to resize or collapse Theory panel"
          className="h-2 w-full shrink-0 cursor-row-resize flex items-center justify-center group py-0.5"
        >
          <div className="h-1 w-16 rounded-full bg-[var(--border-subtle)] group-hover:bg-[var(--accent-primary)] group-active:bg-[var(--accent-primary)] transition-colors flex items-center justify-center">
            <GripHorizontal
              size={10}
              className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100"
            />
          </div>
        </div>
      )}

      {/* 2. Live Complexity & Memory HUD */}
      <ComplexityHUD
        currentStepIndex={currentStepIndex}
        allSteps={allSteps}
        theory={theory}
      />

      {/* 3. Visual Diagram Canvas (flex-1 fills all remaining height) */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        {renderDiagram()}
      </div>

      {/* 4. Step Description Bar (68px fixed at bottom) */}
      <StepDescriptionBar
        step={activeStep}
        currentStepIndex={currentStepIndex}
        totalSteps={allSteps.length}
      />
    </div>
  );
}
