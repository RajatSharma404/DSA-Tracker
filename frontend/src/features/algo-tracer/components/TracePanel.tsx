import React from "react";
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
import { Activity, Layout } from "lucide-react";

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
  const fallbackStep: TraceStep = {
    stepIndex: 0,
    line: 1,
    type: "init",
    arrayState: [5, 3, 8, 1, 9, 2, 4],
    highlighting: {},
    variables: { status: "READY" },
    description: "Write or select an algorithm and click 'Run & Trace' to begin visual execution.",
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
    <div className="flex flex-col h-full w-full space-y-4">
      {/* Collapsible Theory Panel */}
      {theory && (
        <TheoryPanel
          theory={theory}
          activeTheoryStep={activeStep.theoryStepIndex ?? 0}
        />
      )}

      {/* Visual Diagram Canvas */}
      <div className="flex-1 flex flex-col min-h-75">
        {renderDiagram()}
      </div>

      {/* Step Description Bar */}
      <StepDescriptionBar
        step={activeStep}
        currentStepIndex={currentStepIndex}
        totalSteps={allSteps.length}
      />

      {/* Variable Watch Inspector */}
      <VariableInspector step={activeStep} />
    </div>
  );
}
