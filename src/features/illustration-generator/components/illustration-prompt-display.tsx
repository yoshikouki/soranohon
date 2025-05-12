"use client";

import { readStreamableValue } from "ai/rsc";
import { CopyIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generateIllustrationPlan } from "../actions";
import { prompts } from "../prompts";
import { BookForIllustrationPlan } from "../types";

interface IllustrationPromptDisplayProps extends BookForIllustrationPlan {}

export function IllustrationPromptDisplay(book: IllustrationPromptDisplayProps) {
  const promptText = prompts.illustrationPlan(book);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      toast.success("クリップボードにコピーしました");
    } catch (err) {
      console.error("クリップボードへのコピーに失敗しました", err);
    }
  };

  const generatePlan = async () => {
    try {
      setGeneratingPlan(true);
      setGeneratedPlan("");

      const { output } = await generateIllustrationPlan(book.bookId);

      for await (const delta of readStreamableValue(output)) {
        setGeneratedPlan((currentGeneration) => `${currentGeneration}${delta}`);
      }

      toast.success("挿絵計画を生成しました");
    } catch (err) {
      console.error("挿絵計画の生成に失敗しました", err);
      toast.error("挿絵計画の生成に失敗しました");
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">挿絵計画生成プロンプト</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-1"
            >
              <CopyIcon className="h-4 w-4" />
              コピー
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={generatePlan}
              disabled={generatingPlan}
              className="flex items-center gap-1"
            >
              <SparklesIcon className="h-4 w-4" />
              {generatingPlan ? "生成中..." : "計画を生成"}
            </Button>
          </div>
        </div>
        <div className="space-x-2">
          <span>Length:</span>
          <span>{promptText.length.toLocaleString() || "0"}</span>
        </div>
        <div className="h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
            {promptText}
          </pre>
        </div>
      </Card>

      {(generatingPlan || generatedPlan) && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg">生成された挿絵計画</h3>
            {generatedPlan && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigator.clipboard
                    .writeText(generatedPlan)
                    .then(() => toast.success("クリップボードにコピーしました"))
                }
                className="flex items-center gap-1"
              >
                <CopyIcon className="h-4 w-4" />
                コピー
              </Button>
            )}
          </div>
          <div className="h-96 overflow-y-auto">
            {generatingPlan && !generatedPlan && (
              <div className="flex h-full items-center justify-center">
                <div className="animate-pulse">生成中...</div>
              </div>
            )}
            {generatedPlan && (
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                {generatedPlan}
              </pre>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
