"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface CopyButtonProps {
  value: string;
  icon?: boolean;
  children?: React.ReactNode;
  onCopy?: () => void;
}

export function CopyButton({ value, icon = true, children, onCopy }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setIsCopied(true);
    onCopy?.();
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center justify-center gap-2 rounded-md p-2 hover:bg-muted"
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
