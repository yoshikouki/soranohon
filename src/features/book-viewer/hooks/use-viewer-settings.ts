import { useEffect, useRef, useState } from "react";

export type FontSize = "sm" | "base" | "lg" | "xl" | "2xl";

interface ViewerSettings {
  showRuby: boolean;
  showIllustrations: boolean;
  fontSize: FontSize;
}

const DEFAULT_SETTINGS: ViewerSettings = {
  showRuby: true,
  showIllustrations: true,
  fontSize: "xl",
};

const STORAGE_KEY = "viewer-settings";
const CHANNEL_NAME = "viewer-settings-channel";

export function useViewerSettings() {
  const [settings, _setSettings] = useState<ViewerSettings>(DEFAULT_SETTINGS);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const getChannel = () => {
    if (!channelRef.current) {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    }
    return channelRef.current;
  };

  const setSettings = (state: ViewerSettings | ((prev: ViewerSettings) => ViewerSettings)) => {
    _setSettings((prevSettings) => {
      const newSettings = typeof state === "function" ? state(prevSettings) : state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      const channel = getChannel();
      channel.postMessage(newSettings);
      return newSettings;
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        _setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error("Failed to parse stored settings:", e);
        _setSettings(DEFAULT_SETTINGS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      }
    }
  }, []);

  useEffect(() => {
    const channel = getChannel();
    const onPublishedMessage = (event: MessageEvent<ViewerSettings>) => {
      _setSettings(event.data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(event.data));
    };
    channel.addEventListener("message", onPublishedMessage);
    return () => {
      channel.removeEventListener("message", onPublishedMessage);
      channel.close();
      channelRef.current = null;
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: React Compiler
  }, [getChannel]);

  const toggleRuby = () => {
    setSettings((prev) => ({ ...prev, showRuby: !prev.showRuby }));
  };

  const toggleIllustrations = () => {
    setSettings((prev) => ({
      ...prev,
      showIllustrations: !prev.showIllustrations,
    }));
  };

  const setFontSize = (fontSize: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize }));
  };

  return {
    showRuby: settings.showRuby,
    showIllustrations: settings.showIllustrations,
    fontSize: settings.fontSize,
    toggleRuby,
    toggleIllustrations,
    setFontSize,
  };
}
