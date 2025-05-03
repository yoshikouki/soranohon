#!/usr/bin/env bun
import { readFile, writeFile, access } from "fs/promises";
import { constants } from "fs";
import * as process from "process";
import { extractBookMeta } from "../src/lib/aozorabunko/bookMeta";
import { detectAndDecode } from "../src/lib/aozorabunko/encoding";
import { addPlaceholderRubyToKanji, addRubyTagsToMdx, htmlToMdx } from "../src/lib/aozorabunko/htmlToMdx";
import { getMdxOutputPath } from "../src/lib/aozorabunko/path";

async function main() {
  // コマンドライン引数の解析
  const args = process.argv.slice(2);
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
    console.error("Usage: bun run ./bin/html2mdx.ts [--no-ruby|-n] [--keep-space|-k] [--force|-f] <input.html> [output.mdx]");
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

  const outPath = outputMdx ? outputMdx : getMdxOutputPath(inputHtml);

  // バイナリで読み込み、encoding-japaneseで自動判定＆デコード
  const buffer = await readFile(inputHtml);
  const { text: html, encoding } = detectAndDecode(buffer);

  // 既存のMDXファイルの確認
  let existingMdx = "";
  let existingRubyTags = new Map<string, string>();
  try {
    // ファイルが存在するかをチェック
    await access(outPath, constants.F_OK);
    if (!forceOverwrite) {
      // 既存ファイルがあり、強制上書きでない場合は読み込む
      existingMdx = await readFile(outPath, "utf-8");
      
      // 既存のルビタグを抽出
      const rubyTagRegex = /<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/g;
      let match;
      while ((match = rubyTagRegex.exec(existingMdx)) !== null) {
        const kanjiText = match[1];
        const rubyText = match[2];
        // プレースホルダー以外の有効なルビタグを保存
        if (rubyText !== "{{required_ruby}}") {
          existingRubyTags.set(kanjiText, rubyText);
        }
      }
      console.log(`Found ${existingRubyTags.size} existing ruby tags`);
    }
  } catch (error) {
    // ファイルが存在しない場合は無視
  }

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
      if (existingRubyTags.size > 0 && !forceOverwrite) {
        // 既存のルビタグがある場合は、それを保持しつつ新しいプレースホルダーを追加
        // まず既存のrubyタグを一時的に置換して保護
        const rubyTags: string[] = [];
        const rubyTagRegex = /<ruby>(?:[^<]*|<(?!\/ruby>)[^>]*>)*<\/ruby>/gs;
        
        let protectedText = mdx.replace(rubyTagRegex, (match) => {
          const placeholder = `__RUBY_TAG_${rubyTags.length}__`;
          rubyTags.push(match);
          return placeholder;
        });
        
        // 漢字に対する正規表現
        const kanjiRegex = /[\p{Script=Han}々]+/gu;
        
        // 漢字をrubyタグで囲む
        protectedText = protectedText.replace(kanjiRegex, (kanji) => {
          // 既存のルビタグがあればそれを使う
          if (existingRubyTags.has(kanji)) {
            return `<ruby>${kanji}<rt>${existingRubyTags.get(kanji)}</rt></ruby>`;
          }
          return `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
        });
        
        // プレースホルダーを元のrubyタグに戻す
        mdx = protectedText.replace(/__RUBY_TAG_(\d+)__/g, (_, index) => {
          return rubyTags[parseInt(index)];
        });
        
        console.log("Ruby placeholder tags added with existing ruby preserved");
      } else {
        // 既存のルビがない、または強制上書きの場合は通常処理
        mdx = addRubyTagsToMdx(mdx);
        console.log("Ruby placeholder tags added to kanji characters");
      }
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
