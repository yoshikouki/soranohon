import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

// CSVファイルパスの定数
const CSV_FILE_PATH = path.join(__dirname, "data", "childrens-books-without-copyright.csv");

// レコードの型定義
export interface AozoraRecord {
  作品ID: string;
  作品名: string;
  図書カードURL: string;
  [key: string]: string; // その他のプロパティ
}

// ファイルシステム操作の抽象化
export interface FileSystem {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: string): string;
}

// CSVパーサーの抽象化
export interface CsvParser {
  parse(input: string, options: Record<string, unknown>): AozoraRecord[];
}

// デフォルトのファイルシステム実装
export const defaultFileSystem: FileSystem = {
  existsSync: (path: string) => fs.existsSync(path),
  readFileSync: (path: string, encoding: string) => fs.readFileSync(path, encoding),
};

// デフォルトのCSVパーサー実装
export const defaultCsvParser: CsvParser = {
  parse: (input: string, options: Record<string, unknown>) =>
    parse(input, options) as AozoraRecord[],
};

// ロガーの抽象化
export interface Logger {
  error(message: string): void;
}

// デフォルトのロガー実装
export const defaultLogger: Logger = {
  error: (message: string) => console.error(message),
};

/**
 * CSVファイルをロードする関数
 * @param fs ファイルシステム
 * @param csvParser CSVパーサー
 * @param logger ロガー
 * @param csvFilePath CSVファイルパス
 * @returns CSVデータのレコード配列、もしくは空配列
 */
export function loadCsvData(
  fs: FileSystem = defaultFileSystem,
  csvParser: CsvParser = defaultCsvParser,
  logger: Logger = defaultLogger,
  csvFilePath: string = CSV_FILE_PATH,
): AozoraRecord[] {
  // CSVファイルが存在しない場合は空配列を返す
  if (!fs.existsSync(csvFilePath)) {
    return [];
  }

  try {
    const csvData = fs.readFileSync(csvFilePath, "utf-8");
    const records = csvParser.parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      skip_records_with_error: true,
    });

    return records;
  } catch (error) {
    // CSVパース時のエラーをログに記録し、安全に処理
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`CSVデータの読み込みエラー: ${errorMessage}`);
    return [];
  }
}

/**
 * 青空文庫の図書カードURLをbookIdから取得する
 * @param bookId 本のID（例: "59835_72466"）
 * @param fs ファイルシステム
 * @param csvParser CSVパーサー
 * @param logger ロガー
 * @param csvFilePath CSVファイルパス
 * @returns 図書カードURL
 * @throws 不正なbookId形式や取得失敗時にエラーをスロー
 */
export function getAozoraBunkoCardUrl(
  bookId: string,
  fs: FileSystem = defaultFileSystem,
  csvParser: CsvParser = defaultCsvParser,
  logger: Logger = defaultLogger,
  csvFilePath: string = CSV_FILE_PATH,
): string {
  // bookIdからカード番号部分を抽出（例: "59835_72466" -> "59835"）
  const cardNumber = bookId.split("_")[0];

  // 有効なカード番号かチェック
  if (!cardNumber) {
    const errorMessage = `不正なbookId形式です: ${bookId}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  // CSVデータをロード
  const records = loadCsvData(fs, csvParser, logger, csvFilePath);

  // 作品IDが一致するレコードを検索
  const record = records.find((r) => r.作品ID === cardNumber);

  // レコードが見つかった場合はそのURLを返す
  if (record?.図書カードURL) {
    return record.図書カードURL;
  }

  // レコードが見つからない場合はエラーをスロー
  const errorMessage = `bookId が図書リストから見つかりません: ${bookId}`;
  logger.error(errorMessage);
  throw new Error(errorMessage);
}
