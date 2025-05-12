"use client";

import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prompts } from "../services/prompt-templates";

interface IllustrationPromptDisplayProps {
  bookId: string;
  title: string;
  contentWithTags: string;
}

export function IllustrationPromptDisplay(book: IllustrationPromptDisplayProps) {
  const promptText = prompts.illustrationPlan(book);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      toast.success("クリップボードにコピーしました");
    } catch (err) {
      console.error("クリップボードへのコピーに失敗しました", err);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">挿絵計画生成プロンプト</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center gap-1"
        >
          <CopyIcon className="h-4 w-4" />
          コピー
        </Button>
      </div>
      <div className="space-x-2">
        <span>Length:</span>
        <span>{promptText.length.toLocaleString() || "0"}</span>
      </div>
      <div className="h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{promptText}</pre>
      </div>
    </Card>
  );
}
