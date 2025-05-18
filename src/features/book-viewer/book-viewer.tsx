"use client";

import { ReactNode } from "react";
import { useViewerSettings } from "@/features/book-viewer/hooks/use-viewer-settings";
import { cn } from "@/lib/utils";

interface BookViewerProps {
  children: ReactNode;
  className?: string;
}

const FONT_SIZE_CLASSES: Record<string, string> = {
  sm: "prose-sm text-sm",
  base: "prose-base text-base",
  lg: "prose-lg text-lg",
  xl: "prose-xl text-xl",
  "2xl": "prose-2xl text-2xl",
};

export function BookViewer({ children, className }: BookViewerProps) {
  const { showRuby, fontSize } = useViewerSettings();

  return (
    <div
      className={cn(
        "prose",
        className,
        FONT_SIZE_CLASSES[fontSize],
        !showRuby && "[&_rt]:hidden",
      )}
    >
      {children}
    </div>
  );
}
