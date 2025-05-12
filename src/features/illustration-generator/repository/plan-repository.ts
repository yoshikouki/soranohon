import { filePaths } from "@/lib/file-paths";
import { defaultFileSystem, FileSystem } from "@/lib/fs";
import { regex } from "@/lib/regex";
import { IllustrationPlan, IllustrationScene } from "../types";

export interface PlanRepository {
  savePlan(bookId: string, rawPlan: string): Promise<boolean>;
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

  async savePlan(bookId: string, rawPlan: string): Promise<boolean> {
    const planFilePath = this.getPlanFilePath(bookId);
    const illustrationPlanXml = this.extractIllustrationPlanXml(rawPlan);
    this.fs.writeFileSync(planFilePath, illustrationPlanXml);
    return true;
  }

  async getPlan(bookId: string): Promise<IllustrationPlan | null> {
    const planFilePath = this.getPlanFilePath(bookId);
    if (!this.fs.existsSync(planFilePath)) {
      return null;
    }
    try {
      const planContent = this.fs.readFileSync(planFilePath, "utf8");
      return this.parseMdToPlan(planContent, bookId);
    } catch (error) {
      console.error(`getPlan error: ${error}`);
      return null;
    }
  }

  private extractIllustrationPlanXml(rawPlan: string): string {
    const illustrationPlanXml = rawPlan.match(regex.illustrationPlan);
    if (!illustrationPlanXml) {
      console.error(
        `Invalid plan format: <plan>...</plan> not found: ${rawPlan.slice(0, 100)}`,
      );
    }
    return illustrationPlanXml?.[0] || rawPlan;
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
