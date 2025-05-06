import { v4 as uuidv4 } from "uuid";
import { ReadingHistoryEntry, ReadingSession } from "./types";

const STORAGE_KEY = "soranohon:reading-history";

/**
 * LocalStorage が利用可能かどうかを確認する
 */
function isStorageAvailable(): boolean {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return false;
  }

  try {
    // LocalStorage アクセス許可のテスト
    const testKey = "soranohon:storage-test";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.error("LocalStorage is not available:", error);
    return false;
  }
}

/**
 * 読書履歴をすべて取得する
 * @returns 読書履歴の配列（新しい順）
 */
export function getReadingHistory(): ReadingHistoryEntry[] {
  if (!isStorageAvailable()) {
    console.warn("LocalStorage is not available, returning empty history");
    return [];
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // データが存在しない場合は空の配列を初期値として保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    try {
      const parsedData = JSON.parse(data);
      // 配列でない場合は初期化
      if (!Array.isArray(parsedData)) {
        console.warn("Invalid reading history format, resetting");
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
      }

      // エントリーを検証して、新しいスキーマに変換
      const migratedEntries: ReadingHistoryEntry[] = parsedData
        .map((entry: unknown) => {
          // 基本的な検証
          if (
            !entry ||
            typeof entry !== "object" ||
            typeof entry.bookId !== "string" ||
            typeof entry.title !== "string"
          ) {
            return null; // 不正なエントリーはnullを返し、後でフィルタリング
          }

          // 旧形式から新形式への移行処理
          if (!entry.sessions) {
            // 旧形式のエントリーからセッションを構築
            const session: ReadingSession = {
              sessionId: uuidv4(),
              startedAt: entry.readAt || getCurrentDate().toISOString(),
              endedAt: entry.lastReadAt || undefined,
              completed: entry.completed || false,
            };

            // 新形式のエントリーを返す
            return {
              bookId: entry.bookId,
              title: entry.title,
              firstReadAt: entry.readAt || getCurrentDate().toISOString(),
              lastReadAt: entry.lastReadAt || entry.readAt || getCurrentDate().toISOString(),
              completed: entry.completed || false,
              coverImage: entry.coverImage,
              sessions: [session],
            };
          }

          // すでに新形式のエントリーの場合はそのまま返す
          return entry;
        })
        .filter(Boolean) as ReadingHistoryEntry[]; // nullをフィルタリング

      // 形式不正なエントリーがあった場合は修正したデータで上書き
      if (migratedEntries.length !== parsedData.length) {
        console.warn("Some reading history entries are invalid, filtering them out");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedEntries));
      }

      // 最終閲覧日時の新しい順にソート
      return migratedEntries.sort((a, b) => {
        const dateA = new Date(a.lastReadAt).getTime();
        const dateB = new Date(b.lastReadAt).getTime();
        return Number.isNaN(dateA) || Number.isNaN(dateB) ? 0 : dateB - dateA;
      });
    } catch (parseError) {
      console.error("Failed to parse reading history:", parseError);
      // パースエラーの場合はデータを初期化
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
  } catch (error) {
    console.error("Failed to get reading history from localStorage:", error);
    return [];
  }
}

/**
 * 読書履歴に新しいエントリーを追加する
 * @param entry 追加する読書履歴エントリー
 * @param completed 読了したかどうか（デフォルトはfalse）
 * @param notes セッションに関するメモ（省略可）
 * @param progress 読書の進捗状況（0-100のパーセンテージなど、省略可）
 */
export function addReadingHistoryEntry(
  entry: Omit<ReadingHistoryEntry, "lastReadAt" | "completed" | "firstReadAt" | "sessions">,
  completed = false,
  notes?: string,
  progress?: number,
): void {
  if (!isStorageAvailable()) {
    console.warn("LocalStorage is not available, skipping add operation");
    return;
  }

  try {
    const entries = getReadingHistory();
    const now = getCurrentDate().toISOString();

    // 同じ本の既存エントリーを探す
    const existingEntry = entries.find((e) => e.bookId === entry.bookId);

    // 新しいセッションを作成
    const newSession: ReadingSession = {
      sessionId: uuidv4(),
      startedAt: now,
      completed,
      notes,
      progress,
    };

    // 新しいエントリーを作成
    const newEntry: ReadingHistoryEntry = existingEntry
      ? {
          ...existingEntry,
          // 最終アクセス時刻は常に更新
          lastReadAt: now,
          // いずれかのセッションが完了している場合はtrueに
          completed: existingEntry.completed || completed,
          // 既存のセッションリストの先頭に新しいセッションを追加
          sessions: [newSession, ...existingEntry.sessions],
        }
      : {
          ...entry,
          firstReadAt: now,
          lastReadAt: now,
          completed,
          sessions: [newSession],
        };

    // 同じ本がすでに存在する場合は削除（後で新しいエントリーを追加するため）
    const filteredEntries = entries.filter((e) => e.bookId !== entry.bookId);

    // 新しいエントリーを追加
    const newEntries = [newEntry, ...filteredEntries];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  } catch (error) {
    console.error("Failed to add reading history to localStorage:", error);
    throw new Error(
      `読書履歴の追加に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 特定の本の読書履歴を削除する
 * @param bookId 削除する本のID
 */
export function removeReadingHistoryEntry(bookId: string): void {
  if (!isStorageAvailable()) {
    console.warn("LocalStorage is not available, skipping remove operation");
    return;
  }

  try {
    const entries = getReadingHistory();
    const filteredEntries = entries.filter((entry) => entry.bookId !== bookId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
  } catch (error) {
    console.error("Failed to remove reading history from localStorage:", error);
    throw new Error(
      `読書履歴の削除に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 読書履歴をすべて削除する
 */
export function clearReadingHistory(): void {
  if (!isStorageAvailable()) {
    console.warn("LocalStorage is not available, skipping clear operation");
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    // 空の配列で初期化
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error("Failed to clear reading history from localStorage:", error);
    throw new Error(
      `読書履歴のクリアに失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 特定の本の特定のセッションを更新する
 * @param bookId 本のID
 * @param sessionId セッションID
 * @param updates 更新内容
 */
export function updateReadingSession(
  bookId: string,
  sessionId: string,
  updates: Partial<Omit<ReadingSession, "sessionId" | "startedAt">>,
): boolean {
  if (!isStorageAvailable()) {
    console.warn("LocalStorage is not available, skipping session update");
    return false;
  }

  try {
    const entries = getReadingHistory();
    const bookEntry = entries.find((e) => e.bookId === bookId);

    if (!bookEntry) {
      console.warn(`Book with ID ${bookId} not found in reading history`);
      return false;
    }

    // セッションを見つける
    const sessionIndex = bookEntry.sessions.findIndex((s) => s.sessionId === sessionId);
    if (sessionIndex === -1) {
      console.warn(`Session with ID ${sessionId} not found for book ${bookId}`);
      return false;
    }

    // セッションを更新
    const updatedSession = {
      ...bookEntry.sessions[sessionIndex],
      ...updates,
    };

    // セッションが完了としてマークされた場合、endedAtを設定
    if (updates.completed && !updatedSession.endedAt) {
      updatedSession.endedAt = getCurrentDate().toISOString();
    }

    // 更新されたセッションで配列を更新
    const updatedSessions = [...bookEntry.sessions];
    updatedSessions[sessionIndex] = updatedSession;

    // エントリーを更新
    const updatedEntry = {
      ...bookEntry,
      sessions: updatedSessions,
      // いずれかのセッションが完了している場合はtrueに
      completed: updatedSessions.some((s) => s.completed),
      // 最終アクセス日時を更新（セッション終了時）
      lastReadAt: updates.endedAt || bookEntry.lastReadAt,
    };

    // 既存のエントリーを更新
    const updatedEntries = entries.map((e) => (e.bookId === bookId ? updatedEntry : e));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));

    return true;
  } catch (error) {
    console.error("Failed to update reading session:", error);
    return false;
  }
}

/**
 * 特定の本の特定のセッションを削除する
 * @param bookId 本のID
 * @param sessionId セッションID
 */
export function removeReadingSession(bookId: string, sessionId: string): boolean {
  if (!isStorageAvailable()) {
    console.warn("LocalStorage is not available, skipping session removal");
    return false;
  }

  try {
    const entries = getReadingHistory();
    const bookEntry = entries.find((e) => e.bookId === bookId);

    if (!bookEntry) {
      console.warn(`Book with ID ${bookId} not found in reading history`);
      return false;
    }

    // セッションが1つしかない場合は、エントリー自体を削除
    if (bookEntry.sessions.length <= 1) {
      removeReadingHistoryEntry(bookId);
      return true;
    }

    // 特定のセッションを除外
    const filteredSessions = bookEntry.sessions.filter((s) => s.sessionId !== sessionId);

    // セッションが見つからない場合
    if (filteredSessions.length === bookEntry.sessions.length) {
      console.warn(`Session with ID ${sessionId} not found for book ${bookId}`);
      return false;
    }

    // エントリーを更新
    const updatedEntry = {
      ...bookEntry,
      sessions: filteredSessions,
      // いずれかのセッションが完了している場合はtrueに
      completed: filteredSessions.some((s) => s.completed),
    };

    // 既存のエントリーを更新
    const updatedEntries = entries.map((e) => (e.bookId === bookId ? updatedEntry : e));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));

    return true;
  } catch (error) {
    console.error("Failed to remove reading session:", error);
    return false;
  }
}

/**
 * 現在の正しい日時を取得する関数
 */
export function getCurrentDate(customDate?: Date): Date {
  // 基準となる日付
  const now = customDate || new Date();

  // 明らかに未来の日付の場合は修正
  const currentYear = new Date().getFullYear();
  const maxValidYear = currentYear + 1; // 1年先までは許容

  if (now.getFullYear() > maxValidYear) {
    console.warn(`日付が不正です: ${now.toISOString()}, 年を${currentYear}に修正します`);
    now.setFullYear(currentYear);
  }

  return now;
}
