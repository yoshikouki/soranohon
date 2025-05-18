import { MDXBook } from "@/features/book-content/core";
import { prompts } from "@/features/illustration-generator/prompts";
import { FilesystemIllustrationRepository } from "@/features/illustration-generator/repository/illustration-repository";
import { Plan } from "@/features/illustration-generator/types";
import { generateIllustration } from "./illustration-generator";

export interface CharacterDesignGenerateRequest {
  bookId: string;
  book: MDXBook;
  plan: Plan;
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

  const promptText = prompt[0].text;
  const imageData = await generateIllustration(promptText);

  const illustrationRepository = new FilesystemIllustrationRepository();
  const imagePath = await illustrationRepository.saveIllustration(bookId, imageData, {
    type: "character-design",
  });

  return { imagePath, prompt: promptText };
}
