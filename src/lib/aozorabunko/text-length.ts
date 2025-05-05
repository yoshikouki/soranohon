/**
 * 青空文庫のテキストファイルからテキスト長を取得するユーティリティ
 */

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface AozoraBunkoBook {
  id: string;
  authorId: string;
  textUrl?: string;
  htmlUrl?: string;
}

/**
 * 青空文庫の書籍IDからファイルパスを生成する
 * @param authorId 著者ID
 * @param bookId 書籍ID
 * @param aozoraRoot 青空文庫のルートディレクトリ（デフォルト: /Users/yoshikouki/src/github.com/aozorabunko/aozorabunko）
 * @returns ファイルパスの配列（ZIP、HTMLファイル）
 */
export function getAozoraFilePaths(
  authorId: string,
  bookId: string,
  aozoraRoot = "/Users/yoshikouki/src/github.com/aozorabunko/aozorabunko",
): { zipPaths: string[]; htmlPaths: string[] } {
  const authorDir = path.join(aozoraRoot, "cards", authorId);
  const filesDir = path.join(authorDir, "files");

  // ディレクトリが存在しない場合は空配列を返す
  if (!fs.existsSync(filesDir)) {
    return { zipPaths: [], htmlPaths: [] };
  }

  try {
    const files = fs.readdirSync(filesDir);

    // bookIdに一致するZIPファイルを検索
    const zipPaths = files
      .filter((file) => file.startsWith(`${bookId}_`) && file.endsWith(".zip"))
      .map((file) => path.join(filesDir, file));

    // bookIdに一致するHTMLファイルを検索
    const htmlPaths = files
      .filter((file) => file.startsWith(`${bookId}_`) && file.endsWith(".html"))
      .map((file) => path.join(filesDir, file));

    return { zipPaths, htmlPaths };
  } catch (error) {
    console.error(`Error getting file paths for author ${authorId}, book ${bookId}:`, error);
    return { zipPaths: [], htmlPaths: [] };
  }
}

/**
 * ZIPファイルからテキストのサイズを取得する
 * @param zipPath ZIPファイルのパス
 * @returns テキストのサイズ（バイト数）
 */
export async function getTextSizeFromZip(zipPath: string): Promise<number | undefined> {
  try {
    const { stdout } = await execAsync(`unzip -l "${zipPath}"`);

    // 行ごとに分割して、合計サイズを抽出
    const lines = stdout.split("\n");

    // ファイルサイズが記載されている行を見つける
    // フォーマット: [サイズ] [日付] [時間] [ファイル名]
    for (const line of lines) {
      const match = line.trim().match(/^\s*(\d+)\s+[\d-]+\s+[\d:]+\s+.+\.txt$/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return undefined;
  } catch (error) {
    console.error(`Error getting text size from ZIP ${zipPath}:`, error);
    return undefined;
  }
}

/**
 * HTMLファイルからテキストサイズを見積もる
 * @param htmlPath HTMLファイルのパス
 * @returns テキストの推定サイズ（バイト数）
 */
export function getEstimatedTextSizeFromHtml(htmlPath: string): number | undefined {
  try {
    const content = fs.readFileSync(htmlPath, "utf-8");

    // HTMLタグを削除し、本文のみを抽出
    const textOnly = content
      .replace(/<[^>]+>/g, "") // HTMLタグを削除
      .replace(/&[^;]+;/g, "x") // HTMLエンティティを1文字として置換
      .replace(/\s+/g, " "); // 連続する空白を1つにまとめる

    // 推定サイズを返す
    return textOnly.length;
  } catch (error) {
    console.error(`Error getting text size from HTML ${htmlPath}:`, error);
    return undefined;
  }
}

/**
 * 青空文庫の書籍情報からテキストサイズを取得する
 * @param book 書籍情報
 * @param aozoraRoot 青空文庫のルートディレクトリ
 * @returns テキストサイズ（バイト数）
 */
export async function getTextLength(
  book: AozoraBunkoBook,
  aozoraRoot = "/Users/yoshikouki/src/github.com/aozorabunko/aozorabunko",
): Promise<number | undefined> {
  const { zipPaths, htmlPaths } = getAozoraFilePaths(book.authorId, book.id, aozoraRoot);

  // ZIPファイルからサイズを取得
  if (zipPaths.length > 0) {
    // 最新のZIPファイルを使用
    const rubyZipFile = zipPaths.find((p) => p.includes("ruby"));
    const zipPath = rubyZipFile || zipPaths[0];
    const size = await getTextSizeFromZip(zipPath);
    if (size) return size;
  }

  // ZIPからサイズが取得できなかった場合はHTMLから推定
  if (htmlPaths.length > 0) {
    return getEstimatedTextSizeFromHtml(htmlPaths[0]);
  }

  return undefined;
}

/**
 * 書籍リストに一括でテキストサイズを追加する
 * @param books 書籍リスト
 * @param aozoraRoot 青空文庫のルートディレクトリ
 * @returns テキストサイズ情報が追加された書籍リスト
 */
export async function addTextLengthToBooks<T extends AozoraBunkoBook>(
  books: T[],
  aozoraRoot = "/Users/yoshikouki/src/github.com/aozorabunko/aozorabunko",
): Promise<(T & { textLength?: number })[]> {
  const result: (T & { textLength?: number })[] = [];

  for (const book of books) {
    const textLength = await getTextLength(book, aozoraRoot);
    result.push({ ...book, textLength });
  }

  return result;
}
