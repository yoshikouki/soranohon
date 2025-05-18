"use client";

import { ReactNode } from "react";
import { useViewerSettings } from "@/features/book-viewer/hooks/use-viewer-settings";
import { cn } from "@/lib/utils";

interface BookViewerProps {
  children: ReactNode;
  className?: string;
}

const FONT_SIZE_CLASSES: Record<string, string> = {
  sm: "prose prose-lg",
  base: "prose prose-lg",
  lg: "prose prose-xl",
  xl: "prose prose-xl",
  "2xl": "prose prose-2xl",
};

export function BookViewer({ children, className }: BookViewerProps) {
  const { showRuby, fontSize } = useViewerSettings();

  return (
    <div className={cn(className, FONT_SIZE_CLASSES[fontSize], !showRuby && "[&_rt]:hidden")}>
      {children}
    </div>
  );
}
