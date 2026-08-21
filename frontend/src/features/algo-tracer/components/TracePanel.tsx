import React, { useState } from "react";
import { TraceStep, DiagramType, TheoryData } from "../types";
import { TheoryPanel } from "./TheoryPanel";
import { StepDescriptionBar } from "./StepDescriptionBar";
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
      {/* 1. Collapsible Theory Section */}
      {theory && (
        <TheoryPanel
          theory={theory}
          activeTheoryStep={activeStep.theoryStepIndex ?? 0}
          isOpen={isTheoryOpen}
          onToggleOpen={() => setIsTheoryOpen(!isTheoryOpen)}
        />
      )}

      {/* 2. Visual Diagram Canvas (flex-1 fills available height) */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        {renderDiagram()}
      </div>

      {/* 3. Step Description Bar (68px fixed at bottom) */}
      <StepDescriptionBar
        step={activeStep}
        currentStepIndex={currentStepIndex}
        totalSteps={allSteps.length}
      />
    </div>
  );
}
