import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "./copy-button";

afterEach(() => {
  cleanup();
});

describe("CopyButton", () => {
  it("should copy value to clipboard", async () => {
    const mockWriteTextToClipboard = vi.fn().mockResolvedValue(undefined);
    const testValue = "test value";
    const mockOnCopy = vi.fn();
    const user = userEvent.setup();

    render(
      <CopyButton
        value={testValue}
        onCopy={mockOnCopy}
        writeTextToClipboard={mockWriteTextToClipboard}
      >
        Copy
      </CopyButton>,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(mockWriteTextToClipboard).toHaveBeenCalledWith(testValue);
      expect(mockOnCopy).toHaveBeenCalled();
    });
  });

  it("should display copied state temporarily", async () => {
    const mockWriteTextToClipboard = vi.fn().mockResolvedValue(undefined);

    render(
      <CopyButton value="test" writeTextToClipboard={mockWriteTextToClipboard}>
        Copy
      </CopyButton>,
    );

    const button = screen.getByRole("button");
    expect(screen.getByTestId("copy-icon")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
        expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
