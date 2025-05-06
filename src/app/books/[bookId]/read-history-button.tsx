"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useReadingHistory } from "@/features/reading-history";

type ReadHistoryButtonProps = {
  book: {
    bookId: string;
    title: string;
    coverImage?: string;
  };
  variant?: "ghost" | "default" | "outline";
  completed?: boolean;
  label?: string;
};

export function ReadHistoryButton({
  book,
  variant = "ghost",
  completed = false,
  label,
}: ReadHistoryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { addToHistory, history, refreshHistory } = useReadingHistory();

  // 本が既に読書履歴に存在するかチェック
  useEffect(() => {
    const existingEntry = history.find((item) => item.bookId === book.bookId);
    setIsRead(!!existingEntry);
    setIsCompleted(existingEntry?.completed || false);
  }, [history, book.bookId]);

  // コンポーネントマウント時に最新の履歴を確認
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const handleAddToHistory = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const success = await addToHistory(book, completed);
      if (success) {
        setIsRead(true);
        setIsCompleted(completed);
        const message = completed
          ? `「${book.title}」を読了しました！`
          : `「${book.title}」を読書履歴に追加しました`;
        toast.success(message);
      }
    } catch (error) {
      console.error("Failed to add to reading history:", error);
      toast.error("読書履歴への追加に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // ラベルテキストの決定
  const buttonLabel = label || (isCompleted ? "読了済み" : isRead ? "読んだ本" : "読んだ");

  // 完了済みの場合のスタイル
  const getButtonStyle = () => {
    if (variant !== "ghost") return "";

    return `flex items-center gap-1.5 ${
      isRead || isCompleted
        ? "bg-primary/10 text-primary hover:bg-primary/20"
        : "text-primary hover:bg-primary/10 hover:text-primary"
    }`;
  };

  return (
    <Button
      variant={variant}
      size={variant === "default" ? "default" : "sm"}
      onClick={handleAddToHistory}
      disabled={isLoading || (isCompleted && completed)}
      className={getButtonStyle()}
    >
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={(isRead && variant === "ghost") || isCompleted ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          role="img"
          className="mr-1.5"
        >
          <title>読んだ状態を示すチェックアイコン</title>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )}
      {buttonLabel}
    </Button>
  );
}
