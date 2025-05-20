/**
 * パス変換や URL → ファイルパス変換
 */

import * as path from "path";

/**
 * 入力HTMLパスから src/books/<basename>.mdx を返す
 */
export function getMdxOutputPath(inputHtmlPath: string): string {
  const basename = path.basename(inputHtmlPath, path.extname(inputHtmlPath));
  return path.join("src/books", basename + ".mdx");
}

/**
 * パス変換や URL → ファイルパス変換
 */
/**
 * URL を MDX 出力パス (src/books/<basename>.mdx) に変換
 */
export function convertUrlToFilePath(url: string): string {
  // クエリパラメータやハッシュを除去
  const pathPart = url.split(/[?#]/)[0];
  return getMdxOutputPath(pathPart);
}
