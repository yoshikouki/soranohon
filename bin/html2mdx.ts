#!/usr/bin/env bun
import { readFile, writeFile } from "fs/promises";
import * as process from "process";
import { extractBookMeta } from "../src/lib/aozorabunko/bookMeta";
import { detectAndDecode } from "../src/lib/aozorabunko/encoding";
import { addRubyTagsToMdx, htmlToMdx } from "../src/lib/aozorabunko/htmlToMdx";
import { getMdxOutputPath } from "../src/lib/aozorabunko/path";

async function main() {
  // コマンドライン引数の解析
  const args = process.argv.slice(2);
  let inputHtml = "";
  let outputMdx = "";
  let addRuby = true; // デフォルトでルビを追加する
  let keepSpace = false; // デフォルトで全角スペースを削除する

  // 引数を解析
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--no-ruby" || args[i] === "-n") {
      addRuby = false;
    } else if (args[i] === "--keep-space" || args[i] === "-k") {
      keepSpace = true;
    } else if (!inputHtml) {
      inputHtml = args[i];
    } else if (!outputMdx) {
      outputMdx = args[i];
    }
  }

  if (!inputHtml) {
    console.error("Usage: bun run ./bin/html2mdx.ts [--no-ruby|-n] [--keep-space|-k] <input.html> [output.mdx]");
    console.error("Options:");
    console.error(
      "  --no-ruby, -n       Disable adding ruby placeholder tags to kanji characters",
    );
    console.error(
      "  --keep-space, -k    Keep leading full-width spaces in paragraphs (default: remove)",
    );
    process.exit(1);
  }

  const outPath = outputMdx ? outputMdx : getMdxOutputPath(inputHtml);

  // バイナリで読み込み、encoding-japaneseで自動判定＆デコード
  const buffer = await readFile(inputHtml);
  const { text: html, encoding } = detectAndDecode(buffer);

  let mdx: string;
  try {
    // HTML→MDX変換（全角スペースの扱いを設定）
    mdx = htmlToMdx(html, !keepSpace);

    // 全角スペース処理のログ
    if (keepSpace) {
      console.log("Kept leading full-width spaces in paragraphs");
    } else {
      console.log("Removed leading full-width spaces from paragraphs");
    }

    // ルビプレースホルダーの追加（デフォルト有効）
    if (addRuby) {
      mdx = addRubyTagsToMdx(mdx);
      console.log("Ruby placeholder tags added to kanji characters");
    } else {
      console.log("Ruby placeholder tags disabled");
    }
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
  await writeFile(outPath, mdx, "utf-8");
  console.log(`Converted: ${inputHtml} (${encoding}) -> ${outPath}`);

  // booksエントリを標準出力
  const meta = extractBookMeta(inputHtml, html);
  const entry = `\n--- books entry ---\n"${meta.id}": {\n  id: "${meta.id}",\n  title: "${meta.title}",\n  creator: "${meta.creator}",\n  translator: ${meta.translator ? `"${meta.translator}"` : "undefined"},\n  bibliographyRaw: \`${meta.bibliographyRaw}\`,\n  mdx: () => import("./${meta.id}.mdx"),\n},\n--- end ---`;
  console.log(entry);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
}
