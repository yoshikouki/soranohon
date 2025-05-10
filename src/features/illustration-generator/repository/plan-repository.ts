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
    return this.fs.join(baseDir, filePaths.books.sources.plan(bookId).replace(/^\//, ""));
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
    try {
      const planFilePath = this.getPlanFilePath(bookId);

      if (!this.fs.existsSync(planFilePath)) {
        return null;
      }

      const planContent = this.fs.readFileSync(planFilePath, "utf8");
      return this.parseMdToPlan(planContent, bookId);
    } catch (error) {
      console.error(`Failed to get plan for book ID ${bookId}:`, error);
      return null;
    }
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
    try {
      const lines = mdContent.split("\n");
      let createdAt = "";
      const scenes: IllustrationPlan["scenes"] = [];

      let currentTitle = "";
      let currentSceneId = "";
      let currentDescription = "";
      let currentMdxStart = 0;
      let currentMdxEnd = 0;

      // 作成日時を抽出
      const createdAtLine = lines.find((line) => line.startsWith("作成日時:"));
      if (createdAtLine) {
        createdAt = createdAtLine.replace("作成日時:", "").trim();
      }

      // シーン情報を抽出
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("## ")) {
          // 前のシーンがあれば追加
          if (currentTitle && currentSceneId) {
            scenes.push({
              sceneId: currentSceneId,
              title: currentTitle,
              description: currentDescription,
              mdxStart: currentMdxStart,
              mdxEnd: currentMdxEnd,
            });
          }

          // 新しいシーン
          currentTitle = line.replace("## ", "").trim();
          currentSceneId = "";
          currentDescription = "";
          currentMdxStart = 0;
          currentMdxEnd = 0;
        } else if (line.includes("**ID**:")) {
          currentSceneId = line.split("**ID**:")[1].trim();
        } else if (line.includes("**説明**:")) {
          currentDescription = line.split("**説明**:")[1].trim();
        } else if (line.includes("**MDX範囲**:")) {
          const range = line.split("**MDX範囲**:")[1].trim();
          const [start, end] = range.split("-").map(Number);
          currentMdxStart = start;
          currentMdxEnd = end;
        }
      }

      // 最後のシーンを追加
      if (currentTitle && currentSceneId) {
        scenes.push({
          sceneId: currentSceneId,
          title: currentTitle,
          description: currentDescription,
          mdxStart: currentMdxStart,
          mdxEnd: currentMdxEnd,
        });
      }

      return {
        bookId,
        scenes,
        createdAt,
      };
    } catch (error) {
      console.error("Failed to parse plan markdown:", error);
      return null;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const planRepository = new FilesystemPlanRepository();
