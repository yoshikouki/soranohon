/**
 * 読書履歴のエントリー型定義
 */
export type ReadingHistoryEntry = {
  bookId: string;
  title: string;
  readAt: string; // ISO形式の日時文字列
  coverImage?: string;
};
