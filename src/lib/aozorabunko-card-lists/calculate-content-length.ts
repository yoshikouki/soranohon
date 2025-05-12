import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";
import * as path from "path";
import { decode } from "../aozorabunko/encoding";
import { regex } from "../regex";

// パス設定
const csvPath = "./src/lib/aozorabunko-card-lists/data/childrens-books-without-copyright.csv";
const aozoraPath = process.env.AOZORA_PATH || "~/src/github.com/aozorabunko/aozorabunko";
const outputPath = csvPath; // 元のCSVファイルに上書き

// レコードの型定義
interface AozoraRecord {
  作品ID: string;
  作品名: string;
  作品名読み: string;
  ソート用読み: string;
  副題: string;
  副題読み: string;
  原題: string;
  初出: string;
  分類番号: string;
  文字遣い種別: string;
  作品著作権フラグ: string;
  公開日: string;
  最終更新日: string;
  図書カードURL: string;
  [key: string]: string; // その他のプロパティ
}

/**
 * HTMLファイルから本文を抽出して文字数を計算する
 */
function getContentLength(htmlPath: string): number {
  try {
    // HTMLファイルを読み込み
    const htmlContent = readFileSync(htmlPath);
    const decodedContent = decode(htmlContent);

    // HTMLをパース
    const dom = new JSDOM(decodedContent);
    const mainTextElement = dom.window.document.querySelector(".main_text");

    if (!mainTextElement) {
      console.warn(`本文要素 (.main_text) が見つかりません: ${htmlPath}`);
      return 0;
    }

    // HTMLコンテンツを取得
    let content = mainTextElement.innerHTML;

    // ルビから本文のみを抽出（<rb>タグ内のテキスト）
    content = content.replace(regex.html.ruby.captureBase, "$1");

    // 残りのHTMLタグをすべて削除
    content = content.replace(regex.html.allTags, "");

    // 空白文字や改行を除去して文字数を計算
    const cleanedContent = content.replace(/\s+/g, "");
    return cleanedContent.length;
  } catch (error) {
    console.error(`文字数計算中にエラーが発生しました: ${htmlPath}`, error);
    return 0;
  }
}

/**
 * URLから青空文庫のローカルパスを取得する
 */
function getLocalPathFromUrl(url: string): string {
  if (!url) return "";

  // 'https://www.aozora.gr.jp/' 部分を削除し、aozoraPathに置き換える
  const relativePath = url.replace(/^https?:\/\/www\.aozora\.gr\.jp\//, "");
  return path.resolve(aozoraPath.replace(/^~/, process.env.HOME || ""), relativePath);
}

/**
 * CSVファイルを処理して文字数を追加する
 */
export async function processCSV(): Promise<void> {
  console.log(`CSVファイル ${csvPath} を処理します...`);

  // CSVファイルを読み込む
  const csvContent = readFileSync(csvPath, "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  }) as AozoraRecord[];

  console.log(`CSVデータを読み込みました。レコード数: ${records.length}`);

  // 各レコードに文字数を追加
  const recordsWithLength = records.map((record: AozoraRecord, index: number) => {
    const htmlUrl = record["XHTML/HTMLファイルURL"];
    if (!htmlUrl) {
      console.warn(`レコード ${index + 1}: HTMLファイルURLがありません`);
      return { ...record, コンテンツ文字数: "0" };
    }

    const localPath = getLocalPathFromUrl(htmlUrl);
    console.log(`処理中 [${index + 1}/${records.length}]: ${record.作品名} (${localPath})`);

    const contentLength = getContentLength(localPath);
    return { ...record, コンテンツ文字数: contentLength.toString() };
  });

  // 結果をCSV形式で保存
  const output = stringify(recordsWithLength, { header: true });
  writeFileSync(outputPath, output);

  console.log(`文字数データを追加したCSVを ${outputPath} に保存しました。`);
}
