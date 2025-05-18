import { Book } from "@/books";
import { prompts } from "@/features/illustration-generator/prompts";
import { FilesystemIllustrationRepository } from "@/features/illustration-generator/repository/illustration-repository";
import { IllustrationPlan } from "@/features/illustration-generator/types";
import { generateIllustration } from "./illustration-generator";

export interface CharacterDesignGenerateRequest {
  bookId: string;
  book: Book;
  plan: IllustrationPlan;
}

export async function generateCharacterDesign(
  request: CharacterDesignGenerateRequest,
): Promise<{
  imagePath: string;
  prompt: string;
}> {
  const { bookId, book, plan } = request;

  const prompt = prompts.characterDesign({
    plan: plan,
    book,
  });

  const promptText = prompt.find((p) => p.type === "text")?.text;
  if (!promptText) {
    throw new Error("テキストプロンプトが見つかりません");
  }
  const imageData = await generateIllustration(promptText);

  const illustrationRepository = new FilesystemIllustrationRepository();
  const imagePath = await illustrationRepository.saveIllustration(bookId, imageData, {
    type: "character-design",
  });

  return { imagePath, prompt: promptText };
}
