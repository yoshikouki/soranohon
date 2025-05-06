"use client";

import { useEffect } from "react";
import { useReadingHistory } from "@/features/reading-history";

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

  // ページアクセス時に履歴を記録する
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // bookIdが変わったときだけ記録する（マウント時含む）
    recordBookAccess({
      bookId: book.bookId,
      title: book.title,
      coverImage: book.coverImage,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    book.bookId,
    book.coverImage,
    book.title, // bookIdが変わったときだけ記録する（マウント時含む）
    recordBookAccess,
  ]);

  // 何も表示しないコンポーネント
  return null;
}
