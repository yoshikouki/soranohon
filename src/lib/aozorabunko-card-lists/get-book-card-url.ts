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
 */
function loadCsvData(): AozoraRecord[] {
  if (!fs.existsSync(CSV_FILE_PATH)) {
    throw new Error(`CSVファイルが見つかりません: ${CSV_FILE_PATH}`);
  }

  const csvData = fs.readFileSync(CSV_FILE_PATH, "utf-8");
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    skip_records_with_error: true,
  }) as AozoraRecord[];

  return records;
}

/**
 * 青空文庫の図書カードURLをbookIdから取得する
 * @param bookId 本のID（例: "59835_72466"）
 * @returns 図書カードURL（見つからない場合はundefined）
 */
export function getAozoraBunkoCardUrl(bookId: string): string | undefined {
  try {
    // bookIdからカード番号部分を抽出（例: "59835_72466" -> "59835"）
    const cardNumber = bookId.split("_")[0];
    if (!cardNumber) return undefined;

    // CSVデータをロード
    const records = loadCsvData();

    // 作品IDが一致するレコードを検索
    const record = records.find((r) => r.作品ID === cardNumber);

    return record?.図書カードURL;
  } catch (error) {
    console.error("図書カードURL取得エラー:", error);

    // CSVがない場合や他のエラーの場合、カード番号からURLを推測して返す
    const cardNumber = bookId.split("_")[0];
    if (cardNumber) {
      // 作者IDは不明なので仮のパターンを返す
      return `https://www.aozora.gr.jp/cards/000000/card${cardNumber}.html`;
    }

    return undefined;
  }
}
