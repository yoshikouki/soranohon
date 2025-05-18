"use client";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CopyButton } from "./copy-button";

describe("CopyButton", () => {
  it("should copy value to clipboard", async () => {
    const mockWriteText = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const testValue = "test value";
    const mockOnCopy = vi.fn();

    render(
      <CopyButton value={testValue} onCopy={mockOnCopy}>
        Copy
      </CopyButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(testValue);
      expect(mockOnCopy).toHaveBeenCalled();
    });
  });

  it("should display copied state temporarily", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    vi.useFakeTimers();

    render(<CopyButton value="test">Copy</CopyButton>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });

    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});
