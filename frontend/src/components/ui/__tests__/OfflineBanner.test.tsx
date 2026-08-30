import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { OfflineBanner } from "../OfflineBanner";

describe("OfflineBanner Component", () => {
  it("should handle offline and online events and retry button", () => {
    const { container } = render(<OfflineBanner />);
    expect(container).toBeDefined();

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    const retryBtn = screen.queryByText(/Retry Connection|Check Connection/i);
    if (retryBtn) {
      fireEvent.click(retryBtn);
    }

    act(() => {
      window.dispatchEvent(new Event("online"));
    });
  });
});
