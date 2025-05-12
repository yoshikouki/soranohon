import { processZipFile } from "../src/lib/aozorabunko-card-lists/extract-childrens-books";

/**
 * メイン処理
 */
async function main() {
  try {
    await processZipFile();
    console.log("処理が完了しました。");
  } catch (error) {
    console.error("処理中にエラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプト実行
main();
