/**
 * 読書履歴の単一セッション型定義
 */
export type ReadingSession = {
  sessionId: string; // 各読書セッションの一意のID
  startedAt: string; // ISO形式の日時文字列（セッション開始日時）
  endedAt?: string; // ISO形式の日時文字列（セッション終了日時、省略可）
  completed: boolean; // このセッションで読了したかどうか
  progress?: number; // 読書の進捗状況（0-100のパーセンテージなど、省略可）
  notes?: string; // このセッションに関するメモ（省略可）
};

/**
 * 読書履歴のエントリー型定義
 */
export type ReadingHistoryEntry = {
  bookId: string;
  title: string;
  firstReadAt: string; // ISO形式の日時文字列（最初に読み始めた日時）
  lastReadAt: string; // ISO形式の日時文字列（最後にアクセスした日時）
  completed: boolean; // 読了したかどうか（どれかのセッションで完了している場合true）
  coverImage?: string;
  sessions: ReadingSession[]; // この本に関する複数の読書セッション
};
