import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useViewerSettings } from "./use-viewer-settings";

describe("useViewerSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with default settings", () => {
    const { result } = renderHook(() => useViewerSettings());

    expect(result.current.showRuby).toBe(true);
    expect(result.current.showIllustrations).toBe(true);
    expect(result.current.fontSize).toBe("xl");
  });

  it("should toggle ruby display", () => {
    const { result } = renderHook(() => useViewerSettings());

    act(() => {
      result.current.toggleRuby();
    });

    expect(result.current.showRuby).toBe(false);

    act(() => {
      result.current.toggleRuby();
    });

    expect(result.current.showRuby).toBe(true);
  });

  it("should change font size", () => {
    const { result } = renderHook(() => useViewerSettings());

    act(() => {
      result.current.setFontSize("sm");
    });

    expect(result.current.fontSize).toBe("sm");

    act(() => {
      result.current.setFontSize("2xl");
    });

    expect(result.current.fontSize).toBe("2xl");
  });

  it("should load settings from localStorage", () => {
    const savedSettings = {
      showRuby: false,
      showIllustrations: false,
      fontSize: "lg",
    };
    localStorage.setItem("viewer-settings", JSON.stringify(savedSettings));

    const { result } = renderHook(() => useViewerSettings());

    expect(result.current.showRuby).toBe(false);
    expect(result.current.showIllustrations).toBe(false);
    expect(result.current.fontSize).toBe("lg");
  });

  it("should save settings to localStorage", () => {
    const { result } = renderHook(() => useViewerSettings());

    act(() => {
      result.current.toggleRuby();
      result.current.toggleIllustrations();
      result.current.setFontSize("sm");
    });

    const saved = JSON.parse(localStorage.getItem("viewer-settings") || "{}");
    expect(saved.showRuby).toBe(false);
    expect(saved.showIllustrations).toBe(false);
    expect(saved.fontSize).toBe("sm");
  });
});
