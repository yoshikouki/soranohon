#!/usr/bin/env bun
import * as fs from "fs";
import { readFile, writeFile } from "fs/promises";
import * as path from "path";
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
  forceOverwrite: boolean;
}

function parseCommandLineArgs(args: string[]): CommandLineOptions {
  // デフォルト値を設定
  let addRuby = true; // デフォルトでルビを追加する
  let forceOverwrite = false; // デフォルトで既存のルビを保護する
  const fileArgs: string[] = [];

  // オプション引数を解析
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--no-ruby" || args[i] === "-n") {
      addRuby = false;
    } else if (args[i] === "--force" || args[i] === "-f") {
      forceOverwrite = true;
    } else {
      fileArgs.push(args[i]);
    }
  }

  // 入力と出力ファイルの取得
  const inputHtml = fileArgs[0] || "";
  const outputMdx = fileArgs[1] || "";

  if (!inputHtml) {
    console.error(
      "Usage: bun run ./bin/html2mdx.ts [--no-ruby|-n] [--force|-f] <input.html> [output.mdx]",
    );
    console.error("Options:");
    console.error(
      "  --no-ruby, -n       Disable adding ruby placeholder tags to kanji characters",
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
    forceOverwrite,
  };
}

/**
 * 入力パスを処理し、実際のファイルパスとソースタイプを返す
 */
function processInputPath(input: string): { inputPath: string; sourceType: "file" | "url" } {
  if (!isUrl(input)) {
    return { inputPath: input, sourceType: "file" };
  }

  const inputPath = convertUrlToFilePath(input);
  console.log(`URL detected. Attempting to read from local path: ${inputPath}`);

  // ファイルの存在確認
  if (!fs.existsSync(inputPath)) {
    console.error(`File not found at: ${inputPath}`);
    console.error("Make sure the aozorabunko repository is cloned at the expected location.");
    process.exit(1);
  }

  return { inputPath, sourceType: "url" };
}

/**
 * URL文字列かどうかを判定する
 */
function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * URLからファイルパスに変換する
 */
function convertUrlToFilePath(url: string): string {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== "www.aozora.gr.jp") {
      throw new Error("Only aozora.gr.jp URLs are supported");
    }
    const pathParts = parsedUrl.pathname.split("/");
    // cards/001091/files/59521_71684.html のような形式を想定
    if (pathParts.length < 4 || pathParts[1] !== "cards") {
      throw new Error("Unexpected URL format");
    }

    return path.join(
      "/Users/yoshikouki/src/github.com/aozorabunko/aozorabunko",
      ...pathParts.slice(1),
    );
  } catch (error) {
    throw new Error(`Invalid aozora.gr.jp URL: ${error.message}`);
  }
}

/**
 * HTML→MDX変換処理（オプション指定可能）
 */
async function convertHtmlToMdxWithOptions(
  html: string,
  existingRubyTags: Map<string, string[]>,
  addRuby: boolean,
  forceOverwrite: boolean,
): Promise<string> {
  // HTML→MDX変換
  const baseMdx = htmlToMdx(html);

  // ルビプレースホルダーの追加（デフォルト有効）
  if (!addRuby) {
    console.log("Ruby placeholder tags disabled");
    return baseMdx;
  }

  if (existingRubyTags.size > 0 && !forceOverwrite) {
    // 既存のルビタグがある場合は、それを保持しつつ新しいプレースホルダーを追加
    const resultMdx = addRubyTagsWithPreservation(baseMdx, existingRubyTags);
    console.log("Ruby placeholder tags added with existing ruby preserved");
    return resultMdx;
  }

  // 既存のルビがない、または強制上書きの場合は通常処理
  const resultMdx = addRubyTagsToMdx(baseMdx);
  console.log("Ruby placeholder tags added to kanji characters");
  return resultMdx;
}

/**
 * 本のエントリー情報を生成する
 */
function generateBookEntry(meta: ReturnType<typeof extractBookMeta>): string {
  return `
ℹ️ Add this to src/books/index.ts

--- books entry ---
  "${meta.id}": {
    id: "${meta.id}",
    title: "${meta.title}",
    creator: "${meta.creator}",
    translator: ${meta.translator ? `"${meta.translator}"` : "undefined"},
    bibliographyRaw: \`${meta.bibliographyRaw}\`,
    mdx: () => import("./${meta.id}.mdx"),
  },
--- end ---`;
}

async function main() {
  // コマンドライン引数の解析
  const options = parseCommandLineArgs(process.argv.slice(2));

  // 入力がURLの場合は、ローカルのaozorabunkoリポジトリパスに変換
  const { inputPath, sourceType } = processInputPath(options.inputHtml);

  const outPath = options.outputMdx || getMdxOutputPath(inputPath);

  // バイナリで読み込み、encoding-japaneseで自動判定＆デコード
  const buffer = await readFile(inputPath);
  const { text: html, encoding } = detectAndDecode(buffer);

  // 既存のMDXファイルの確認とルビタグ抽出
  const { existingRubyTags } = await extractExistingRubyTags(outPath, options.forceOverwrite);

  // HTML→MDX変換処理
  const mdx = await convertHtmlToMdxWithOptions(
    html,
    existingRubyTags,
    options.addRuby,
    options.forceOverwrite,
  );

  // ファイル出力
  await writeFile(outPath, mdx, "utf-8");
  console.log(
    `Converted: ${sourceType === "url" ? options.inputHtml : inputPath} (${encoding}) -> ${outPath}`,
  );

  // booksエントリを標準出力
  const meta = extractBookMeta(inputPath, html);
  console.log(generateBookEntry(meta));
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
}
