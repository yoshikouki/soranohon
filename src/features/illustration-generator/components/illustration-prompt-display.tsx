"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prompts } from "../services/prompt-templates";

interface IllustrationPromptDisplayProps {
  bookId: string;
  title: string;
}

export function IllustrationPromptDisplay({ bookId, title }: IllustrationPromptDisplayProps) {
  const [copied, setCopied] = useState(false);

  const promptText = prompts.illustrationPlan({ bookId, title });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("クリップボードへのコピーに失敗しました", err);
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium text-lg">挿絵計画生成プロンプト</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center gap-1"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "コピーしました" : "コピー"}
        </Button>
      </div>
      <div className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{promptText}</div>
    </Card>
  );
}
