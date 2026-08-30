import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CityTransmissionFeed } from "../CityTransmissionFeed";

describe("CityTransmissionFeed", () => {
  it("should render live feeds and handle hover", () => {
    render(<CityTransmissionFeed />);
    expect(screen.getByText("Live Central Spire Transmissions")).toBeDefined();
    const logItem = screen.getByText(/Spatial physics matrix/i);
    fireEvent.mouseEnter(logItem);
  });
});
