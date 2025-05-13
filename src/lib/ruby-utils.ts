/**
 * ルビタグ処理に関するユーティリティ関数
 */

import { constants } from "fs";
import { access, readFile } from "fs/promises";
import { logger } from "./logger";

// 既存のルビタグを抽出する正規表現
// 4つのパターンに対応:
// 1. <ruby>漢字<rt>かんじ</rt></ruby>
// 2. <ruby><rb>漢字</rb><rt>かんじ</rt></ruby>
// 3. <ruby><rb>漢字</rb><rp>（</rp><rt>かんじ</rt><rp>）</rp></ruby>
// 4. 改行を含むルビタグ: <ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>
export const rubyTagRegex = /<ruby>(?:.|\n)*?<rt>(?:.|\n)*?<\/rt>(?:.|\n)*?<\/ruby>/g;

// 漢字とルビを抽出するための正規表現
// キャプチャグループを使用して、漢字と対応するルビを抽出します
// 改行を含むルビタグにも対応するように改良
export const rubyContentRegex =
  /<ruby>(?:\s*(?:<rb>)?\s*)([^<]*?)(?:\s*(?:<\/rb>)?\s*)(?:<rp>[^<]*<\/rp>)?\s*<rt>\s*([^<]*?)\s*<\/rt>(?:<rp>[^<]*<\/rp>)?\s*<\/ruby>/;

// 漢字に対する正規表現
const kanjiRegex = /[\p{Script=Han}々]+/gu;

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

  const matches = [...existingMdx.matchAll(rubyTagRegex)];
  for (const match of matches) {
    // 各ルビタグから漢字とルビを抽出
    const fullMatch = match[0];
    const contentMatch = rubyContentRegex.exec(fullMatch);

    if (!contentMatch) continue;

    const kanjiText = contentMatch[1]?.trim();
    const rubyText = contentMatch[2]?.trim();

    // プレースホルダーや無効なルビタグは無視
    if (!rubyText || rubyText === "{{required_ruby}}" || !kanjiText) continue;

    // 漢字の既存のルビを保存（複合漢字も単一漢字も同じロジック）
    if (!existingRubyTags.has(kanjiText)) {
      existingRubyTags.set(kanjiText, [rubyText]);
    } else {
      existingRubyTags.get(kanjiText)?.push(rubyText);
    }
  }
  if (process.env.NODE_ENV !== "test") {
    logger.info(`Found ${existingRubyTags.size} existing ruby tags`);
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
  // 既存のrubyタグとその内容を解析して保存するためのオブジェクト
  interface RubyTagInfo {
    originalTag: string;
    kanji: string;
    ruby: string;
  }

  // rubyタグの情報を保持する配列
  const rubyTagInfos: RubyTagInfo[] = [];

  // 漢字と対応するrubyレンダリング情報のマップ
  // このマップを使って、プレースホルダーを元に戻す際に使用する
  const kanjiRubyMap = new Map<string, Map<number, string>>();

  // まず既存のrubyタグを一時的に置換して保護すると同時に内容を解析
  let protectedText = mdx.replace(rubyTagRegex, (match) => {
    // 漢字とルビを抽出
    const contentMatch = rubyContentRegex.exec(match);
    if (contentMatch) {
      const kanji = contentMatch[1]?.trim() || "";
      const ruby = contentMatch[2]?.trim() || "";

      // シンプルなプレースホルダーを使用
      const placeholder = `__RUBY_TAG_${rubyTagInfos.length}__`;

      // タグ情報を保存
      rubyTagInfos.push({
        originalTag: match,
        kanji,
        ruby,
      });

      // 漢字-ルビの位置マップに追加
      if (!kanjiRubyMap.has(kanji)) {
        kanjiRubyMap.set(kanji, new Map<number, string>());
      }
      kanjiRubyMap.get(kanji)!.set(rubyTagInfos.length - 1, ruby);

      return placeholder;
    }

    // 解析に失敗した場合も同じ形式のプレースホルダー
    const placeholder = `__RUBY_TAG_${rubyTagInfos.length}__`;
    rubyTagInfos.push({
      originalTag: match,
      kanji: "",
      ruby: "",
    });
    return placeholder;
  });

  // 漢字をrubyタグで囲む
  protectedText = protectedText.replace(kanjiRegex, (kanji) => {
    // 既存のルビタグがある場合は処理
    if (existingRubyTags.has(kanji)) {
      const rubyArray = existingRubyTags.get(kanji)!;
      if (rubyArray.length === 0) {
        throw new Error(`No ruby annotations available for kanji: ${kanji}`);
      }

      // FIFO方式: 配列の先頭から要素を取り出す
      const [rubyToUse, ...restArray] = rubyArray;
      existingRubyTags.set(kanji, restArray);
      return `<ruby>${kanji}<rt>${rubyToUse}</rt></ruby>`;
    }

    // 複合漢字の場合の処理
    if (kanji.length <= 1) {
      return `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
    }

    // 複合漢字の各文字を個別にチェック
    const kanjiChars = Array.from(kanji);

    // すべての漢字が個別のルビを持っているかをチェック
    for (const char of kanjiChars) {
      if (!existingRubyTags.has(char)) {
        return `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
      }
    }

    // すべての漢字が個別のルビを持っている場合
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
  });

  // プレースホルダーを元のrubyタグに戻す
  // シンプル化したプレースホルダーパターン: __RUBY_TAG_インデックス__
  return protectedText.replace(/__RUBY_TAG_(\d+)__/g, (match, index) => {
    // インデックスを数値に変換
    const idx = parseInt(index);

    // 対応するタグ情報を取得して元のタグを返す
    if (idx >= 0 && idx < rubyTagInfos.length) {
      return rubyTagInfos[idx].originalTag;
    }

    // 対応するタグが見つからない場合（通常起きないはず）
    return match;
  });
}
