import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";
import { readingHistoryEntrySchema, readingHistorySchema } from "./schema";
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
    logger.error("LocalStorage is not available:", error);
    return false;
  }
}

/**
 * 読書履歴をすべて取得する
 * @returns 読書履歴の配列（新しい順）
 */
export function getReadingHistory(): ReadingHistoryEntry[] {
  if (!isStorageAvailable()) {
    logger.warn("LocalStorage is not available, returning empty history");
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
      // JSON解析とデータ検証
      const parsedData = JSON.parse(data);

      // Zodでの検証を試行
      const validationResult = readingHistorySchema.safeParse(parsedData);

      if (validationResult.success) {
        // 検証に成功した場合はそのまま返す（新しい形式のデータ）
        return validationResult.data.sort((a, b) => {
          const dateA = new Date(a.lastReadAt).getTime();
          const dateB = new Date(b.lastReadAt).getTime();
          return Number.isNaN(dateA) || Number.isNaN(dateB) ? 0 : dateB - dateA;
        });
      }

      // 配列でない場合は初期化
      if (!Array.isArray(parsedData)) {
        logger.warn("Invalid reading history format, resetting");
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
            // @ts-ignore - このチェックは型安全ではないが、ここでは必要
            typeof entry.bookId !== "string" ||
            // @ts-ignore - このチェックは型安全ではないが、ここでは必要
            typeof entry.title !== "string"
          ) {
            return null; // 不正なエントリーはnullを返し、後でフィルタリング
          }

          try {
            // 旧形式から新形式への移行処理
            // @ts-ignore - 型安全ではないが、マイグレーションのためのコード
            if (!entry.sessions) {
              // 旧形式のエントリーからセッションを構築
              const session: ReadingSession = {
                sessionId: uuidv4(),
                // @ts-ignore - 型安全ではないが、マイグレーションのためのコード
                startedAt: entry.readAt || getCurrentDate().toISOString(),
                // @ts-ignore - 型安全ではないが、マイグレーションのためのコード
                endedAt: entry.lastReadAt || undefined,
                // @ts-ignore - 型安全ではないが、マイグレーションのためのコード
                completed: entry.completed || false,
              };

              // 新形式のエントリーを作成
              const newEntry = {
                // @ts-ignore - 型安全ではないが、マイグレーションのためのコード
                bookId: entry.bookId,
                // @ts-ignore - 型安全ではないが、マイグレーションのためのコード
                title: entry.title,
                // @ts-ignore - 型安全ではないが、マイグレーションのためのコード
                firstReadAt: entry.readAt || getCurrentDate().toISOString(),
                // @ts-ignore - 型安全ではないが、マイグレーションのためのコード
                lastReadAt: entry.lastReadAt || entry.readAt || getCurrentDate().toISOString(),
                // @ts-ignore - 型安全ではないが、マイグレーションのためのコード
                completed: entry.completed || false,
                // @ts-ignore - 型安全ではないが、マイグレーションのためのコード
                coverImage: entry.coverImage,
                sessions: [session],
              };

              // 新形式のエントリーを検証
              const validationResult = readingHistoryEntrySchema.safeParse(newEntry);
              if (validationResult.success) {
                return validationResult.data;
              }
              logger.warn("Migrated entry validation failed:", validationResult.error);
              return null;
            }

            // すでに新形式のエントリーの場合は再検証
            const validationResult = readingHistoryEntrySchema.safeParse(entry);
            if (validationResult.success) {
              return validationResult.data;
            }
            logger.warn("Existing entry validation failed:", validationResult.error);
            return null;
          } catch (error) {
            logger.warn("Entry processing failed:", error);
            return null;
          }
        })
        .filter(Boolean) as ReadingHistoryEntry[]; // nullをフィルタリング

      // 形式不正なエントリーがあった場合は修正したデータで上書き
      if (migratedEntries.length !== parsedData.length) {
        logger.warn("Some reading history entries are invalid, filtering them out");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedEntries));
      }

      // 最終閲覧日時の新しい順にソート
      return migratedEntries.sort((a, b) => {
        const dateA = new Date(a.lastReadAt).getTime();
        const dateB = new Date(b.lastReadAt).getTime();
        return Number.isNaN(dateA) || Number.isNaN(dateB) ? 0 : dateB - dateA;
      });
    } catch (parseError) {
      logger.error("Failed to parse reading history:", parseError);
      // パースエラーの場合はデータを初期化
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
  } catch (error) {
    logger.error("Failed to get reading history from localStorage:", error);
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
    logger.warn("LocalStorage is not available, skipping add operation");
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

    // エントリーのバリデーション
    const validationResult = readingHistoryEntrySchema.safeParse(newEntry);
    if (!validationResult.success) {
      logger.error("Entry validation failed:", validationResult.error);
      throw new Error("入力データが不正です");
    }

    // 同じ本がすでに存在する場合は削除（後で新しいエントリーを追加するため）
    const filteredEntries = entries.filter((e) => e.bookId !== entry.bookId);

    // 新しいエントリーを追加
    const newEntries = [validationResult.data, ...filteredEntries];

    // エントリー配列全体の検証
    const entriesValidation = readingHistorySchema.safeParse(newEntries);
    if (!entriesValidation.success) {
      logger.error("Entries validation failed:", entriesValidation.error);
      throw new Error("履歴データの更新に失敗しました");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entriesValidation.data));
  } catch (error) {
    logger.error("Failed to add reading history to localStorage:", error);
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
    logger.warn("LocalStorage is not available, skipping remove operation");
    return;
  }

  try {
    const entries = getReadingHistory();
    const filteredEntries = entries.filter((entry) => entry.bookId !== bookId);

    // エントリー配列全体の検証
    const entriesValidation = readingHistorySchema.safeParse(filteredEntries);
    if (!entriesValidation.success) {
      logger.error("Entries validation failed:", entriesValidation.error);
      throw new Error("履歴データの更新に失敗しました");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entriesValidation.data));
  } catch (error) {
    logger.error("Failed to remove reading history from localStorage:", error);
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
    logger.warn("LocalStorage is not available, skipping clear operation");
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    // 空の配列で初期化
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (error) {
    logger.error("Failed to clear reading history from localStorage:", error);
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
    logger.warn("LocalStorage is not available, skipping session update");
    return false;
  }

  try {
    const entries = getReadingHistory();
    const bookEntry = entries.find((e) => e.bookId === bookId);

    if (!bookEntry) {
      logger.warn(`Book with ID ${bookId} not found in reading history`);
      return false;
    }

    // セッションを見つける
    const sessionIndex = bookEntry.sessions.findIndex((s) => s.sessionId === sessionId);
    if (sessionIndex === -1) {
      logger.warn(`Session with ID ${sessionId} not found for book ${bookId}`);
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

    // セッションのバリデーション
    const sessionValidation =
      readingHistoryEntrySchema.shape.sessions.element.safeParse(updatedSession);

    if (!sessionValidation.success) {
      logger.error("Session validation failed:", sessionValidation.error);
      return false;
    }

    // 更新されたセッションで配列を更新
    const updatedSessions = [...bookEntry.sessions];
    updatedSessions[sessionIndex] = sessionValidation.data;

    // エントリーを更新
    const updatedEntry = {
      ...bookEntry,
      sessions: updatedSessions,
      // いずれかのセッションが完了している場合はtrueに
      completed: updatedSessions.some((s) => s.completed),
      // 最終アクセス日時を更新（セッション終了時）
      lastReadAt: updates.endedAt || bookEntry.lastReadAt,
    };

    // エントリーのバリデーション
    const entryValidation = readingHistoryEntrySchema.safeParse(updatedEntry);
    if (!entryValidation.success) {
      logger.error("Entry validation failed:", entryValidation.error);
      return false;
    }

    // 既存のエントリーを更新
    const updatedEntries = entries.map((e) => (e.bookId === bookId ? entryValidation.data : e));

    // エントリー配列全体の検証
    const entriesValidation = readingHistorySchema.safeParse(updatedEntries);
    if (!entriesValidation.success) {
      logger.error("Entries validation failed:", entriesValidation.error);
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entriesValidation.data));

    return true;
  } catch (error) {
    logger.error("Failed to update reading session:", error);
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
    logger.warn("LocalStorage is not available, skipping session removal");
    return false;
  }

  try {
    const entries = getReadingHistory();
    const bookEntry = entries.find((e) => e.bookId === bookId);

    if (!bookEntry) {
      logger.warn(`Book with ID ${bookId} not found in reading history`);
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
      logger.warn(`Session with ID ${sessionId} not found for book ${bookId}`);
      return false;
    }

    // エントリーを更新
    const updatedEntry = {
      ...bookEntry,
      sessions: filteredSessions,
      // いずれかのセッションが完了している場合はtrueに
      completed: filteredSessions.some((s) => s.completed),
    };

    // エントリーのバリデーション
    const entryValidation = readingHistoryEntrySchema.safeParse(updatedEntry);
    if (!entryValidation.success) {
      logger.error("Entry validation failed:", entryValidation.error);
      return false;
    }

    // 既存のエントリーを更新
    const updatedEntries = entries.map((e) => (e.bookId === bookId ? entryValidation.data : e));

    // エントリー配列全体の検証
    const entriesValidation = readingHistorySchema.safeParse(updatedEntries);
    if (!entriesValidation.success) {
      logger.error("Entries validation failed:", entriesValidation.error);
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entriesValidation.data));

    return true;
  } catch (error) {
    logger.error("Failed to remove reading session:", error);
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
    logger.warn(`日付が不正です: ${now.toISOString()}, 年を${currentYear}に修正します`);
    now.setFullYear(currentYear);
  }

  return now;
}
