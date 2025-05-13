"use client";

import { useChat } from "@ai-sdk/react";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { logger } from "@/lib/logger";
import { paths } from "@/lib/paths";
import { prompts } from "../prompts";
import { BookForIllustrationPlan } from "../types";

interface IllustrationPromptDisplayProps extends BookForIllustrationPlan {}

export function IllustrationPromptDisplay(book: IllustrationPromptDisplayProps) {
  const promptText = prompts.illustrationPlan(book);

  const { messages, input, status, handleInputChange, handleSubmit } = useChat({
    api: paths.books.illustrationPlans(book.bookId),
    id: `illustration-plan-${book.bookId}`,
    initialInput: promptText,
    onError: (error) => {
      logger.error("挿絵計画の生成に失敗しました", error);
      toast.error("挿絵計画の生成に失敗しました");
    },
    onFinish: (result) => {
      toast.success("挿絵計画を生成しました");
      logger.info("Illustration Plan Result", result);
    },
  });
  const isLoading = status === "submitted" || status === "streaming";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      toast.success("クリップボードにコピーしました");
    } catch (err) {
      logger.error("クリップボードへのコピーに失敗しました", err);
    }
  };

  const responses = messages.filter((message) => message.role === "assistant");

  return (
    <div className="space-y-4">
      <Card className="p-4">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="animate-pulse">生成中...</div>
            <div className="h-96 overflow-y-auto">
              {responses.map((message) => (
                <pre
                  key={message.id}
                  className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm"
                >
                  {message.parts.map((part) => part.type === "text" && part.text)}
                </pre>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">挿絵計画生成プロンプト</h3>
              <div className="flex items-center gap-4">
                <div className="space-x-2">
                  <span>Length:</span>
                  <span>{promptText.length.toLocaleString() || "0"}</span>
                </div>
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
            </div>
            <form onSubmit={handleSubmit} className="">
              <Textarea
                name="prompt"
                value={input}
                onChange={handleInputChange}
                className="h-96 w-full rounded-md bg-muted p-4"
                placeholder="挿絵の計画を入力してください"
              />
              <Button type="submit" className="w-full">
                計画する
              </Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
