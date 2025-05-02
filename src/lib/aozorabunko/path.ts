import * as path from "path";

/**
 * 入力HTMLパスから src/books/<basename>.mdx を返す
 */
export function getMdxOutputPath(inputHtmlPath: string): string {
  const basename = path.basename(inputHtmlPath, path.extname(inputHtmlPath));
  return path.join("src/books", basename + ".mdx");
}
