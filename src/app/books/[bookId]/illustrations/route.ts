import { openai } from "@ai-sdk/openai";
import { experimental_generateImage as generateImage } from "ai";
import { books } from "@/books";
import { prompts } from "@/features/illustration-generator/prompts";
import { FilesystemIllustrationRepository } from "@/features/illustration-generator/repository/illustration-repository";
import { FilesystemPlanRepository } from "@/features/illustration-generator/repository/plan-repository";
import { logger } from "@/lib/logger";

const isDevEnvironment = () => {
  return process.env.NODE_ENV === "development";
};

const models = {
  gptImage1: {
    name: "gpt-image-1",
    model: openai.image("gpt-image-1"),
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

  const usingModel = models.gptImage1;
  try {
    const result = await generateImage({
      model: usingModel.model,
      prompt,
      aspectRatio: "1:1",
      providerOptions: {
        openai: {
          quality: "high",
          output_format: "webp",
        },
      },
    });

    if (!result.image.uint8Array) {
      throw new Error("画像の生成に失敗しました");
    }

    const image = result.image.uint8Array;
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

    // OpenAIのAPI制限エラーの場合
    if (error instanceof Error && error.message.includes("rate limit")) {
      return Response.json(
        {
          error: error.message,
          message: "APIレート制限に達しました。しばらく時間をおいて再試行してください。",
        },
        { status: 429 },
      );
    }

    // コンテンツポリシー違反のエラーの場合
    if (error instanceof Error && error.message.toLowerCase().includes("content policy")) {
      return Response.json(
        {
          error: error.message,
          message:
            "生成リクエストがコンテンツポリシーに違反しています。プロンプトを修正してください。",
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        error: (error as Error).message,
        message: "画像生成中にエラーが発生しました",
      },
      { status: 500 },
    );
  }
}
