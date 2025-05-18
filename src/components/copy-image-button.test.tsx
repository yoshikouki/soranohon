import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyImageButton } from "./copy-image-button";

afterEach(() => {
  cleanup();
});

describe("CopyImageButton", () => {
  it("renders with children", () => {
    const mockWriteImageToClipboard = vi.fn();
    const mockFetchImage = vi.fn();

    render(
      <CopyImageButton
        imageUrl="/test.jpg"
        writeImageToClipboard={mockWriteImageToClipboard}
        fetchImage={mockFetchImage}
      >
        <span>Copy Image</span>
      </CopyImageButton>,
    );

    expect(screen.getByText("Copy Image")).toBeInTheDocument();
  });

  it("copies image to clipboard on click", async () => {
    const mockBlob = new Blob(["test"], { type: "image/jpeg" });
    const mockFetchImage = vi.fn().mockResolvedValueOnce({
      blob: async () => mockBlob,
    });
    const mockWriteImageToClipboard = vi.fn().mockResolvedValueOnce(undefined);

    const user = userEvent.setup();
    render(
      <CopyImageButton
        imageUrl="/test.jpg"
        writeImageToClipboard={mockWriteImageToClipboard}
        fetchImage={mockFetchImage}
      />,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(mockFetchImage).toHaveBeenCalledWith("/test.jpg");
    });

    await waitFor(
      () => {
        expect(mockWriteImageToClipboard).toHaveBeenCalledWith(mockBlob);
      },
      { timeout: 3000 },
    );
  });

  it("shows check icon after successful copy", async () => {
    const mockBlob = new Blob(["test"], { type: "image/jpeg" });
    const mockFetchImage = vi.fn().mockResolvedValueOnce({
      blob: async () => mockBlob,
    });
    const mockWriteImageToClipboard = vi.fn().mockResolvedValueOnce(undefined);

    const user = userEvent.setup();
    const { container } = render(
      <CopyImageButton
        imageUrl="/test.jpg"
        writeImageToClipboard={mockWriteImageToClipboard}
        fetchImage={mockFetchImage}
      />,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      const checkIcon = container.querySelector(".lucide-check");
      expect(checkIcon).toBeInTheDocument();
    });
  });

  it("calls onCopy callback when provided", async () => {
    const mockBlob = new Blob(["test"], { type: "image/jpeg" });
    const mockFetchImage = vi.fn().mockResolvedValueOnce({
      blob: async () => mockBlob,
    });
    const mockWriteImageToClipboard = vi.fn().mockResolvedValueOnce(undefined);
    const onCopy = vi.fn();

    const user = userEvent.setup();
    render(
      <CopyImageButton
        imageUrl="/test.jpg"
        onCopy={onCopy}
        writeImageToClipboard={mockWriteImageToClipboard}
        fetchImage={mockFetchImage}
      />,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(onCopy).toHaveBeenCalled();
    });
  });

  it("handles copy failure gracefully", async () => {
    const mockFetchImage = vi.fn().mockRejectedValueOnce(new Error("Failed to fetch"));
    const mockWriteImageToClipboard = vi.fn();

    const user = userEvent.setup();
    const { container } = render(
      <CopyImageButton
        imageUrl="/test.jpg"
        writeImageToClipboard={mockWriteImageToClipboard}
        fetchImage={mockFetchImage}
      />,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      const copyIcon = container.querySelector(".lucide-copy");
      expect(copyIcon).toBeInTheDocument();
    });
  });
});
