"use server";

import { IllustrationPlanService } from "../services/illustration-plan-service";
import { IllustrationPlan } from "../types/illustration-plan";

/**
 * 挿絵プランを保存するServer Action
 * @param plan 保存するプラン
 */
export async function saveIllustrationPlan(
  plan: IllustrationPlan,
): Promise<{ success: boolean; message: string }> {
  const service = new IllustrationPlanService();
  return service.savePlan(plan);
}
