"use client";

import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyPromptButtonProps {
  prompt: string;
  label?: string;
  className?: string;
}

export function CopyPromptButton({
  prompt,
  label = "プロンプトをコピー",
  className,
}: CopyPromptButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(prompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }}
      className={className}
    >
      {isCopied ? (
        <>
          <CheckIcon className="mr-2 h-4 w-4" />
          コピー済み
        </>
      ) : (
        <>
          <ClipboardIcon className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
