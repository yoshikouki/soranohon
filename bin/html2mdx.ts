#!/usr/bin/env bun
import { readFile, writeFile } from "fs/promises";
import * as process from "process";
import { detectAndDecode } from "../src/lib/aozorabunko/encoding";
import { htmlToMdx } from "../src/lib/aozorabunko/htmlToMdx";
import { getMdxOutputPath } from "../src/lib/aozorabunko/path";

async function main() {
  const [, , inputHtml, outputMdx] = process.argv;
  if (!inputHtml) {
    console.error("Usage: bun run ./bin/html2mdx.ts <input.html> [output.mdx]");
    process.exit(1);
  }

  const outPath = outputMdx ? outputMdx : getMdxOutputPath(inputHtml);

  // バイナリで読み込み、encoding-japaneseで自動判定＆デコード
  const buffer = await readFile(inputHtml);
  const { text: html, encoding } = detectAndDecode(buffer);

  let mdx: string;
  try {
    mdx = htmlToMdx(html);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
  await writeFile(outPath, mdx, "utf-8");
  console.log(`Converted: ${inputHtml} (${encoding}) -> ${outPath}`);
}

if (require.main === module) {
  main();
}
