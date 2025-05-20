/**
 * Orchestrator layer: パイプライン制御、依存注入、エラーハンドリング、ロギング
 */

import { promises as fs } from "fs";
import path from "path";
import type { CLIOptions } from "./cli";
import { extractMetadata } from "./extractor/metadata";
import { detectAndDecode } from "./parser/encoding";
import { parseHtml } from "./parser/html";
import { renderMdx } from "./renderer/mdx";
import { transformHeadings } from "./transformer/headings";
import { transformLinks } from "./transformer/links";
import { transformRuby } from "./transformer/ruby";
import { getMdxOutputPath } from "./utils/path";
import type { Metadata, AST } from "./types";

/**
 * Orchestrator layer: パイプライン制御、依存注入、エラーハンドリング、ロギング
 */
export async function run(options: CLIOptions): Promise<{ mdx: string; metadata: Metadata }> {
  const inputPath = options.input;
  const outputPath = options.output ?? getMdxOutputPath(inputPath);

  console.log(`Processing: ${inputPath} -> ${outputPath}`);

  const buffer = await fs.readFile(inputPath);
  const { text: html } = detectAndDecode(buffer);

  const ast: AST = parseHtml(html);
  const metadata = extractMetadata(ast, inputPath);

  const astWithHeadings = transformHeadings(ast);
  const astWithRuby = transformRuby(astWithHeadings);
  const astWithLinks = transformLinks(astWithRuby);

  const mdx = renderMdx(astWithLinks);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, mdx, "utf-8");

  console.log(`Metadata: ${JSON.stringify(metadata)}`);

  return { mdx, metadata };
}
