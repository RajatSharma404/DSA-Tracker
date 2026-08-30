import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CityFeatureShowcase } from "../CityFeatureShowcase";

describe("CityFeatureShowcase", () => {
  it("should render 3D city feature cards and handle hover", () => {
    render(<CityFeatureShowcase />);
    expect(screen.getByText("Dynamic Spatial Skylines")).toBeDefined();
    expect(screen.getByText("1v1 Rooftop PvP Battles")).toBeDefined();
    expect(screen.getByText("AI Holographic Architect")).toBeDefined();

    fireEvent.mouseEnter(screen.getByText("Dynamic Spatial Skylines"));
  });
});
