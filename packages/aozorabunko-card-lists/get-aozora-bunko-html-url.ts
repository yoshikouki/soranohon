import * as path from "path";
import { CsvParser, defaultCsvParser } from "@/lib/csv";
import { defaultFileSystem, FileSystem } from "@/lib/fs";
import { Logger, logger } from "@/lib/logger";
import { loadCsvData } from "./get-book-card-url";

// CSVファイルパスの定数
const CSV_FILE_PATH = path.join(__dirname, "data", "childrens-books-without-copyright.csv");

/**
 * 青空文庫のHTML/XHTMLファイルのURLをbookIdから取得する
 * @param bookId 本のID（例: "59835_72466"）
 * @param fs ファイルシステム
 * @param csvParser CSVパーサー
 * @param logger ロガー
 * @param csvFilePath CSVファイルパス
 * @returns HTML/XHTMLファイルのURL
 * @throws 不正なbookId形式や取得失敗時にエラーをスロー
 */
export function getAozoraBunkoHtmlUrl(
  bookId: string,
  fs: FileSystem = defaultFileSystem,
  csvParser: CsvParser = defaultCsvParser,
  customLogger: Logger = logger,
  csvFilePath: string = CSV_FILE_PATH,
): string {
  // bookIdからカード番号部分を抽出（例: "59835_72466" -> "59835"）
  let cardNumber = bookId.split("_")[0];

  // 有効なカード番号かチェック
  if (!cardNumber) {
    const errorMessage = `不正なbookId形式です: ${bookId}`;
    customLogger.error(errorMessage);
    throw new Error(errorMessage);
  }

  // CSVデータをロード
  const records = loadCsvData(fs, csvParser, customLogger, csvFilePath);

  // 作品IDが一致するレコードを検索
  // CSVでは作品IDが「059521」のように先頭にゼロがついた形式で保存されているため、
  // 検索では両方の可能性を考慮する

  // 1. 完全一致検索
  let record = records.find((r) => r?.作品ID === cardNumber);

  // 2. 完全一致で見つからない場合、末尾一致で検索（ゼロ埋めの場合）
  if (!record) {
    record = records.find((r) => r?.作品ID?.endsWith(cardNumber));
  }

  // 3. それでも見つからない場合、先頭にゼロを付けて検索
  if (!record) {
    const paddedCardNumber = `0${cardNumber}`;
    record = records.find((r) => r?.作品ID === paddedCardNumber);
  }

  // レコードが見つかった場合はHTMLファイルのURLを返す
  if (record?.["XHTML/HTMLファイルURL"]) {
    return record["XHTML/HTMLファイルURL"];
  }

  // HTMLファイルのURLが見つからない場合はエラーをスロー
  const errorMessage = `bookId に対応するHTMLファイルURLが見つかりません: ${bookId}`;
  customLogger.error(errorMessage);
  throw new Error(errorMessage);
}

/**
 * 青空文庫のHTMLファイルパスを取得する
 * HTMLファイルのURLからローカルファイルパスに変換する
 * @param htmlFileUrl HTMLファイルのURL
 * @returns 変換されたローカルファイルパス
 */
export function convertHtmlUrlToFilePath(htmlFileUrl: string): string {
  try {
    const parsedUrl = new URL(htmlFileUrl);
    if (parsedUrl.hostname !== "www.aozora.gr.jp") {
      throw new Error("Only aozora.gr.jp URLs are supported");
    }
    const pathParts = parsedUrl.pathname.split("/");
    if (pathParts.length < 4 || pathParts[1] !== "cards") {
      throw new Error("Unexpected URL format");
    }

    return (
      "/Users/yoshikouki/src/github.com/aozorabunko/aozorabunko/" + pathParts.slice(1).join("/")
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid aozora.gr.jp URL: ${errorMessage}`);
  }
}
