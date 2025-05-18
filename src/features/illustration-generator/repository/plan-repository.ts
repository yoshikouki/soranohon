import { filePaths } from "@/lib/file-paths";
import { defaultFileSystem, FileSystem } from "@/lib/fs";
import { logger } from "@/lib/logger";
import { IllustrationPlan, IllustrationPlanJSON } from "../types";

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
    this.fs.writeFileSync(planFilePath, rawPlan);
    return true;
  }

  async getPlan(bookId: string): Promise<IllustrationPlan | null> {
    const planFilePath = this.getPlanFilePath(bookId);
    if (!this.fs.existsSync(planFilePath)) {
      return null;
    }
    const planContent = this.fs.readFileSync(planFilePath, "utf8");
    let parsedPlan: IllustrationPlanJSON | null = null;
    try {
      parsedPlan = JSON.parse(planContent);
    } catch (error) {
      logger.error("プランのJSONパースに失敗しました:", error);
      return null;
    }
    return {
      bookId,
      rawPlan: planContent,
      plan: parsedPlan,
    };
  }
}
