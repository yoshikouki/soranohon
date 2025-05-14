import { processCSV } from "@packages/aozorabunko-card-lists";

/**
 * メイン処理
 */
async function main() {
  try {
    await processCSV();
    console.log("処理が完了しました。");
  } catch (error) {
    console.error("処理中にエラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプト実行
main();
