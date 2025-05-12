import path from "path";
import { filePaths } from "@/lib/file-paths";
import { defaultFileSystem, FileSystem } from "@/lib/fs";

export class IllustrationPlan {
  content: string;

  constructor(content: string = "") {
    this.content = content;
  }

  static async readFileByBookId(
    bookId: string,
    filesystem: FileSystem = defaultFileSystem,
  ): Promise<IllustrationPlan | null> {
    try {
      const mdxPath = filePaths.books.sources.mdx(bookId);
      const directory = path.dirname(mdxPath);
      const planPath = path.join(directory, `${bookId}.plan.md`);

      if (!filesystem.existsSync(planPath)) {
        return null;
      }

      const content = filesystem.readFileSync(planPath, "utf-8");
      return new IllustrationPlan(content);
    } catch (error) {
      console.error(`Failed to read plan file for book ID: ${bookId}`, error);
      return null;
    }
  }

  static existsForBookId(bookId: string, filesystem: FileSystem = defaultFileSystem): boolean {
    try {
      const mdxPath = filePaths.books.sources.mdx(bookId);
      const directory = path.dirname(mdxPath);
      const planPath = path.join(directory, `${bookId}.plan.md`);

      return filesystem.existsSync(planPath);
    } catch (error) {
      console.error(`Failed to check plan file existence for book ID: ${bookId}`, error);
      return false;
    }
  }
}
