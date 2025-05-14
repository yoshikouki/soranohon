import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { books } from "@/books";
import { FilesystemIllustrationRepository } from "@/features/illustration-generator/repository/illustration-repository";
import { logger } from "@/lib/logger";

const isDevEnvironment = () => {
  return process.env.NODE_ENV === "development";
};

const models = {
  geminiFlash: {
    name: "gemini-2.0-flash-preview-image-generation",
    model: google("gemini-2.0-flash-preview-image-generation"),
  },
};

interface IllustrationRequest {
  prompt: string;
  sceneId?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  if (!isDevEnvironment()) {
    return Response.json({ error: "この機能は開発環境でのみ利用可能です" }, { status: 403 });
  }
  const { bookId } = await params;
  const book = books[bookId];
  if (!book) {
    return Response.json({ error: `書籍が見つかりません: ${bookId}` }, { status: 404 });
  }
  const data = (await request.json()) as IllustrationRequest;
  if (!data.prompt) {
    return Response.json({ error: "プロンプトが指定されていません" }, { status: 400 });
  }
  const usingModel = models.geminiFlash;
  try {
    const result = await generateText({
      model: usingModel.model,
      providerOptions: {
        google: { responseModalities: ["TEXT", "IMAGE"] },
      },
      prompt: data.prompt,
    });

    let image: Uint8Array | null = null;
    for (const file of result.files) {
      if (file.mimeType.startsWith("image/")) {
        image = file.uint8Array;
        break;
      }
    }
    if (!image) {
      throw new Error("画像の生成に失敗しました");
    }
    logger.info(`Image generation successful. Preparing to save image for book ID: ${bookId}`);

    const repository = new FilesystemIllustrationRepository();
    const imagePath = await repository.saveIllustration(bookId, image, {
      sceneId: data.sceneId,
    });

    return Response.json(
      {
        success: true,
        imagePath,
        message: "画像を生成しました",
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("挿絵生成エラー:", error);
    return Response.json(
      {
        error: (error as Error).message,
        message: "画像生成中にエラーが発生しました",
      },
      { status: 500 },
    );
  }
}
