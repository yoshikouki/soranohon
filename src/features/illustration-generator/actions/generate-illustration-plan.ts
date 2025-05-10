"use server";

import { FilesystemMdxRepository } from "../repository/mdx-repository";
import {
  IllustrationPlan,
  IllustrationPlanRequest,
  IllustrationScene,
} from "../types/illustration-plan";

export async function generateIllustrationPlan(
  request: IllustrationPlanRequest,
): Promise<IllustrationPlan | null> {
  try {
    const { bookId, sceneCount = 10, prompt, stylePreference } = request;

    // MDXコンテンツを取得
    const mdxRepository = new FilesystemMdxRepository();
    const mdxContent = await mdxRepository.getMdxContent(bookId);

    if (!mdxContent?.content) {
      console.error(`MDX content not found for book ID: ${bookId}`);
      return null;
    }

    // ここでは実際の処理は実装せず、モックデータを返す
    // 実際の実装では、MDXコンテンツを解析して適切なシーンを特定する処理を実装する
    const mockScenes: IllustrationScene[] = Array.from({ length: sceneCount }).map(
      (_, index) => ({
        sceneId: `scene-${index + 1}`,
        title: `シーン ${index + 1}`,
        description: `${bookId}の挿絵シーン ${index + 1}の説明`,
        mdxStart: index * 100,
        mdxEnd: (index + 1) * 100 - 1,
      }),
    );

    return {
      bookId,
      scenes: mockScenes,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to generate illustration plan:", error);
    return null;
  }
}
