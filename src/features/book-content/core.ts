import { filePaths } from "@/lib/file-paths";
import { defaultFileSystem, FileSystem } from "@/lib/fs";
import { regex } from "@/lib/regex";

export class BookContent {
  contents: string[] = [];

  constructor(content?: string) {
    this.contents = content ? content.split("\n\n") : [];
  }

  toMdx(_contents = this.contents): string {
    return _contents.join("\n\n");
  }

  toStringWithoutTags(): string {
    const _contents = this.contents.map((content) =>
      content.replace(regex.html.ruby.captureBase, "$1").replace(regex.html.allTags, ""),
    );
    return _contents.join("\n\n");
  }

  addParagraph(paragraph: string) {
    this.contents.push(paragraph);
  }

  static read = async (func: () => Promise<string>) => {
    const content = await func();
    return new BookContent(content);
  };

  static readFile = async (filePath: string, fs: FileSystem = defaultFileSystem) => {
    const content = fs.readFileSync(filePath, "utf-8");
    return new BookContent(content);
  };

  static readFileByBookId = async (bookId: string, fs: FileSystem = defaultFileSystem) => {
    const filePath = filePaths.books.sources.mdx(bookId);
    return this.readFile(filePath, fs);
  };
}
