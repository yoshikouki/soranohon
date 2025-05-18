import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";
import { readingHistoryEntrySchema, readingHistorySchema } from "./schema";
import { ReadingHistoryEntry, ReadingSession } from "./types";

const STORAGE_KEY = "soranohon:reading-history";

function isStorageAvailable(): boolean {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return false;
  }

  const testKey = "soranohon:storage-test";
  const result = (() => {
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  })();

  if (!result) {
    logger.error("LocalStorage is not available");
  }
  return result;
}

export function getReadingHistory(): ReadingHistoryEntry[] {
  if (!isStorageAvailable()) {
    logger.warn("LocalStorage is not available, returning empty history");
    return [];
  }

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  const parsedData = (() => {
    const parsed = JSON.parse(data);
    return parsed;
  })();

  const validationResult = readingHistorySchema.safeParse(parsedData);

  if (validationResult.success) {
    return validationResult.data.sort((a, b) => {
      const dateA = new Date(a.lastReadAt).getTime();
      const dateB = new Date(b.lastReadAt).getTime();
      return Number.isNaN(dateA) || Number.isNaN(dateB) ? 0 : dateB - dateA;
    });
  }

  if (!Array.isArray(parsedData)) {
    logger.warn("Invalid reading history format, resetting");
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  const migratedEntries: ReadingHistoryEntry[] = parsedData
    .map((entry: unknown) => {
      if (
        !entry ||
        typeof entry !== "object" ||
        // @ts-ignore
        typeof entry.bookId !== "string" ||
        // @ts-ignore
        typeof entry.title !== "string"
      ) {
        return null;
      }

      // @ts-ignore
      if (!entry.sessions) {
        const session: ReadingSession = {
          sessionId: uuidv4(),
          // @ts-ignore
          startedAt: entry.readAt || getCurrentDate().toISOString(),
          // @ts-ignore
          endedAt: entry.lastReadAt || undefined,
          // @ts-ignore
          completed: entry.completed || false,
        };

        const newEntry = {
          // @ts-ignore
          bookId: entry.bookId,
          // @ts-ignore
          title: entry.title,
          // @ts-ignore
          firstReadAt: entry.readAt || getCurrentDate().toISOString(),
          // @ts-ignore
          lastReadAt: entry.lastReadAt || entry.readAt || getCurrentDate().toISOString(),
          // @ts-ignore
          completed: entry.completed || false,
          // @ts-ignore
          coverImage: entry.coverImage,
          sessions: [session],
        };

        const validationResult = readingHistoryEntrySchema.safeParse(newEntry);
        if (validationResult.success) {
          return validationResult.data;
        }
        logger.warn("Migrated entry validation failed:", validationResult.error);
        return null;
      }

      const validationResult = readingHistoryEntrySchema.safeParse(entry);
      if (validationResult.success) {
        return validationResult.data;
      }
      logger.warn("Existing entry validation failed:", validationResult.error);
      return null;
    })
    .filter(Boolean) as ReadingHistoryEntry[];

  if (migratedEntries.length !== parsedData.length) {
    logger.warn("Some reading history entries are invalid, filtering them out");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedEntries));
  }

  return migratedEntries.sort((a, b) => {
    const dateA = new Date(a.lastReadAt).getTime();
    const dateB = new Date(b.lastReadAt).getTime();
    return Number.isNaN(dateA) || Number.isNaN(dateB) ? 0 : dateB - dateA;
  });
}

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

  const entries = getReadingHistory();
  const now = getCurrentDate().toISOString();

  const existingEntry = entries.find((e) => e.bookId === entry.bookId);

  const newSession: ReadingSession = {
    sessionId: uuidv4(),
    startedAt: now,
    completed,
    notes,
    progress,
  };

  const newEntry: ReadingHistoryEntry = existingEntry
    ? {
        ...existingEntry,
        lastReadAt: now,
        completed: completed || existingEntry.completed,
        sessions: [...(existingEntry.sessions || []), newSession],
      }
    : {
        ...entry,
        firstReadAt: now,
        lastReadAt: now,
        completed,
        sessions: [newSession],
      };

  const updatedEntries = existingEntry
    ? entries.map((e) => (e.bookId === entry.bookId ? newEntry : e))
    : [newEntry, ...entries];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
}

export function updateReadingSession(
  bookId: string,
  sessionId: string,
  completed?: boolean,
  notes?: string,
  progress?: number,
): void {
  updateReadingSessionEnd(bookId, sessionId, completed, notes, progress);
}

export function removeReadingSession(bookId: string, sessionId: string): void {
  if (!isStorageAvailable()) {
    logger.warn("LocalStorage is not available, skipping remove operation");
    return;
  }

  const entries = getReadingHistory();
  const entry = entries.find((e) => e.bookId === bookId);

  if (!entry) {
    logger.warn(`No reading entry found for book: ${bookId}`);
    return;
  }

  const filteredSessions = entry.sessions.filter((s) => s.sessionId !== sessionId);

  if (filteredSessions.length === 0) {
    deleteReadingHistoryEntry(bookId);
    return;
  }

  const updatedEntry = {
    ...entry,
    sessions: filteredSessions,
  };

  const updatedEntries = entries.map((e) => (e.bookId === bookId ? updatedEntry : e));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
}

export function removeReadingHistoryEntry(bookId: string): void {
  deleteReadingHistoryEntry(bookId);
}

function updateReadingSessionEnd(
  bookId: string,
  sessionId: string,
  completed?: boolean,
  notes?: string,
  progress?: number,
): void {
  if (!isStorageAvailable()) {
    logger.warn("LocalStorage is not available, skipping update operation");
    return;
  }

  const entries = getReadingHistory();
  const entryIndex = entries.findIndex((e) => e.bookId === bookId);

  if (entryIndex === -1) {
    logger.warn(`No reading entry found for book: ${bookId}`);
    return;
  }

  const entry = entries[entryIndex];
  const sessionIndex = entry.sessions.findIndex((s) => s.sessionId === sessionId);

  if (sessionIndex === -1) {
    logger.warn(`No session found with ID: ${sessionId}`);
    return;
  }

  const now = getCurrentDate().toISOString();
  const updatedSession = {
    ...entry.sessions[sessionIndex],
    endedAt: now,
    ...(completed !== undefined && { completed }),
    ...(notes !== undefined && { notes }),
    ...(progress !== undefined && { progress }),
  };

  const updatedSessions = [...entry.sessions];
  updatedSessions[sessionIndex] = updatedSession;

  const updatedEntry = {
    ...entry,
    lastReadAt: now,
    sessions: updatedSessions,
    completed: updatedSessions.some((s) => s.completed) || entry.completed,
  };

  const updatedEntries = [...entries];
  updatedEntries[entryIndex] = updatedEntry;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
}

export function deleteReadingHistoryEntry(bookId: string): void {
  if (!isStorageAvailable()) {
    logger.warn("LocalStorage is not available, skipping delete operation");
    return;
  }

  const entries = getReadingHistory();
  const filteredEntries = entries.filter((e) => e.bookId !== bookId);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
}

export function clearReadingHistory(): void {
  if (!isStorageAvailable()) {
    logger.warn("LocalStorage is not available, skipping clear operation");
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

export function markAsRead(
  bookId: string,
  title: string,
  coverImage?: string,
  notes?: string,
  progress?: number,
): void {
  if (!isStorageAvailable()) {
    logger.warn("LocalStorage is not available, skipping mark as read operation");
    return;
  }

  const entries = getReadingHistory();
  const now = getCurrentDate().toISOString();

  const existingEntry = entries.find((e) => e.bookId === bookId);

  if (existingEntry) {
    const sessionId = existingEntry.sessions.find((s) => !s.endedAt)?.sessionId;

    if (sessionId) {
      updateReadingSessionEnd(bookId, sessionId, true, notes, progress);
    } else {
      addReadingHistoryEntry({ bookId, title, coverImage }, true, notes, progress);
    }
  } else {
    const newSession: ReadingSession = {
      sessionId: uuidv4(),
      startedAt: now,
      endedAt: now,
      completed: true,
      notes,
      progress,
    };

    const newEntry: ReadingHistoryEntry = {
      bookId,
      title,
      firstReadAt: now,
      lastReadAt: now,
      completed: true,
      sessions: [newSession],
      coverImage,
    };

    const updatedEntries = [newEntry, ...entries];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  }
}

export function getCurrentDate(): Date {
  return new Date();
}
