import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";
import {
  type ReadingHistoryEntry,
  type ReadingSession,
  readingHistoryEntrySchema,
} from "./schema";

const STORAGE_KEY = "reading-history";

export function getCurrentDate() {
  return new Date();
}

export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    logger.warn("localStorage is not available");
    return false;
  }
}

export function getReadingHistory(): ReadingHistoryEntry[] {
  if (!isStorageAvailable()) {
    logger.warn("LocalStorage is not available");
    return [];
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }

    const parsedData = JSON.parse(data);
    if (!Array.isArray(parsedData)) {
      logger.warn("Reading history is not an array, returning empty");
      return [];
    }

    const filteredData = parsedData.filter(
      (item) => item !== null && item !== undefined && typeof item === "object",
    );

    if (filteredData.length !== parsedData.length) {
      logger.warn("Filtered out invalid reading history entries");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
    }

    return migrateReadingHistory(filteredData);
  } catch (error) {
    logger.error("Failed to parse reading history", { error });
    return [];
  }
}

function migrateReadingHistory(data: unknown[]): ReadingHistoryEntry[] {
  const migratedEntries = data
    .map((entry: unknown) => {
      if (
        !entry ||
        typeof entry !== "object" ||
        typeof entry.bookId !== "string" ||
        typeof entry.title !== "string"
      ) {
        return null;
      }

      if (!entry.sessions) {
        const session: ReadingSession = {
          sessionId: uuidv4(),
          startedAt: entry.readAt || getCurrentDate().toISOString(),
          endedAt: entry.lastReadAt || undefined,
          completed: entry.completed || false,
        };

        const newEntry = {
          bookId: entry.bookId,
          title: entry.title,
          firstReadAt: entry.readAt || getCurrentDate().toISOString(),
          lastReadAt: entry.lastReadAt || entry.readAt || getCurrentDate().toISOString(),
          completed: entry.completed || false,
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

  const filteredEntries = entries.filter((e) => e.bookId !== entry.bookId);
  const updatedEntries = [newEntry, ...filteredEntries];

  const limitedEntries = updatedEntries.slice(0, 20);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedEntries));
}

export function updateReadingHistoryEntry(entry: ReadingHistoryEntry): void {
  if (!isStorageAvailable()) {
    logger.warn("LocalStorage is not available, skipping update operation");
    return;
  }

  const entries = getReadingHistory();
  const updatedEntries = entries.map((e) => (e.bookId === entry.bookId ? entry : e));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
}

export function removeReadingHistoryEntry(bookId: string): void {
  if (!isStorageAvailable()) {
    logger.warn("LocalStorage is not available, skipping remove operation");
    return;
  }

  const entries = getReadingHistory();
  const filteredEntries = entries.filter((e) => e.bookId !== bookId);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
}

export function endReadingSession(
  bookId: string,
  sessionId: string,
  completed = false,
  notes?: string,
  progress?: number,
): void {
  if (!isStorageAvailable()) {
    logger.warn("LocalStorage is not available, skipping end session operation");
    return;
  }

  const entries = getReadingHistory();
  const now = getCurrentDate().toISOString();

  const updatedEntries = entries.map((entry) => {
    if (entry.bookId !== bookId) {
      return entry;
    }

    const updatedSessions = entry.sessions.map((session) => {
      if (session.sessionId !== sessionId) {
        return session;
      }

      return {
        ...session,
        endedAt: now,
        completed,
        notes,
        progress,
      };
    });

    return {
      ...entry,
      lastReadAt: now,
      completed: completed || entry.completed,
      sessions: updatedSessions,
    };
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
}

export function clearReadingHistory(): void {
  if (!isStorageAvailable()) {
    logger.warn("LocalStorage is not available, skipping clear operation");
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}