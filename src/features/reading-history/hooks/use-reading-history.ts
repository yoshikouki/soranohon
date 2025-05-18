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

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((err: unknown, message: string) => {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    logger.error(message, errorObj);
    setError(errorObj);
    toast.error(message);
    return errorObj;
  }, []);

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
        fetchHistory();
        return true;
      } catch (err) {
        handleError(err, `「${book.title}」を読書履歴に追加できませんでした`);
        return false;
      }
    },
    [fetchHistory, handleError],
  );

  const recordBookAccess = useCallback(
    (book: { bookId: string; title: string; coverImage?: string }) => {
      try {
        if (!book.bookId || !book.title) {
          throw new Error("本のIDとタイトルは必須です");
        }

        const entry = {
          ...book,
        };

        addReadingHistoryEntry(entry, false);
        fetchHistory();
        return true;
      } catch (err) {
        logger.error("Failed to record book access:", err);
        return false;
      }
    },
    [fetchHistory],
  );

  const updateSession = useCallback(
    (
      bookId: string,
      sessionId: string,
      updates: Partial<Omit<ReadingSession, "sessionId" | "startedAt">>,
    ) => {
      try {
        const success = updateReadingSession(bookId, sessionId, updates);
        if (success) {
          fetchHistory();
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
          fetchHistory();
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

  const removeSession = useCallback(
    (bookId: string, sessionId: string) => {
      try {
        const success = removeReadingSession(bookId, sessionId);
        if (success) {
          fetchHistory();
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

  const removeFromHistory = useCallback(
    (bookId: string) => {
      try {
        if (!bookId) {
          throw new Error("本のIDが指定されていません");
        }

        removeReadingHistoryEntry(bookId);
        // ローカルの状態を直接更新することでパフォーマンス向上
        setHistory((prev) => prev.filter((item) => item.bookId !== bookId));
        toast.success("読書履歴から削除しました");
        return true;
      } catch (err) {
        handleError(err, "読書履歴からの削除に失敗しました");
        return false;
      }
    },
    [handleError],
  );

  const clearHistory = useCallback(() => {
    try {
      clearReadingHistory();
      setHistory([]);
      toast.success("すべての読書履歴を削除しました");
      return true;
    } catch (err) {
      handleError(err, "読書履歴のクリアに失敗しました");
      return false;
    }
  }, [handleError]);

  const isBookInHistory = useCallback(
    (bookId: string) => {
      return history.some((item) => item.bookId === bookId);
    },
    [history],
  );

  const getBookEntry = useCallback(
    (bookId: string) => {
      return history.find((item) => item.bookId === bookId);
    },
    [history],
  );

  const getActiveSessions = useCallback(() => {
    const activeSessions: Array<{
      entry: ReadingHistoryEntry;
      session: ReadingSession;
    }> = [];

    history.forEach((entry) => {
      entry.sessions.forEach((session) => {
        if (!session.endedAt) {
          activeSessions.push({ entry, session });
        }
      });
    });

    return activeSessions;
  }, [history]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    addToHistory,
    recordBookAccess,
    updateSession,
    completeSession,
    removeSession,
    removeFromHistory,
    clearHistory,
    isBookInHistory,
    getBookEntry,
    getActiveSessions,
    refetch: fetchHistory,
  };
}
