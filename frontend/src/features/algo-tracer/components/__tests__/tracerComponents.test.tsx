import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ComplexityHUD } from "../ComplexityHUD";
import { ControlsBar } from "../ControlsBar";
import { StepDescriptionBar } from "../StepDescriptionBar";
import { VariableInspector } from "../VariableInspector";
import { ArrayBoxDiagram } from "../diagrams/ArrayBoxDiagram";
import { BarDiagram } from "../diagrams/BarDiagram";
import { StackDiagram } from "../diagrams/StackDiagram";
import { QueueDiagram } from "../diagrams/QueueDiagram";
import { TraceStep } from "../../types";

const mockSteps: TraceStep[] = [
  {
    stepIndex: 0,
    line: 1,
    type: "init",
    arrayState: [4, 2, 8, 1],
    highlighting: {},
    variables: { i: 0, j: 0 },
    description: "Initializing array elements",
  },
  {
    stepIndex: 1,
    line: 3,
    type: "compare",
    arrayState: [4, 2, 8, 1],
    highlighting: { comparing: [0, 1] },
    variables: { i: 0, j: 0, "arr[j]": 4, "arr[j+1]": 2 },
    description: "Comparing 4 and 2",
  },
  {
    stepIndex: 2,
    line: 5,
    type: "swap",
    arrayState: [2, 4, 8, 1],
    highlighting: { comparing: [0, 1] },
    variables: { i: 0, j: 0 },
    description: "Swapping 4 and 2",
  },
];

describe("Algo Tracer UI Components", () => {
  describe("ComplexityHUD", () => {
    it("should render real-time comparisons, operations, and Big-O", () => {
      render(
        <ComplexityHUD
          currentStepIndex={1}
          allSteps={mockSteps}
          theory={{
            algoId: "bubble-sort",
            name: "Bubble Sort",
            category: "Sorting",
            definition: "Test definition",
            howItWorks: ["Step 1"],
            complexity: { best: "O(N)", average: "O(N^2)", worst: "O(N^2)", space: "O(1)" },
            properties: { isStable: true, isInPlace: true, dataStructure: "Array" },
            bestUsedWhen: ["Small datasets"],
          }}
        />
      );

      expect(screen.getByText(/O\(N\^2\)/)).toBeDefined();
      expect(screen.getByText(/O\(1\)/)).toBeDefined();
    });
  });

  describe("ControlsBar", () => {
    it("should render playback control buttons and slider", () => {
      render(
        <ControlsBar
          currentStepIndex={1}
          totalSteps={3}
          isPlaying={false}
          speedDelay={600}
          onNext={vi.fn()}
          onPrev={vi.fn()}
          onFirst={vi.fn()}
          onLast={vi.fn()}
          onReset={vi.fn()}
          onRandomize={vi.fn()}
          onTogglePlay={vi.fn()}
          setSpeedDelay={vi.fn()}
          onScrub={vi.fn()}
          isInputDrawerOpen={false}
          onToggleInputDrawer={vi.fn()}
        />
      );

      expect(screen.getByText("Play")).toBeDefined();
    });
  });

  describe("StepDescriptionBar", () => {
    it("should render current step description and badges", () => {
      render(
        <StepDescriptionBar
          step={mockSteps[1]}
          currentStepIndex={1}
          totalSteps={3}
        />
      );

      expect(screen.getByText("Comparing 4 and 2")).toBeDefined();
      expect(screen.getByText("Compare")).toBeDefined();
    });
  });

  describe("VariableInspector", () => {
    it("should render variable key-value pairs", () => {
      render(<VariableInspector step={mockSteps[1]} />);
      expect(screen.getByText("arr[j]")).toBeDefined();
      expect(screen.getByText("4")).toBeDefined();
    });
  });

  describe("Diagrams", () => {
    it("should render BarDiagram", () => {
      const { container } = render(<BarDiagram step={mockSteps[1]} />);
      expect(container).toBeDefined();
    });

    it("should render ArrayBoxDiagram", () => {
      const { container } = render(<ArrayBoxDiagram step={mockSteps[1]} />);
      expect(container).toBeDefined();
    });

    it("should render StackDiagram", () => {
      const { container } = render(
        <StackDiagram
          step={{
            ...mockSteps[0],
            dataStructureState: ["10", "20"],
          }}
        />
      );
      expect(container).toBeDefined();
    });

    it("should render QueueDiagram", () => {
      const { container } = render(
        <QueueDiagram
          step={{
            ...mockSteps[0],
            dataStructureState: ["10", "20"],
          }}
        />
      );
      expect(container).toBeDefined();
    });
  });
});
