import * as path from "path";
import { CsvParser, defaultCsvParser } from "@/lib/csv";
import { defaultFileSystem, FileSystem } from "@/lib/fs";
import { defaultLogger, Logger } from "@/lib/logger";

// CSVファイルパスの定数
const CSV_FILE_PATH = path.join(__dirname, "data", "childrens-books-without-copyright.csv");

// レコードの型定義
export interface AozoraRecord {
  作品ID: string;
  作品名: string;
  図書カードURL: string;
  [key: string]: string; // その他のプロパティ
}

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
    // BOMを含むUTF-8ファイルを対応するためのオプション
    const csvData = fs.readFileSync(csvFilePath, "utf-8");

    const records = csvParser.parse<AozoraRecord>(csvData, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      skip_records_with_error: true,
      bom: true, // BOMを検出して適切に処理
    });

    // 無効なレコード（作品IDがないもの）を除外
    const validRecords = records.filter((record) => record?.作品ID);

    if (validRecords.length < records.length) {
      const invalidCount = records.length - validRecords.length;
      logger.error(
        `無効なレコードが${invalidCount}件除外されました（作品IDフィールドがありません）`,
      );
    }

    return validRecords;
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
  // URLから抽出するIDは先頭のゼロがない形式（"59521"）だが、
  // CSVファイルでは先頭にゼロがついている場合がある（"059521"）
  let cardNumber = bookId.split("_")[0];

  // 有効なカード番号かチェック
  if (!cardNumber) {
    const errorMessage = `不正なbookId形式です: ${bookId}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  // CSVデータをロード
  const records = loadCsvData(fs, csvParser, logger, csvFilePath);

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

  // レコードが見つかった場合はそのURLを返す
  if (record?.図書カードURL) {
    return record.図書カードURL;
  }

  // レコードが見つからない場合はエラーをスロー
  const errorMessage = `bookId が図書リストから見つかりません: ${bookId}`;
  logger.error(errorMessage);
  throw new Error(errorMessage);
}
