"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import {
  addReadingHistoryEntry,
  clearReadingHistory,
  getCurrentDate,
  getReadingHistory,
  removeReadingHistoryEntry,
  removeReadingSession,
  updateReadingSession,
} from "../storage";
import { ReadingHistoryEntry, ReadingSession } from "../types";

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
    logger.error(message, errorObj);
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

  // 本を読書履歴に追加する（新しいセッションを開始する）
  const addToHistory = useCallback(
    (
      book: { bookId: string; title: string; coverImage?: string },
      completed = false,
      notes?: string,
      progress?: number,
    ) => {
      try {
        if (!book.bookId || !book.title) {
          throw new Error("本のIDとタイトルは必須です");
        }

        const entry = {
          ...book,
        };

        addReadingHistoryEntry(entry, completed, notes, progress);
        fetchHistory(); // 履歴を再取得
        return true;
      } catch (err) {
        handleError(err, `「${book.title}」を読書履歴に追加できませんでした`);
        return false;
      }
    },
    [fetchHistory, handleError],
  );

  // 本をアクセス履歴として記録する（ページを開いた時の自動記録用）
  const recordBookAccess = useCallback(
    (book: { bookId: string; title: string; coverImage?: string }) => {
      try {
        if (!book.bookId || !book.title) {
          throw new Error("本のIDとタイトルは必須です");
        }

        const entry = {
          ...book,
        };

        // 既存の読了状態を保持して更新
        addReadingHistoryEntry(entry, false);
        // 静かに更新（UI通知なし）
        fetchHistory();
        return true;
      } catch (err) {
        logger.error("Failed to record book access:", err);
        return false;
      }
    },
    [fetchHistory],
  );

  // 特定の本のセッションを更新する
  const updateSession = useCallback(
    (
      bookId: string,
      sessionId: string,
      updates: Partial<Omit<ReadingSession, "sessionId" | "startedAt">>,
    ) => {
      try {
        const success = updateReadingSession(bookId, sessionId, updates);
        if (success) {
          fetchHistory(); // 履歴を再取得
          return true;
        }
        throw new Error("セッションの更新に失敗しました");
      } catch (err) {
        handleError(err, "読書セッションの更新に失敗しました");
        return false;
      }
    },
    [fetchHistory, handleError],
  );

  // 特定の本のセッションを終了する
  const completeSession = useCallback(
    (bookId: string, sessionId: string, notes?: string, progress?: number) => {
      try {
        const updates: Partial<Omit<ReadingSession, "sessionId" | "startedAt">> = {
          completed: true,
          endedAt: getCurrentDate().toISOString(),
        };

        if (notes !== undefined) updates.notes = notes;
        if (progress !== undefined) updates.progress = progress;

        const success = updateReadingSession(bookId, sessionId, updates);
        if (success) {
          fetchHistory(); // 履歴を再取得
          return true;
        }
        throw new Error("セッションの完了に失敗しました");
      } catch (err) {
        handleError(err, "読書セッションの完了に失敗しました");
        return false;
      }
    },
    [fetchHistory, handleError],
  );

  // 特定の本のセッションを削除する
  const removeSession = useCallback(
    (bookId: string, sessionId: string) => {
      try {
        const success = removeReadingSession(bookId, sessionId);
        if (success) {
          fetchHistory(); // 履歴を再取得
          return true;
        }
        throw new Error("セッションの削除に失敗しました");
      } catch (err) {
        handleError(err, "読書セッションの削除に失敗しました");
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

  // 特定の本の最新セッションIDを取得する
  const getLatestSessionId = useCallback(
    (bookId: string): string | null => {
      const bookEntry = history.find((e) => e.bookId === bookId);
      if (!bookEntry || !bookEntry.sessions || bookEntry.sessions.length === 0) {
        return null;
      }
      return bookEntry.sessions[0].sessionId;
    },
    [history],
  );

  // 特定の本のすべてのセッションを取得する
  const getSessionsForBook = useCallback(
    (bookId: string): ReadingSession[] => {
      const bookEntry = history.find((e) => e.bookId === bookId);
      if (!bookEntry || !bookEntry.sessions) {
        return [];
      }
      return bookEntry.sessions;
    },
    [history],
  );

  return {
    history,
    isLoading,
    error,
    addToHistory,
    recordBookAccess,
    removeFromHistory,
    clearHistory,
    refreshHistory: fetchHistory,
    // 新しいセッション関連の機能を公開
    updateSession,
    completeSession,
    removeSession,
    getLatestSessionId,
    getSessionsForBook,
  };
}
