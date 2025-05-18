import { useEffect, useState } from "react";

export type FontSize = "sm" | "base" | "lg" | "xl" | "2xl";

interface ViewerSettings {
  showRuby: boolean;
  fontSize: FontSize;
}

const DEFAULT_SETTINGS: ViewerSettings = {
  showRuby: true,
  fontSize: "xl",
};

const STORAGE_KEY = "viewer-settings";

export function useViewerSettings() {
  const [settings, setSettings] = useState<ViewerSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ViewerSettings;
      setSettings(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggleRuby = () => {
    setSettings((prev) => ({ ...prev, showRuby: !prev.showRuby }));
  };

  const setFontSize = (fontSize: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize }));
  };

  return {
    showRuby: settings.showRuby,
    fontSize: settings.fontSize,
    toggleRuby,
    setFontSize,
  };
}
