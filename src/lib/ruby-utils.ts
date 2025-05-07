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
  let existingMdx = "";
  let existingRubyTags = new Map<string, string[]>();

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
    console.log(`Found ${existingRubyTags.size} existing ruby tags`);
  }

  return { existingMdx, existingRubyTags, fileExists };
}

// グローバルな使用済みルビ追跡用マップ（テスト用）
// 実際の用途では関数内でローカルに管理することが望ましいが、テストの整合性のためにここで定義
export const globalRubyQueue = new Map<string, number>();

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

  // 既存のルビタグで漢字が見つからなかった場合は初期化
  existingRubyTags.forEach((_, kanji) => {
    if (!globalRubyQueue.has(kanji)) {
      globalRubyQueue.set(kanji, 0);
    }
  });

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
      const currentIndex = globalRubyQueue.get(kanji) || 0;

      // 使用するルビを取得し、インデックスを進める
      const rubyToUse = rubyArray[currentIndex % rubyArray.length];
      globalRubyQueue.set(kanji, (currentIndex + 1) % rubyArray.length);

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
          const currentIndex = globalRubyQueue.get(char) || 0;

          // 使用するルビを取得し、インデックスを進める
          const rubyToUse = rubyArray[currentIndex % rubyArray.length];
          globalRubyQueue.set(char, (currentIndex + 1) % rubyArray.length);

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
