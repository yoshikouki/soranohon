import { openai } from "@ai-sdk/openai";
import { experimental_generateImage as generateImage } from "ai";
import { logger } from "@/lib/logger";

export interface IllustrationGeneratorConfig {
  model: string;
  aspectRatio: "1:1" | "16:9" | "9:16";
  quality: "low" | "medium" | "high";
}

const defaultConfig: IllustrationGeneratorConfig = {
  model: "gpt-image-1",
  aspectRatio: "1:1",
  quality: "high",
};

export async function generateIllustration(
  prompt: string,
  config: Partial<IllustrationGeneratorConfig> = {},
): Promise<Uint8Array> {
  const finalConfig = { ...defaultConfig, ...config };
  const model = openai.image(finalConfig.model);

  logger.info(`Image generation started with model: ${finalConfig.model}`);

  const result = await generateImage({
    model: model,
    prompt: prompt,
    aspectRatio: finalConfig.aspectRatio,
    providerOptions: {
      openai: {
        quality: finalConfig.quality,
        output_format: "webp",
      },
    },
  });

  if (!result.image.uint8Array) {
    throw new Error("画像の生成に失敗しました");
  }

  logger.info("Image generation successful");
  return result.image.uint8Array;
}
