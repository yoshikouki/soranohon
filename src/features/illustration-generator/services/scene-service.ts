import { prompts } from "@/features/illustration-generator/prompts";
import { FilesystemIllustrationRepository } from "@/features/illustration-generator/repository/illustration-repository";
import { IllustrationPlan } from "@/features/illustration-generator/types";
import { urls } from "@/lib/paths";
import { generateIllustration } from "./illustration-generator";

export interface SceneGenerateRequest {
  bookId: string;
  plan: IllustrationPlan;
  sceneId: string;
}

export async function generateScene(request: SceneGenerateRequest): Promise<{
  imagePath: string;
  prompt: string;
}> {
  const { bookId, plan, sceneId } = request;

  const sceneIndex = parseInt(sceneId.replace(/[^0-9]/g, ""), 10);

  if (!plan.plan) {
    throw new Error("插絵計画が完成していません");
  }

  const scene = plan.plan.scenes.find((s) => s.index === sceneIndex);

  if (!scene) {
    throw new Error(`シーンが見つかりません: ${sceneIndex}`);
  }

  const illustrationRepository = new FilesystemIllustrationRepository();
  const hasKeyVisual = illustrationRepository.hasKeyVisual(bookId);
  const keyVisualUrl = hasKeyVisual ? urls.images.books.keyVisual(bookId) : undefined;

  const hasCharacterDesign = illustrationRepository.hasCharacterDesign(bookId);
  const characterDesignUrl = hasCharacterDesign
    ? urls.images.books.characterDesign(bookId)
    : undefined;

  const prompt = prompts.scene(scene, plan.plan.style, keyVisualUrl, characterDesignUrl);
  const promptText = prompt.find((p) => p.type === "text")?.text;
  if (!promptText) {
    throw new Error("テキストプロンプトが見つかりません");
  }
  const imageData = await generateIllustration(promptText);

  const imagePath = await illustrationRepository.saveIllustration(bookId, imageData, {
    sceneId,
    type: "scene",
  });

  return { imagePath, prompt: promptText };
}
