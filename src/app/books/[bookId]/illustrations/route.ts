import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { books } from "@/books";
import { prompts } from "@/features/illustration-generator/prompts";
import { FilesystemIllustrationRepository } from "@/features/illustration-generator/repository/illustration-repository";
import { FilesystemPlanRepository } from "@/features/illustration-generator/repository/plan-repository";
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
  type: "key-visual" | "scene";
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
  if (!data.type) {
    return Response.json({ error: "生成タイプが指定されていません" }, { status: 400 });
  }

  // 挿絵計画を取得
  const planRepository = new FilesystemPlanRepository();
  const plan = await planRepository.getPlan(bookId);
  if (!plan || !plan.plan) {
    return Response.json({ error: "挿絵計画が見つかりません" }, { status: 404 });
  }

  // プロンプトを生成
  let prompt: string;
  if (data.type === "key-visual") {
    prompt = prompts.keyVisual({
      plan: plan,
      book,
    });
  } else if (data.type === "scene") {
    if (!data.sceneId) {
      return Response.json({ error: "シーンIDが指定されていません" }, { status: 400 });
    }

    const sceneIndex = parseInt(data.sceneId.replace(/[^0-9]/g, ""), 10);
    const scene = plan.plan.plan.scenes.children.find((s) => s.sceneIndex.value === sceneIndex);

    if (!scene) {
      return Response.json({ error: `シーンが見つかりません: ${sceneIndex}` }, { status: 404 });
    }

    prompt = prompts.scene(scene, plan.plan.plan.style.value);
  } else {
    return Response.json({ error: "不明な生成タイプです" }, { status: 400 });
  }

  const usingModel = models.geminiFlash;
  try {
    const result = await generateText({
      model: usingModel.model,
      providerOptions: {
        google: { responseModalities: ["TEXT", "IMAGE"] },
      },
      prompt,
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
        prompt,
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
