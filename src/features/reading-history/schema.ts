import { z } from "zod";

/**
 * 読書セッションのZodスキーマ
 */
export const readingSessionSchema = z.object({
  sessionId: z.string().uuid(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  completed: z.boolean(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

/**
 * 読書履歴エントリーのZodスキーマ
 */
export const readingHistoryEntrySchema = z.object({
  bookId: z.string(),
  title: z.string(),
  firstReadAt: z.string().datetime(),
  lastReadAt: z.string().datetime(),
  completed: z.boolean(),
  coverImage: z.string().optional(),
  sessions: z.array(readingSessionSchema),
});

/**
 * 読書履歴全体のZodスキーマ
 */
export const readingHistorySchema = z.array(readingHistoryEntrySchema);

/**
 * Zod型からTypeScript型を抽出
 */
export type ReadingSession = z.infer<typeof readingSessionSchema>;
export type ReadingHistoryEntry = z.infer<typeof readingHistoryEntrySchema>;
