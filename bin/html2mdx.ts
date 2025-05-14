#!/usr/bin/env bun
import {
  AozoraBunkoHtml,
  detectAndDecode,
  getMdxOutputPath,
  RubyTags,
} from "@packages/aozorabunko";
import { getAozoraBunkoCardUrl } from "@packages/aozorabunko-card-lists";
import { defaultFileSystem, FileSystem, Logger, logger } from "@packages/core-utils";
import { readFile } from "fs/promises";
import * as process from "process";
import { BookContent } from "@/features/book-content/core";

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
    logger.error("Usage: bun run ./bin/html2mdx.ts <input.html> [output.mdx]");
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
  customLogger: Logger = logger,
): { inputPath: string; sourceType: "file" | "url" } {
  if (!isUrl(input)) {
    return { inputPath: input, sourceType: "file" };
  }

  const inputPath = convertUrlToFilePath(input);
  customLogger.info(`URL detected. Attempting to read from local path: ${inputPath}`);

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

export async function processHtmlFile(
  inputHtmlPath: string,
  outputMdxPath?: string,
  customLogger: Logger = logger,
  fileSystem: FileSystem = defaultFileSystem,
) {
  const { inputPath } = processInputPath(inputHtmlPath, customLogger);
  const outPath = outputMdxPath || getMdxOutputPath(inputPath);

  const aozoraBunkoHtml = await AozoraBunkoHtml.read(async () => {
    const buffer = await readFile(inputPath);
    const { text: html } = detectAndDecode(buffer);
    return html;
  });

  let existingBookContent: BookContent | null = null;
  try {
    existingBookContent = await BookContent.readFile(outPath);
    customLogger.info(`Found existing MDX file: ${outPath}`);
  } catch (_error) {
    customLogger.info(`No existing MDX file found at: ${outPath}`);
  }

  const existingRubyTags = RubyTags.extract(existingBookContent);

  const bookContent = new BookContent();
  aozoraBunkoHtml.convertToBookContent({
    bookContent,
    existingRubyTags: existingRubyTags,
  });

  const mdx = bookContent.toMdx();

  fileSystem.writeFileSync(outPath, mdx, "utf-8");
  customLogger.info(`Converted: ${inputPath} -> ${outPath}`);

  const meta = aozoraBunkoHtml.extractBookMeta(inputPath);
  customLogger.info(generateBookEntry(meta));
}

async function main() {
  const options = parseCommandLineArgs(process.argv.slice(2));
  await processHtmlFile(options.inputHtml, options.outputMdx);
}

if (require.main === module) {
  main().catch((err) => {
    logger.error(`Error: ${err.message}`);
    process.exit(1);
  });
}
