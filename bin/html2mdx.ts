#!/usr/bin/env bun
import { readFile } from "fs/promises";
import * as process from "process";
import { BookContent } from "@/features/book-content/core";
import { AozoraBunkoHtml } from "@/lib/aozorabunko/aozora-bunko-html";
import { detectAndDecode } from "@/lib/aozorabunko/encoding";
import { getMdxOutputPath } from "@/lib/aozorabunko/path";
import { RubyTags } from "@/lib/aozorabunko/ruby-tags";
import { getAozoraBunkoCardUrl } from "@/lib/aozorabunko-card-lists/get-book-card-url";
import { defaultFileSystem } from "@/lib/fs";
import { defaultLogger, Logger } from "@/lib/logger";

interface CommandLineOptions {
  inputHtml: string;
  outputMdx: string;
}

/**
 * コマンドライン引数を解析する
 */
function parseCommandLineArgs(args: string[]): CommandLineOptions {
  const fileArgs: string[] = args;

  const inputHtml = fileArgs[0] || "";
  const outputMdx = fileArgs[1] || "";

  if (!inputHtml) {
    console.error("Usage: bun run ./bin/html2mdx.ts <input.html> [output.mdx]");
    process.exit(1);
  }

  return {
    inputHtml,
    outputMdx,
  };
}

/**
 * 入力パスを処理し、実際のファイルパスとソースタイプを返す
 */
function processInputPath(
  input: string,
  logger: Logger = defaultLogger,
): { inputPath: string; sourceType: "file" | "url" } {
  if (!isUrl(input)) {
    return { inputPath: input, sourceType: "file" };
  }

  const inputPath = convertUrlToFilePath(input);
  logger.info(`URL detected. Attempting to read from local path: ${inputPath}`);

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
export function convertUrlToFilePath(url: string): string {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== "www.aozora.gr.jp") {
      throw new Error("Only aozora.gr.jp URLs are supported");
    }
    const pathParts = parsedUrl.pathname.split("/");
    if (pathParts.length < 4 || pathParts[1] !== "cards") {
      throw new Error("Unexpected URL format");
    }

    return (
      "/Users/yoshikouki/src/github.com/aozorabunko/aozorabunko/" + pathParts.slice(1).join("/")
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid aozora.gr.jp URL: ${errorMessage}`);
  }
}

/**
 * 本のエントリー情報を生成する
 */
function generateBookEntry(meta: ReturnType<AozoraBunkoHtml["extractBookMeta"]>): string {
  const aozoraBunkoUrl = getAozoraBunkoCardUrl(meta.id) || "";

  return `
ℹ️ Add this to src/books/index.ts

--- books entry ---
  "${meta.id}": {
    id: "${meta.id}",
    title: "${meta.title}",
    creator: "${meta.creator}",
    translator: ${meta.translator ? `"${meta.translator}"` : "undefined"},
    bibliographyRaw: \`${meta.bibliographyRaw}\`,
    aozoraBunkoUrl: "${aozoraBunkoUrl}",
    mdx: () => import("./${meta.id}.mdx"),
  },
--- end ---`;
}

export async function processHtmlFile(inputHtmlPath: string, outputMdxPath?: string) {
  const logger = defaultLogger;
  const fileSystem = defaultFileSystem;

  const { inputPath } = processInputPath(inputHtmlPath, logger);
  const outPath = outputMdxPath || getMdxOutputPath(inputPath);

  const aozoraBunkoHtml = await AozoraBunkoHtml.read(async () => {
    const buffer = await readFile(inputPath);
    const { text: html } = detectAndDecode(buffer);
    return html;
  });

  let existingBookContent: BookContent | null = null;
  try {
    existingBookContent = await BookContent.readFile(outPath);
    logger.info(`Found existing MDX file: ${outPath}`);
  } catch (_error) {
    logger.info(`No existing MDX file found at: ${outPath}`);
  }

  const existingRubyTags = RubyTags.extract(existingBookContent);

  const bookContent = new BookContent();
  aozoraBunkoHtml.convertToBookContent({
    bookContent,
    existingRubyTags: existingRubyTags.getRubyMap(),
  });

  const mdx = bookContent.toMdx();

  fileSystem.writeFileSync(outPath, mdx, "utf-8");
  logger.info(`Converted: ${inputPath} -> ${outPath}`);

  const meta = aozoraBunkoHtml.extractBookMeta(inputPath);
  logger.info(generateBookEntry(meta));
}

async function main() {
  const options = parseCommandLineArgs(process.argv.slice(2));
  await processHtmlFile(options.inputHtml, options.outputMdx);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
}
