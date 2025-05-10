import { FilesystemMdxRepository, MdxRepository } from "../repository/mdx-repository";
import { FilesystemPlanRepository, PlanRepository } from "../repository/plan-repository";
import {
  IllustrationPlan,
  IllustrationPlanRequest,
  IllustrationScene,
} from "../types/illustration-plan";

export class IllustrationPlanService {
  private mdxRepository: MdxRepository;
  private planRepository: PlanRepository;

  constructor(
    mdxRepository = new FilesystemMdxRepository(),
    planRepository = new FilesystemPlanRepository(),
  ) {
    this.mdxRepository = mdxRepository;
    this.planRepository = planRepository;
  }

  /**
   * 挿絵プランを生成する
   * @param request プラン生成リクエスト
   * @returns 生成されたプランとステータスメッセージ
   */
  async generatePlan(
    request: IllustrationPlanRequest,
  ): Promise<{ plan: IllustrationPlan | null; message: string }> {
    try {
      const { bookId, sceneCount = 10 } = request;

      // MDXコンテンツを取得
      const mdxContent = await this.mdxRepository.getMdxContent(bookId);

      if (!mdxContent?.content) {
        return {
          plan: null,
          message: `MDXコンテンツが見つかりませんでした: ${bookId}`,
        };
      }

      // 既存のプランを確認
      const existingPlan = await this.planRepository.getPlan(bookId);
      if (existingPlan) {
        return {
          plan: existingPlan,
          message: `既存の挿絵プランを読み込みました: ${bookId}`,
        };
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

      const plan: IllustrationPlan = {
        bookId,
        scenes: mockScenes,
        createdAt: new Date().toISOString(),
      };

      // 生成したプランを保存
      const success = await this.planRepository.savePlan(bookId, plan);

      if (!success) {
        return {
          plan,
          message: "プランの生成に成功しましたが、保存に失敗しました。",
        };
      }

      return {
        plan,
        message: "挿絵プランを生成し、保存しました。",
      };
    } catch (error) {
      console.error("Failed to generate illustration plan:", error);
      return {
        plan: null,
        message: `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * 挿絵プランを読み込む
   * @param bookId 書籍ID
   * @returns 読み込まれたプランとステータスメッセージ
   */
  async loadPlan(bookId: string): Promise<{ plan: IllustrationPlan | null; message: string }> {
    try {
      const plan = await this.planRepository.getPlan(bookId);

      if (!plan) {
        return {
          plan: null,
          message: `挿絵プランが見つかりませんでした: ${bookId}`,
        };
      }

      return {
        plan,
        message: `挿絵プランを読み込みました: ${bookId}`,
      };
    } catch (error) {
      console.error("Failed to load illustration plan:", error);
      return {
        plan: null,
        message: `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * 挿絵プランを保存する
   * @param plan 保存するプラン
   * @returns 処理結果とステータスメッセージ
   */
  async savePlan(plan: IllustrationPlan): Promise<{ success: boolean; message: string }> {
    try {
      const success = await this.planRepository.savePlan(plan.bookId, plan);

      if (!success) {
        return {
          success: false,
          message: `プランの保存に失敗しました: ${plan.bookId}`,
        };
      }

      return {
        success: true,
        message: `挿絵プランを保存しました: ${plan.bookId}`,
      };
    } catch (error) {
      console.error("Failed to save illustration plan:", error);
      return {
        success: false,
        message: `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
