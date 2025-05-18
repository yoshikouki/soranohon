import { openai } from "@ai-sdk/openai";
import { experimental_generateImage as generateImage } from "ai";
import { books } from "@/books";
import { prompts } from "@/features/illustration-generator/prompts";
import { FilesystemIllustrationRepository } from "@/features/illustration-generator/repository/illustration-repository";
import { FilesystemPlanRepository } from "@/features/illustration-generator/repository/plan-repository";
import { logger } from "@/lib/logger";
import { urls } from "@/lib/paths";

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
  type: "key-visual" | "scene" | "character-design";
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

  const planRepository = new FilesystemPlanRepository();
  const plan = await planRepository.getPlan(bookId);
  if (!plan || !plan.plan) {
    return Response.json({ error: "挿絵計画が見つかりません" }, { status: 404 });
  }

  const illustrationRepository = new FilesystemIllustrationRepository();
  const hasCharacterDesign = illustrationRepository.hasCharacterDesign(bookId);
  const characterDesignUrl = hasCharacterDesign
    ? urls.images.books.characterDesign(bookId)
    : undefined;

  let prompt: Array<
    { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
  >;
  if (data.type === "key-visual") {
    prompt = prompts.keyVisual({
      plan: plan,
      book,
      characterDesignImageUrl: characterDesignUrl,
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

    const hasKeyVisual = illustrationRepository.hasKeyVisual(bookId);
    const keyVisualUrl = hasKeyVisual ? urls.images.books.keyVisual(bookId) : undefined;

    prompt = prompts.scene(scene, plan.plan.plan.style.value, keyVisualUrl, characterDesignUrl);
  } else if (data.type === "character-design") {
    prompt = prompts.characterDesign({
      plan: plan,
      book,
    });
  } else {
    return Response.json({ error: "不明な生成タイプです" }, { status: 400 });
  }

  const usingModel = models.gptImage1;
  logger.info(`Image generation started for book ID: ${bookId}`);

  const promptText = prompt[0].text;

  const result = await generateImage({
    model: usingModel.model,
    prompt: promptText,
    aspectRatio: "1:1",
    providerOptions: {
      openai: {
        quality: "high",
        output_format: "webp",
      },
    },
  });

  if (!result.image.uint8Array) {
    return Response.json({ error: "画像の生成に失敗しました" }, { status: 500 });
  }

  const image = result.image.uint8Array;
  logger.info(`Image generation successful. Preparing to save image for book ID: ${bookId}`);

  const imagePath = await illustrationRepository.saveIllustration(bookId, image, {
    sceneId: data.sceneId,
    type: data.type,
  });

  return Response.json(
    {
      success: true,
      imagePath,
      message: "画像を生成しました",
      prompt: promptText,
    },
    { status: 200 },
  );
}
