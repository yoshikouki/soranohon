import { Book } from "@/books";
import { prompts } from "@/features/illustration-generator/prompts";
import { FilesystemIllustrationRepository } from "@/features/illustration-generator/repository/illustration-repository";
import { IllustrationPlan } from "@/features/illustration-generator/types";
import { urls } from "@/lib/paths";
import { generateIllustration } from "./illustration-generator";

export interface KeyVisualGenerateRequest {
  bookId: string;
  book: Book;
  plan: IllustrationPlan;
}

export async function generateKeyVisual(request: KeyVisualGenerateRequest): Promise<{
  imagePath: string;
  prompt: string;
}> {
  const { bookId, book, plan } = request;

  const illustrationRepository = new FilesystemIllustrationRepository();
  const hasCharacterDesign = illustrationRepository.hasCharacterDesign(bookId);
  const characterDesignUrl = hasCharacterDesign
    ? urls.images.books.characterDesign(bookId)
    : undefined;

  const prompt = prompts.keyVisual({
    plan: plan,
    book,
    characterDesignImageUrl: characterDesignUrl,
  });

  const promptText = prompt.find((p) => p.type === "text")?.text;
  if (!promptText) {
    throw new Error("テキストプロンプトが見つかりません");
  }
  const imageData = await generateIllustration(promptText);

  const imagePath = await illustrationRepository.saveIllustration(bookId, imageData, {
    type: "key-visual",
  });

  return { imagePath, prompt: promptText };
}
