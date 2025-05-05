"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  addReadingHistoryEntry,
  clearReadingHistory,
  getCurrentDate,
  getReadingHistory,
  removeReadingHistoryEntry,
} from "../storage";
import { ReadingHistoryEntry } from "../types";

/**
 * 読書履歴を取得・操作するためのフック
 */
export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // エラーハンドリング共通処理
  const handleError = useCallback((err: unknown, message: string) => {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    console.error(message, errorObj);
    setError(errorObj);
    toast.error(message);
    return errorObj;
  }, []);

  // 読書履歴を取得する
  const fetchHistory = useCallback(() => {
    setIsLoading(true);
    try {
      const data = getReadingHistory();
      setHistory(data);
      setError(null);
    } catch (err) {
      handleError(err, "読書履歴の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // 本を読書履歴に追加する
  const addToHistory = useCallback(
    (book: { bookId: string; title: string; coverImage?: string }) => {
      try {
        if (!book.bookId || !book.title) {
          throw new Error("本のIDとタイトルは必須です");
        }

        const now = getCurrentDate();
        const entry: ReadingHistoryEntry = {
          ...book,
          readAt: now.toISOString(),
        };

        addReadingHistoryEntry(entry);
        fetchHistory(); // 履歴を再取得
        return true;
      } catch (err) {
        handleError(err, `「${book.title}」を読書履歴に追加できませんでした`);
        return false;
      }
    },
    [fetchHistory, handleError],
  );

  // 本を読書履歴から削除する
  const removeFromHistory = useCallback(
    (bookId: string) => {
      try {
        if (!bookId) {
          throw new Error("本のIDが指定されていません");
        }

        removeReadingHistoryEntry(bookId);
        // ローカルの状態を直接更新することでパフォーマンス向上
        setHistory((prev) => prev.filter((item) => item.bookId !== bookId));
        // UIフィードバック
        toast.success("読書履歴から削除しました");
        return true;
      } catch (err) {
        handleError(err, "読書履歴からの削除に失敗しました");
        return false;
      }
    },
    [handleError],
  );

  // 読書履歴をすべて削除する
  const clearHistory = useCallback(() => {
    try {
      clearReadingHistory();
      setHistory([]); // ローカルの状態を直接更新
      toast.success("すべての読書履歴を削除しました");
      return true;
    } catch (err) {
      handleError(err, "読書履歴のクリアに失敗しました");
      return false;
    }
  }, [handleError]);

  // コンポーネントのマウント時に読書履歴を取得
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    addToHistory,
    removeFromHistory,
    clearHistory,
    refreshHistory: fetchHistory,
  };
}
