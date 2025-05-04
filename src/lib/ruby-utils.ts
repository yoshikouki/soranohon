/**
 * ルビタグ処理に関するユーティリティ関数
 */

import { constants } from "fs";
import { access, readFile } from "fs/promises";

/**
 * 既存のMDXファイルからルビタグを抽出する
 * @param filePath ファイルパス
 * @param forceOverwrite 強制上書きオプション
 * @returns 抽出結果
 */
export async function extractExistingRubyTags(
  filePath: string,
  forceOverwrite: boolean,
): Promise<{
  existingMdx: string;
  existingRubyTags: Map<string, string>;
  fileExists: boolean;
}> {
  let existingMdx = "";
  let existingRubyTags = new Map<string, string>();

  // ファイルが存在するかをチェック
  const fileExists = await access(filePath, constants.F_OK)
    .then(() => true)
    .catch(() => false);

  if (fileExists && !forceOverwrite) {
    // 既存ファイルがあり、強制上書きでない場合は読み込む
    existingMdx = await readFile(filePath, "utf-8");

    // 既存のルビタグを抽出
    const rubyTagRegex = /<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/g;
    let match: RegExpExecArray | null = rubyTagRegex.exec(existingMdx);
    while (match !== null) {
      const kanjiText = match[1];
      const rubyText = match[2];
      // プレースホルダー以外の有効なルビタグを保存
      if (rubyText !== "{{required_ruby}}") {
        existingRubyTags.set(kanjiText, rubyText);
      }
      match = rubyTagRegex.exec(existingMdx);
    }
    console.log(`Found ${existingRubyTags.size} existing ruby tags`);
  }

  return { existingMdx, existingRubyTags, fileExists };
}

/**
 * 既存のルビタグを保持しながら漢字にルビプレースホルダーを追加する
 * @param mdx MDXテキスト
 * @param existingRubyTags 既存のルビタグのマップ
 * @returns 処理済みのMDXテキスト
 */
export function addRubyTagsWithPreservation(
  mdx: string,
  existingRubyTags: Map<string, string>,
): string {
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
  return protectedText.replace(/__RUBY_TAG_(\d+)__/g, (_, index) => {
    return rubyTags[parseInt(index)];
  });
}
