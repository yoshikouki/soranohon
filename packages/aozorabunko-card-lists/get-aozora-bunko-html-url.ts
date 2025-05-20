import * as path from "path";
import { CsvParser, defaultCsvParser } from "@/lib/csv";
import { defaultFileSystem, FileSystem } from "@/lib/fs";
import { Logger, logger } from "@/lib/logger";
import { loadCsvData } from "./get-book-card-url";

const CSV_FILE_PATH = path.join(__dirname, "data", "childrens-books-without-copyright.csv");

export function getAozoraBunkoHtmlUrl(
  bookId: string,
  fs: FileSystem = defaultFileSystem,
  csvParser: CsvParser = defaultCsvParser,
  customLogger: Logger = logger,
  csvFilePath: string = CSV_FILE_PATH,
): string {
  // bookIdからカード番号部分を抽出（例: "59835_72466" -> "59835"）
  let cardNumber = bookId.split("_")[0];

  if (!cardNumber) {
    const errorMessage = `不正なbookId形式です: ${bookId}`;
    customLogger.error(errorMessage);
    throw new Error(errorMessage);
  }

  const records = loadCsvData(fs, csvParser, customLogger, csvFilePath);

  // CSVでは作品IDが「059521」のように先頭にゼロがついた形式で保存されているため、
  // 検索では両方の可能性を考慮する

  let record = records.find((r) => r?.作品ID === cardNumber);

  if (!record) {
    record = records.find((r) => r?.作品ID?.endsWith(cardNumber));
  }

  if (!record) {
    const paddedCardNumber = `0${cardNumber}`;
    record = records.find((r) => r?.作品ID === paddedCardNumber);
  }

  if (record?.["XHTML/HTMLファイルURL"]) {
    return record["XHTML/HTMLファイルURL"];
  }

  const errorMessage = `bookId に対応するHTMLファイルURLが見つかりません: ${bookId}`;
  customLogger.error(errorMessage);
  throw new Error(errorMessage);
}

export function convertHtmlUrlToFilePath(htmlFileUrl: string): string {
  const parsedUrl = new URL(htmlFileUrl);
  if (parsedUrl.hostname !== "www.aozora.gr.jp") {
    throw new Error("Only aozora.gr.jp URLs are supported");
  }
  const pathParts = parsedUrl.pathname.split("/");
  if (pathParts.length < 4 || pathParts[1] !== "cards") {
    throw new Error("Unexpected URL format");
  }

  const basePath =
    process.env.AOZORA_PATH ||
    "/Users/yoshikouki/src/github.com/aozorabunko/aozorabunko";
  return path.join(basePath, ...pathParts.slice(1));
}
