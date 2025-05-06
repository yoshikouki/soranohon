/**
 * 読書履歴のエントリー型定義
 */
export type ReadingHistoryEntry = {
  bookId: string;
  title: string;
  readAt: string; // ISO形式の日時文字列（最初にアクセスした日時）
  lastReadAt: string; // ISO形式の日時文字列（最後にアクセスした日時）
  completed: boolean; // 読了したかどうか
  coverImage?: string;
};
