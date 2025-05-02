#!/usr/bin/env bun
import { readFile, writeFile } from "fs/promises";
import * as process from "process";
import { htmlToMdx } from "../src/lib/aozorabunko/htmlToMdx";

async function main() {
  const [, , inputHtml, outputMdx] = process.argv;
  if (!inputHtml || !outputMdx) {
    console.error("Usage: bun run ./bin/html2mdx.ts <input.html> <output.mdx>");
    process.exit(1);
  }

  const html = await readFile(inputHtml, "utf-8");
  let mdx: string;
  try {
    mdx = htmlToMdx(html);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
  await writeFile(outputMdx, mdx, "utf-8");
  console.log(`Converted: ${inputHtml} -> ${outputMdx}`);
}

if (require.main === module) {
  main();
}
