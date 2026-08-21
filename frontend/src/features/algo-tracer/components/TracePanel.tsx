import React, { useState } from "react";
import { TraceStep, DiagramType, TheoryData } from "../types";
import { TheoryPanel } from "./TheoryPanel";
import { StepDescriptionBar } from "./StepDescriptionBar";
import { VariableInspector } from "./VariableInspector";
import { BarDiagram } from "./diagrams/BarDiagram";
import { ArrayBoxDiagram } from "./diagrams/ArrayBoxDiagram";
import { SplitMergeDiagram } from "./diagrams/SplitMergeDiagram";
import { GraphDiagram } from "./diagrams/GraphDiagram";
import { StackDiagram } from "./diagrams/StackDiagram";
import { QueueDiagram } from "./diagrams/QueueDiagram";

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

  const fallbackStep: TraceStep = {
    stepIndex: 0,
    line: 1,
    type: "init",
    arrayState: [5, 3, 8, 1, 9, 2, 4],
    highlighting: {},
    variables: { status: "READY" },
    description: "Write or select an algorithm and click 'Run & Trace' to start visual execution.",
  };

  const activeStep = currentStep || allSteps[currentStepIndex] || fallbackStep;

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
    <div className="flex flex-col h-full min-h-0 w-full space-y-2 overflow-hidden">
      {/* 1. Collapsible Theory Section (max-h-44 internally scrollable) */}
      {theory && (
        <TheoryPanel
          theory={theory}
          activeTheoryStep={activeStep.theoryStepIndex ?? 0}
          isOpen={isTheoryOpen}
          onToggleOpen={() => setIsTheoryOpen(!isTheoryOpen)}
        />
      )}

      {/* 2. Visual Diagram Canvas (dynamic height based on theory state) */}
      <div
        className={`w-full transition-all duration-200 shrink-0 ${
          isTheoryOpen ? "h-38 sm:h-40" : "h-48 sm:h-56"
        }`}
      >
        {renderDiagram()}
      </div>

      {/* 3. Step Description Bar (68px fixed) */}
      <StepDescriptionBar
        step={activeStep}
        currentStepIndex={currentStepIndex}
        totalSteps={allSteps.length}
      />

      {/* 4. Variable Watch Inspector (flex-1 takes remaining space, scrolls internally) */}
      <VariableInspector step={activeStep} />
    </div>
  );
}
