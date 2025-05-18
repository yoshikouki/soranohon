import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { writeFileSync } from "fs";
import * as unzipper from "unzipper";
import { logger } from "../../src/lib/logger";

const zipFilePath = "./packages/aozorabunko-card-lists/data/list_person_all_extended_utf8.zip";
const csvFileName = "list_person_all_extended_utf8.csv";
const outputPath =
  "./packages/aozorabunko-card-lists/data/childrens-books-without-copyright.csv";

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
  [key: string]: string;
}

export async function processZipFile(): Promise<void> {
  logger.info(`ZIPファイル ${zipFilePath} から直接データを処理します...`);

  const directory = await unzipper.Open.file(zipFilePath);

  const csvEntry = directory.files.find(
    (entry) => entry.path === csvFileName || entry.path.endsWith(`/${csvFileName}`),
  );

  if (!csvEntry) {
    throw new Error(`ZIPファイル内に ${csvFileName} が見つかりません`);
  }

  logger.info(`ZIPファイル内の ${csvEntry.path} を処理します...`);

  const content = await csvEntry.buffer();
  const csvString = content.toString("utf-8");

  const records = parse(csvString, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    skip_records_with_error: true,
  }) as AozoraRecord[];

  logger.info(`ZIPファイルからCSVデータを読み込みました。レコード数: ${records.length}`);

  const filteredRecords = records.filter((record: AozoraRecord) => {
    return record.分類番号?.startsWith("NDC K") && record.作品著作権フラグ === "なし";
  });

  logger.info(`全レコード数: ${records.length}`);
  logger.info(`抽出レコード数: ${filteredRecords.length}`);

  const output = stringify(filteredRecords, { header: true });
  writeFileSync(outputPath, output);

  logger.info(`児童書かつ著作権なしのデータを ${outputPath} に保存しました。`);
}
