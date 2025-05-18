"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  icon?: boolean;
  children?: React.ReactNode;
  onCopy?: () => void;
  writeTextToClipboard?: (text: string) => Promise<void>;
  className?: string;
}

export function CopyButton({
  value,
  icon = true,
  children,
  onCopy,
  writeTextToClipboard,
  className,
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const writer = writeTextToClipboard || ((text) => navigator.clipboard.writeText(text));
    await writer(value);
    setIsCopied(true);
    onCopy?.();
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "flex items-center justify-center gap-2 rounded-md p-2 hover:bg-muted",
        className,
      )}
    >
      {icon &&
        (isCopied ? (
          <CheckIcon className="h-4 w-4" data-testid="check-icon" />
        ) : (
          <CopyIcon className="h-4 w-4" data-testid="copy-icon" />
        ))}
      {children}
    </button>
  );
}
