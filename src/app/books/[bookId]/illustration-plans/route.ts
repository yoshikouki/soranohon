import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { books } from "@/books";
import { BookContent } from "@/features/book-content/core";
import { prompts } from "@/features/illustration-generator/prompts";
import { FilesystemPlanRepository } from "@/features/illustration-generator/repository/plan-repository";
import { logger } from "@/lib/logger";

const isDevEnvironment = () => {
  return process.env.NODE_ENV === "development";
};

const models = {
  gemini25Pro: {
    name: "gemini-2.5-pro-preview-05-06",
    model: google("models/gemini-2.5-pro-preview-05-06"),
  },
};

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  if (!isDevEnvironment()) {
    return new Response(JSON.stringify({ error: "この機能は開発環境でのみ利用可能です" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { bookId } = await params;
  const book = books[bookId];
  if (!book) {
    return new Response(JSON.stringify({ error: `書籍が見つかりません: ${bookId}` }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const bookContent = await BookContent.readFileByBookId(bookId);
  const contentWithTags = bookContent.toMdx();
  const illustrationPlanPrompt = prompts.illustrationPlan({
    bookId,
    title: book.title,
    contentWithTags,
  });

  const usingModel = models.gemini25Pro;
  const result = streamText({
    model: usingModel.model,
    prompt: illustrationPlanPrompt,
    onFinish: async (result) => {
      logger.info(
        `Model Usage: Generate Illustration Plan: ${result.usage} (${usingModel.name})`,
      );
      const planRepository = new FilesystemPlanRepository();
      await planRepository.savePlan(bookId, result.text);
    },
    onError: (error) => {
      logger.error("挿絵計画生成エラー:", error);
    },
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
  });
}
