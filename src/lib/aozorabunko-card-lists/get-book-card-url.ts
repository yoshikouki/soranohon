import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

// CSVファイルパスの定数
const CSV_FILE_PATH = path.join(__dirname, "data", "childrens-books-without-copyright.csv");

// レコードの型定義
interface AozoraRecord {
  作品ID: string;
  作品名: string;
  図書カードURL: string;
  [key: string]: string; // その他のプロパティ
}

/**
 * CSVファイルをロードする関数
 * @returns CSVデータのレコード配列、もしくは空配列
 */
function loadCsvData(): AozoraRecord[] {
  // CSVファイルが存在しない場合は空配列を返す
  if (!fs.existsSync(CSV_FILE_PATH)) {
    return [];
  }

  try {
    const csvData = fs.readFileSync(CSV_FILE_PATH, "utf-8");
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      skip_records_with_error: true,
    }) as AozoraRecord[];

    return records;
  } catch (error) {
    // CSVパース時のエラーは安全に処理し、空配列を返す
    return [];
  }
}

/**
 * 青空文庫の図書カードURLをbookIdから取得する
 * @param bookId 本のID（例: "59835_72466"）
 * @returns 図書カードURL（見つからない場合は推測されたURL）
 */
export function getAozoraBunkoCardUrl(bookId: string): string | undefined {
  // bookIdからカード番号部分を抽出（例: "59835_72466" -> "59835"）
  const cardNumber = bookId.split("_")[0];
  if (!cardNumber) return undefined;

  try {
    // CSVデータをロード
    const records = loadCsvData();

    // 作品IDが一致するレコードを検索
    const record = records.find((r) => r.作品ID === cardNumber);

    // レコードが見つかった場合はそのURLを返す
    if (record?.図書カードURL) {
      return record.図書カードURL;
    }
  } catch (error) {
    // エラーは無視して推測URLを使用する
  }

  // CSVレコードが見つからない場合は、カード番号からURLを推測して返す
  return `https://www.aozora.gr.jp/cards/000000/card${cardNumber}.html`;
}
