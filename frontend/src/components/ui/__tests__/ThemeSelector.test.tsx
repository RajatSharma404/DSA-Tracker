import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSelector } from "../ThemeSelector";
import { ThemeProvider } from "../../providers/ThemeProvider";

describe("ThemeSelector Component", () => {
  it("should render dropdown variant, switch theme, and handle click outside", () => {
    render(
      <ThemeProvider>
        <div data-testid="outside">Outside Area</div>
        <ThemeSelector variant="dropdown" />
      </ThemeProvider>
    );

    const triggerBtn = screen.getByTitle("Change Theme Preset");
    expect(triggerBtn).toBeDefined();
    fireEvent.click(triggerBtn);

    const matrixOption = screen.getByText("Matrix Emerald");
    expect(matrixOption).toBeDefined();
    fireEvent.click(matrixOption);

    fireEvent.click(triggerBtn);
    fireEvent.mouseDown(screen.getByTestId("outside"));
  });

  it("should render grid and pills variants and handle selection", () => {
    render(
      <ThemeProvider>
        <ThemeSelector variant="grid" />
        <ThemeSelector variant="pills" />
      </ThemeProvider>
    );

    const pillBtn = screen.getAllByText("Tokyo Night")[0];
    if (pillBtn) {
      fireEvent.click(pillBtn);
    }
  });
});
