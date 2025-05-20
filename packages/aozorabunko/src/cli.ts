#!/usr/bin/env bun
/**
 * CLI layer: コマンドライン引数解析、ヘルプ表示
 */

import { run } from "./orchestrator";

export interface CLIOptions {
  /** 入力となるHTMLファイルのパス */
  input: string;
  /** 出力先のMDXファイルのパス（省略時は自動生成） */
  output?: string;
}

export function parseCLIOptions(_args: string[]): CLIOptions {
  const usage = [
    "Usage: html2mdx [options] <input.html>",
    "",
    "Options:",
    "  -o, --output <path>   出力先のMDXファイルパス（省略時は自動生成）",
    "  -h, --help            ヘルプを表示",
  ].join("\n");

  const options: CLIOptions = { input: "", output: undefined };
  const args = [..._args];
  let i = 0;
  while (i < args.length) {
    const arg = args[i]!;
    if (arg === "-h" || arg === "--help") {
      console.log(usage);
      process.exit(0);
    }
    if (arg === "-o" || arg === "--output") {
      const next = args[i + 1];
      if (!next) {
        console.error(`Error: Missing value for ${arg}`);
        console.error(usage);
        process.exit(1);
      }
      options.output = next;
      i += 2;
      continue;
    }
    if (arg.startsWith("-")) {
      console.error(`Unknown option: ${arg}`);
      console.error(usage);
      process.exit(1);
    }
    if (options.input) {
      console.error(`Multiple input files specified: '${options.input}' and '${arg}'`);
      console.error(usage);
      process.exit(1);
    }
    options.input = arg;
    i++;
  }
  if (!options.input) {
    console.error("Error: Missing input HTML file path");
    console.error(usage);
    process.exit(1);
  }
  return options;
}

async function main(): Promise<void> {
  const options = parseCLIOptions(process.argv.slice(2));
  await run(options);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
