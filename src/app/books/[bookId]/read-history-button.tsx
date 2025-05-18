"use client";

import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useReadingHistory } from "@/features/reading-history/hooks/use-reading-history";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

type ReadHistoryButtonProps = {
  book: {
    bookId: string;
    title: string;
    coverImage?: string;
  };
  variant?: "ghost" | "default" | "outline";
  completed?: boolean;
  children?: React.ReactNode;
};

export function ReadHistoryButton({
  book,
  variant = "ghost",
  completed = false,
  children,
}: ReadHistoryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { addToHistory, history, refreshHistory } = useReadingHistory();

  useEffect(() => {
    const existingEntry = history.find((item) => item.bookId === book.bookId);
    setIsRead(!!existingEntry);
    setIsCompleted(existingEntry?.completed || false);
  }, [history, book.bookId]);

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
      logger.error("Failed to add to reading history:", error);
      toast.error("読書履歴への追加に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={variant === "default" ? "default" : "sm"}
      onClick={handleAddToHistory}
      disabled={isLoading || (isCompleted && completed)}
      className={cn(
        "w-full",
        variant === "ghost" && (isRead || isCompleted)
          ? "flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20"
          : "flex items-center gap-1.5 text-primary hover:bg-primary/10 hover:text-primary",
      )}
    >
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <CheckCircle />
      )}
      {children}
    </Button>
  );
}
