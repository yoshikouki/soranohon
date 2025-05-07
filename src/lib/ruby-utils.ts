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
  existingRubyTags: Map<string, string[]>;
  fileExists: boolean;
}> {
  const fileExists = await access(filePath, constants.F_OK)
    .then(() => true)
    .catch(() => false);
  if (!fileExists || forceOverwrite) {
    return { existingRubyTags: new Map<string, string[]>(), existingMdx: "", fileExists };
  }

  const existingMdx = await readFile(filePath, "utf-8");
  const existingRubyTags = new Map<string, string[]>();

  // 既存のルビタグを抽出する正規表現
  // 3つのパターンに対応:
  // 1. <ruby>漢字<rt>かんじ</rt></ruby>
  // 2. <ruby><rb>漢字</rb><rt>かんじ</rt></ruby>
  // 3. <ruby><rb>漢字</rb><rp>（</rp><rt>かんじ</rt><rp>）</rp></ruby>
  const rubyTagRegex =
    /<ruby>(?:<rb>)?([^<]+)(?:<\/rb>)?(?:<rp>[^<]*<\/rp>)?<rt>([^<]+)<\/rt>(?:<rp>[^<]*<\/rp>)?<\/ruby>/g;
  let match: RegExpExecArray | null = rubyTagRegex.exec(existingMdx);
  while (match !== null) {
    const kanjiText = match[1];
    const rubyText = match[2];

    // プレースホルダー以外の有効なルビタグを保存
    if (rubyText !== "{{required_ruby}}") {
      // 単一の漢字の場合、文字ごとにルビを保存
      if (kanjiText.length > 1) {
        // 複合漢字の場合は、そのまま保存
        if (!existingRubyTags.has(kanjiText)) {
          existingRubyTags.set(kanjiText, [rubyText]);
        } else {
          existingRubyTags.get(kanjiText)?.push(rubyText);
        }
      } else {
        // 単一漢字の場合
        if (!existingRubyTags.has(kanjiText)) {
          existingRubyTags.set(kanjiText, [rubyText]);
        } else {
          existingRubyTags.get(kanjiText)?.push(rubyText);
        }
      }
    }
    match = rubyTagRegex.exec(existingMdx);
  }
  if (process.env.NODE_ENV !== "test") {
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
  existingRubyTags: Map<string, string[]>,
): string {
  // まず既存のrubyタグを一時的に置換して保護
  const rubyTags: string[] = [];
  const rubyTagRegex = /<ruby>(?:[^<]*|<(?!\/ruby>)[^>]*>)*?<\/ruby>/g;

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
      const rubyArray = existingRubyTags.get(kanji)!;

      // 配列が空の場合は例外を発生させる
      if (rubyArray.length === 0) {
        throw new Error(`No ruby annotations available for kanji: ${kanji}`);
      }

      // FIFO方式: 配列の先頭から要素を取り出す
      const rubyToUse = rubyArray[0];

      // 使用済みのルビを配列から削除
      existingRubyTags.set(kanji, rubyArray.slice(1));

      return `<ruby>${kanji}<rt>${rubyToUse}</rt></ruby>`;
    }

    // 個別の漢字に対して既存のルビがある場合は処理
    if (kanji.length > 1) {
      // 複合漢字の各文字を個別にチェック
      const kanjiChars = Array.from(kanji);
      let individualRubies = true;

      // すべての漢字が個別のルビを持っているかをチェック
      for (const char of kanjiChars) {
        if (!existingRubyTags.has(char)) {
          individualRubies = false;
          break;
        }
      }

      // すべての漢字が個別のルビを持っている場合
      if (individualRubies) {
        let result = "";
        for (const char of kanjiChars) {
          const rubyArray = existingRubyTags.get(char)!;

          // 配列が空の場合は例外を発生させる
          if (rubyArray.length === 0) {
            throw new Error(`No ruby annotations available for kanji: ${char}`);
          }

          // FIFO方式: 配列の先頭から要素を取り出す
          const rubyToUse = rubyArray[0];

          // 使用済みのルビを配列から削除
          existingRubyTags.set(char, rubyArray.slice(1));

          result += `<ruby>${char}<rt>${rubyToUse}</rt></ruby>`;
        }
        return result;
      }
    }

    return `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
  });

  // プレースホルダーを元のrubyタグに戻す
  return protectedText.replace(/__RUBY_TAG_(\d+)__/g, (_, index) => {
    return rubyTags[parseInt(index)];
  });
}
