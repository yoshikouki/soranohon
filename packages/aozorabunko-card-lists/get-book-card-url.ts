import * as path from "path";
import { CsvParser, defaultCsvParser } from "@/lib/csv";
import { defaultFileSystem, FileSystem } from "@/lib/fs";
import { Logger, logger } from "@/lib/logger";

const CSV_FILE_PATH = path.join(__dirname, "data", "childrens-books-without-copyright.csv");

export interface AozoraRecord {
  作品ID: string;
  作品名: string;
  図書カードURL: string;
  [key: string]: string;
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
  customLogger: Logger = logger,
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
      customLogger.error(
        `無効なレコードが${invalidCount}件除外されました（作品IDフィールドがありません）`,
      );
    }

    return validRecords;
  } catch (error) {
    // CSVパース時のエラーをログに記録し、安全に処理
    const errorMessage = error instanceof Error ? error.message : String(error);
    customLogger.error(`CSVデータの読み込みエラー: ${errorMessage}`);
    return [];
  }
}

export function getAozoraBunkoCardUrl(
  bookId: string,
  fs: FileSystem = defaultFileSystem,
  csvParser: CsvParser = defaultCsvParser,
  customLogger: Logger = logger,
  csvFilePath: string = CSV_FILE_PATH,
): string {
  // bookIdからカード番号部分を抽出（例: "59835_72466" -> "59835"）
  // URLから抽出するIDは先頭のゼロがない形式（"59521"）だが、
  // CSVファイルでは先頭にゼロがついている場合がある（"059521"）
  let cardNumber = bookId.split("_")[0];

  if (!cardNumber) {
    const errorMessage = `不正なbookId形式です: ${bookId}`;
    customLogger.error(errorMessage);
    throw new Error(errorMessage);
  }

  const records = loadCsvData(fs, csvParser, customLogger, csvFilePath);

  let record = records.find((r) => r?.作品ID === cardNumber);

  if (!record) {
    record = records.find((r) => r?.作品ID?.endsWith(cardNumber));
  }

  if (!record) {
    const paddedCardNumber = `0${cardNumber}`;
    record = records.find((r) => r?.作品ID === paddedCardNumber);
  }

  if (record?.図書カードURL) {
    return record.図書カードURL;
  }

  const errorMessage = `bookId が図書リストから見つかりません: ${bookId}`;
  customLogger.error(errorMessage);
  throw new Error(errorMessage);
}
