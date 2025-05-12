import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { books } from "@/books";
import { BookContent } from "@/features/book-content/core";
import { prompts } from "@/features/illustration-generator/prompts";
import { FilesystemPlanRepository } from "@/features/illustration-generator/repository/plan-repository";

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
  try {
    if (!isDevEnvironment()) {
      throw new Error("この機能は開発環境でのみ利用可能です");
    }
    const { bookId } = await params;
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

    const usingModel = models.gemini25Pro;
    const result = streamText({
      model: usingModel.model,
      prompt: illustrationPlanPrompt,
      onFinish: async (result) => {
        console.log(
          `Model Usage: Generate Illustration Plan: ${result.usage} (${usingModel.name})`,
        );
        const planRepository = new FilesystemPlanRepository();
        await planRepository.savePlan(bookId, result.text);
      },
      onError: (error) => {
        console.error("挿絵計画生成エラー:", error);
      },
    });

    // ストリーミングレスポンスを返す
    return result.toDataStreamResponse({
      sendReasoning: true,
    });
  } catch (error) {
    console.error("挿絵計画生成エラー:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
