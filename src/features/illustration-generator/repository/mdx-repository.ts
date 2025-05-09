import { books } from "@/books";

export type MdxContent = {
  content: string | undefined;
};

export interface MdxRepository {
  getMdxContent(bookId: string): Promise<MdxContent | null>;
}

export class FilesystemMdxRepository implements MdxRepository {
  async getMdxContent(bookId: string): Promise<MdxContent | null> {
    const book = books[bookId as keyof typeof books];
    if (!book?.mdx) {
      console.error(`Invalid book data for ID: ${bookId}`);
      return null;
    }

    // ファイルパスを構築
    const filePath = `/src/books/${bookId}.mdx`;

    // ファイルの内容を直接読み込む
    try {
      // Node.jsの環境でファイルを読み込む
      // 注: Next.jsのサーバーコンポーネントでのみ動作します
      const fs = require("fs");
      const path = require("path");
      const processCwd = process.cwd();
      const fullPath = path.join(processCwd, filePath);

      // ファイルの内容を直接読み込む
      const rawContent = fs.readFileSync(fullPath, "utf8");

      return {
        content: rawContent,
      };
    } catch (fsError) {
      console.error(`Error reading MDX file directly: ${fsError}`);

      return null;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const mdxRepository = new FilesystemMdxRepository();
