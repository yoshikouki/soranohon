import { ReadingHistoryEntry } from "./types";

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
      const entries = JSON.parse(data) as ReadingHistoryEntry[];
      // 配列でない場合は初期化
      if (!Array.isArray(entries)) {
        console.warn("Invalid reading history format, resetting");
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
      }

      // エントリーの形式を検証
      const validEntries = entries.filter((entry) => {
        return (
          entry &&
          typeof entry === "object" &&
          typeof entry.bookId === "string" &&
          typeof entry.title === "string" &&
          typeof entry.readAt === "string"
        );
      });

      // 形式不正なエントリーがあった場合は修正したデータで上書き
      if (validEntries.length !== entries.length) {
        console.warn("Some reading history entries are invalid, filtering them out");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validEntries));
      }

      // 読んだ日時の新しい順にソート
      return validEntries.sort((a, b) => {
        const dateA = new Date(a.readAt).getTime();
        const dateB = new Date(b.readAt).getTime();
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
 */
export function addReadingHistoryEntry(
  entry: Omit<ReadingHistoryEntry, "lastReadAt" | "completed">,
  completed = false,
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

    // 新しいエントリーを作成
    const newEntry: ReadingHistoryEntry = {
      ...entry,
      // 既存エントリーがある場合はそのreadAtを使用、なければ現在時刻
      readAt: existingEntry?.readAt || now,
      // 最終アクセス時刻は常に更新
      lastReadAt: now,
      // 既存エントリーのcompletedを引き継ぐか、completedパラメータを使用
      completed: existingEntry?.completed || completed,
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
