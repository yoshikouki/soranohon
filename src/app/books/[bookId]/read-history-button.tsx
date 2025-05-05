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
};

export function ReadHistoryButton({ book }: ReadHistoryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const { addToHistory, history, refreshHistory } = useReadingHistory();

  // 本が既に読書履歴に存在するかチェック
  useEffect(() => {
    setIsRead(history.some((item) => item.bookId === book.bookId));
  }, [history, book.bookId]);

  // コンポーネントマウント時に最新の履歴を確認
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const handleAddToHistory = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const success = await addToHistory(book);
      if (success) {
        setIsRead(true);
        toast.success(`「${book.title}」を読書履歴に追加しました`);
      }
    } catch (error) {
      console.error("Failed to add to reading history:", error);
      toast.error("読書履歴への追加に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleAddToHistory}
      disabled={isLoading}
      className={`flex items-center gap-1.5 ${
        isRead
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "text-primary hover:bg-primary/10 hover:text-primary"
      }`}
    >
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={isRead ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          role="img"
        >
          <title>読んだ状態を示すチェックアイコン</title>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )}
      {isRead ? "読んだ本" : "読んだ"}
    </Button>
  );
}
