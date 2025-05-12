"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface IllustrationPromptDisplayProps {
  bookId: string;
  title: string;
}

export function IllustrationPromptDisplay({ bookId, title }: IllustrationPromptDisplayProps) {
  const [copied, setCopied] = useState(false);

  // 挿絵生成のプロンプトテンプレート
  const generatePrompt = (data: { bookId: string; title: string }) => {
    return `以下は青空文庫の「${data.title}」（ID: ${data.bookId}）の物語です。
この物語に合う挿絵を10枚程度作成したいと思います。
物語の核心的な場面や重要な瞬間を選び、各シーンの詳細な説明をしてください。

各シーンには以下の情報を含めてください：
1. シーン番号
2. シーンのタイトル
3. シーンの詳細な説明（登場人物、場所、雰囲気、アクション、感情など）
4. 挿絵のスタイルやトーンの提案

回答は以下のフォーマットで整理してください：

## シーン1：[タイトル]
[詳細な説明]

## シーン2：[タイトル]
[詳細な説明]

以下同様に続けてください。`;
  };

  const promptText = generatePrompt({ bookId, title });

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
