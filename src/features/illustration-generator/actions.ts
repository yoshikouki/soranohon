"use server";

import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { books } from "@/books";
import { BookContent } from "@/features/book-content/core";
import { prompts } from "./prompts";

const isDevEnvironment = () => {
  return process.env.NODE_ENV === "development";
};

export async function generateIllustrationPlan(bookId: string) {
  if (!isDevEnvironment()) {
    throw new Error("この機能は開発環境でのみ利用可能です");
  }

  const book = books[bookId];
  if (!book) {
    throw new Error(`書籍が見つかりません: ${bookId}`);
  }
  const bookContent = await BookContent.readFileByBookId(bookId);
  const contentWithTags = bookContent.toMdx();
  const illustrationPlanPrompt = prompts.illustrationPlan({
    bookId,
    title: book.title,
    contentWithTags,
  });

  const stream = createStreamableValue("");
  (async () => {
    const { textStream } = streamText({
      model: google("models/gemini-2.5-pro-preview-05-06"),
      prompt: illustrationPlanPrompt,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}
