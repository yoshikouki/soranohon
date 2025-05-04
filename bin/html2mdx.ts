#!/usr/bin/env bun
import { readFile, writeFile } from "fs/promises";
import * as process from "process";
import { extractBookMeta } from "../src/lib/aozorabunko/bookMeta";
import { detectAndDecode } from "../src/lib/aozorabunko/encoding";
import { addRubyTagsToMdx, htmlToMdx } from "../src/lib/aozorabunko/htmlToMdx";
import { getMdxOutputPath } from "../src/lib/aozorabunko/path";
import { addRubyTagsWithPreservation, extractExistingRubyTags } from "../src/lib/ruby-utils";

interface CommandLineOptions {
  inputHtml: string;
  outputMdx: string;
  addRuby: boolean;
  keepSpace: boolean;
  forceOverwrite: boolean;
}

function parseCommandLineArgs(args: string[]): CommandLineOptions {
  let inputHtml = "";
  let outputMdx = "";
  let addRuby = true; // デフォルトでルビを追加する
  let keepSpace = false; // デフォルトで全角スペースを削除する
  let forceOverwrite = false; // デフォルトで既存のルビを保護する

  // 引数を解析
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--no-ruby" || args[i] === "-n") {
      addRuby = false;
    } else if (args[i] === "--keep-space" || args[i] === "-k") {
      keepSpace = true;
    } else if (args[i] === "--force" || args[i] === "-f") {
      forceOverwrite = true;
    } else if (!inputHtml) {
      inputHtml = args[i];
    } else if (!outputMdx) {
      outputMdx = args[i];
    }
  }

  if (!inputHtml) {
    console.error(
      "Usage: bun run ./bin/html2mdx.ts [--no-ruby|-n] [--keep-space|-k] [--force|-f] <input.html> [output.mdx]",
    );
    console.error("Options:");
    console.error(
      "  --no-ruby, -n       Disable adding ruby placeholder tags to kanji characters",
    );
    console.error(
      "  --keep-space, -k    Keep leading full-width spaces in paragraphs (default: remove)",
    );
    console.error(
      "  --force, -f         Force overwrite existing ruby tags (default: preserve)",
    );
    process.exit(1);
  }

  return {
    inputHtml,
    outputMdx,
    addRuby,
    keepSpace,
    forceOverwrite,
  };
}

/**
 * HTML→MDX変換処理（オプション指定可能）
 */
async function convertHtmlToMdxWithOptions(
  html: string,
  existingRubyTags: Map<string, string>,
  addRuby: boolean,
  keepSpace: boolean,
  forceOverwrite: boolean,
): Promise<string> {
  // HTML→MDX変換（全角スペースの扱いを設定）
  let mdx = htmlToMdx(html, !keepSpace);

  // 全角スペース処理のログ
  if (keepSpace) {
    console.log("Kept leading full-width spaces in paragraphs");
  } else {
    console.log("Removed leading full-width spaces from paragraphs");
  }

  // ルビプレースホルダーの追加（デフォルト有効）
  if (addRuby) {
    if (existingRubyTags.size > 0 && !forceOverwrite) {
      // 既存のルビタグがある場合は、それを保持しつつ新しいプレースホルダーを追加
      mdx = addRubyTagsWithPreservation(mdx, existingRubyTags);
      console.log("Ruby placeholder tags added with existing ruby preserved");
    } else {
      // 既存のルビがない、または強制上書きの場合は通常処理
      mdx = addRubyTagsToMdx(mdx);
      console.log("Ruby placeholder tags added to kanji characters");
    }
  } else {
    console.log("Ruby placeholder tags disabled");
  }

  return mdx;
}

/**
 * 本のエントリー情報を生成する
 */
function generateBookEntry(meta: ReturnType<typeof extractBookMeta>): string {
  return `\n--- books entry ---\n"${meta.id}": {\n  id: "${meta.id}",\n  title: "${meta.title}",\n  creator: "${meta.creator}",\n  translator: ${meta.translator ? `"${meta.translator}"` : "undefined"},\n  bibliographyRaw: \`${meta.bibliographyRaw}\`,\n  mdx: () => import("./${meta.id}.mdx"),\n},\n--- end ---`;
}

async function main() {
  // コマンドライン引数の解析
  const options = parseCommandLineArgs(process.argv.slice(2));

  const outPath = options.outputMdx || getMdxOutputPath(options.inputHtml);

  // バイナリで読み込み、encoding-japaneseで自動判定＆デコード
  const buffer = await readFile(options.inputHtml);
  const { text: html, encoding } = detectAndDecode(buffer);

  // 既存のMDXファイルの確認とルビタグ抽出
  const { existingRubyTags } = await extractExistingRubyTags(outPath, options.forceOverwrite);

  // HTML→MDX変換処理
  const mdx = await convertHtmlToMdxWithOptions(
    html,
    existingRubyTags,
    options.addRuby,
    options.keepSpace,
    options.forceOverwrite,
  );

  // ファイル出力
  await writeFile(outPath, mdx, "utf-8");
  console.log(`Converted: ${options.inputHtml} (${encoding}) -> ${outPath}`);

  // booksエントリを標準出力
  const meta = extractBookMeta(options.inputHtml, html);
  console.log(generateBookEntry(meta));
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
}
