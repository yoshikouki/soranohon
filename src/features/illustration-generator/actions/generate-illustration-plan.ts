"use server";

import { IllustrationPlanService } from "../services/illustration-plan-service";
import { IllustrationPlan, IllustrationPlanRequest } from "../types/illustration-plan";

/**
 * 挿絵プランを生成するServer Action
 * @param request プラン生成リクエスト
 */
export async function generateIllustrationPlan(
  request: IllustrationPlanRequest,
): Promise<{ plan: IllustrationPlan | null; message: string }> {
  const service = new IllustrationPlanService();
  return service.generatePlan(request);
}
