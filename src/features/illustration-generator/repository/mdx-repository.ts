import { books } from "@/books";
import { filePaths } from "@/lib/file-paths";
import { defaultFileSystem, FileSystem } from "@/lib/fs";

export type MdxContent = {
  content: string | undefined;
};

export interface MdxRepository {
  getMdxContent(bookId: string): Promise<MdxContent | null>;
}

export class FilesystemMdxRepository implements MdxRepository {
  private fs: FileSystem;

  constructor(fs: FileSystem = defaultFileSystem) {
    this.fs = fs;
  }

  async getMdxContent(bookId: string): Promise<MdxContent | null> {
    const book = books[bookId as keyof typeof books];
    if (!book?.mdx) {
      console.error(`Invalid book data for ID: ${bookId}`);
      return null;
    }

    // ファイルパスを構築
    const filePath = filePaths.books.sources.mdx(bookId);

    // ファイルの内容を直接読み込む
    try {
      // フルパスを構築
      const baseDir = this.fs.getCwd();
      const fullPath = this.fs.join(baseDir, filePath.replace(/^\//, ""));

      // ファイルが存在するか確認
      if (!this.fs.existsSync(fullPath)) {
        console.error(`MDX file does not exist at path: ${fullPath}`);
        return null;
      }

      // ファイルの内容を直接読み込む
      const rawContent = this.fs.readFileSync(fullPath, "utf8");

      return {
        content: rawContent,
      };
    } catch (error) {
      console.error(`Error reading MDX file directly: ${error}`);
      return null;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const mdxRepository = new FilesystemMdxRepository();
