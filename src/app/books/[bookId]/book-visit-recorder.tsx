"use client";

import { useEffect } from "react";
import { useReadingHistory } from "@/features/reading-history/hooks/use-reading-history";

type BookVisitRecorderProps = {
  book: {
    bookId: string;
    title: string;
    coverImage?: string;
  };
};

/**
 * ページ訪問時に自動的に読書履歴を記録するコンポーネント
 * 表示されないコンポーネントで、マウント時に履歴を記録します
 */
export function BookVisitRecorder({ book }: BookVisitRecorderProps) {
  const { recordBookAccess } = useReadingHistory();

  useEffect(() => {
    recordBookAccess({
      bookId: book.bookId,
      title: book.title,
      coverImage: book.coverImage,
    });
  }, [
    book.bookId,
    book.coverImage,
    book.title,
    recordBookAccess,
  ]);

  return null;
}
