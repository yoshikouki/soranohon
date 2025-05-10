"use server";

import { IllustrationPlanService } from "../services/illustration-plan-service";
import { IllustrationPlan } from "../types/illustration-plan";

/**
 * 挿絵プランを読み込むServer Action
 * @param bookId 書籍ID
 */
export async function loadIllustrationPlan(
  bookId: string,
): Promise<{ plan: IllustrationPlan | null; message: string }> {
  const service = new IllustrationPlanService();
  return service.loadPlan(bookId);
}
