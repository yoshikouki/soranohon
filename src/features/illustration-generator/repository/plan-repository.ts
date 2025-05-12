import { filePaths } from "@/lib/file-paths";
import { defaultFileSystem, FileSystem } from "@/lib/fs";
import { IllustrationPlan } from "../types/illustration-plan";

export interface PlanRepository {
  savePlan(bookId: string, plan: IllustrationPlan): Promise<boolean>;
  getPlan(bookId: string): Promise<IllustrationPlan | null>;
}

export class FilesystemPlanRepository implements PlanRepository {
  private fs: FileSystem;

  constructor(fs: FileSystem = defaultFileSystem) {
    this.fs = fs;
  }

  private getPlanFilePath(bookId: string): string {
    const baseDir = this.fs.getCwd();
    return this.fs.join(
      baseDir,
      filePaths.books.sources.illustrationPlans(bookId).replace(/^\//, ""),
    );
  }

  async savePlan(bookId: string, plan: IllustrationPlan): Promise<boolean> {
    try {
      const planFilePath = this.getPlanFilePath(bookId);

      // マークダウン形式でプランを作成
      const planContent = this.formatPlanAsMd(plan);

      // ディレクトリが存在することを確認
      const dir = this.fs.dirname(planFilePath);
      if (!this.fs.existsSync(dir)) {
        this.fs.mkdirSync(dir, { recursive: true });
      }

      // ファイルに書き込み
      this.fs.writeFileSync(planFilePath, planContent, "utf8");

      return true;
    } catch (error) {
      console.error(`Failed to save plan for book ID ${bookId}:`, error);
      return false;
    }
  }

  async getPlan(bookId: string): Promise<IllustrationPlan | null> {
    const planFilePath = this.getPlanFilePath(bookId);
    if (!this.fs.existsSync(planFilePath)) {
      return null;
    }

    const planContent = this.fs.readFileSync(planFilePath, "utf8");
    return this.parseMdToPlan(planContent, bookId);
  }

  private formatPlanAsMd(plan: IllustrationPlan): string {
    const header = `# 挿絵プラン: ${plan.bookId}\n\n作成日時: ${plan.createdAt}\n\n`;

    const scenes = plan.scenes
      .map((scene) => {
        return (
          `## ${scene.title}\n\n` +
          `- **ID**: ${scene.sceneId}\n` +
          `- **説明**: ${scene.description}\n` +
          `- **MDX範囲**: ${scene.mdxStart}-${scene.mdxEnd}\n`
        );
      })
      .join("\n\n");

    return header + scenes;
  }

  private parseMdToPlan(mdContent: string, bookId: string): IllustrationPlan | null {
    return {
      rawPlan: mdContent,
      bookId,
      scenes: [],
    };
  }
}

// シングルトンインスタンスをエクスポート
export const planRepository = new FilesystemPlanRepository();
