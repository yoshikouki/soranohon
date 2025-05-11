import { BookContent } from "@/features/book-content/core";

// ルビタグを抽出する正規表現
const rubyTagRegex = /<ruby>(?:[\s\S])*?<rt>(?:[\s\S])*?<\/rt>(?:[\s\S])*?<\/ruby>/g;

// 漢字とルビを抽出するための正規表現
const rubyContentRegex =
  /<ruby>(?:\s*(?:<rb>)?\s*)([^<]*?)(?:\s*(?:<\/rb>)?\s*)(?:<rp>[^<]*<\/rp>)?\s*<rt>\s*([^<]*?)\s*<\/rt>(?:<rp>[^<]*<\/rp>)?\s*<\/ruby>/;

// 漢字に対する正規表現
const kanjiRegex = /[\p{Script=Han}々]+/gu;

export class RubyTags {
  private rubyMap: Map<string, string[]>;

  constructor(rubyMap: Map<string, string[]> = new Map()) {
    this.rubyMap = rubyMap;
  }

  // ファクトリーメソッド - BookContentからルビを抽出
  static extract(bookContent: BookContent | null): RubyTags {
    if (!bookContent) return new RubyTags();

    const mdx = bookContent.toMdx();
    const rubyMap = new Map<string, string[]>();

    const matches = [...mdx.matchAll(rubyTagRegex)];
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
      if (!rubyMap.has(kanjiText)) {
        rubyMap.set(kanjiText, [rubyText]);
      } else {
        rubyMap.get(kanjiText)?.push(rubyText);
      }
    }

    return new RubyTags(rubyMap);
  }

  // ルビマップの取得
  getRubyMap(): Map<string, string[]> {
    return new Map(this.rubyMap);
  }

  // 漢字へのルビタグ追加
  addPlaceholderRubyToKanji(text: string): string {
    // テキストがなければ空文字を返す
    if (!text) {
      return "";
    }

    // まず既存のrubyタグを一時的に置換して保護する
    interface RubyTagInfo {
      match: string; // 完全なrubyタグマッチ
      position: number; // テキスト内の位置
      length: number; // マッチの長さ
    }

    const rubyTags: RubyTagInfo[] = [];

    // 既存のrubyタグを見つけて配列に保存し、プレースホルダーに置き換える
    let protectedText = "";
    let lastIndex = 0;

    // すべてのマッチを一度に取得
    const matches = Array.from(text.matchAll(rubyTagRegex));

    // マッチした各rubyタグを処理
    for (const match of matches) {
      // indexプロパティの存在を確認（型安全のため）
      if (typeof match.index !== "number") {
        continue;
      }

      // マッチの前のテキストを追加
      protectedText += text.substring(lastIndex, match.index);

      // rubyタグの情報を保存
      const tagInfo: RubyTagInfo = {
        match: match[0],
        position: match.index,
        length: match[0].length,
      };

      // プレースホルダーを追加
      const placeholder = `__RUBY_TAG_${rubyTags.length}__`;
      protectedText += placeholder;

      rubyTags.push(tagInfo);
      lastIndex = match.index + match[0].length;
    }

    // 残りのテキストを追加
    protectedText += text.substring(lastIndex);

    // 漢字をrubyタグで囲む
    protectedText = protectedText.replace(kanjiRegex, (kanji) => {
      return `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
    });

    // プレースホルダーを元のrubyタグに戻す
    const finalText = protectedText.replace(/__RUBY_TAG_(\d+)__/g, (_, index) => {
      return rubyTags[parseInt(index)].match;
    });

    return finalText;
  }

  // 既存ルビを保持しながらルビタグ追加
  addRubyTagsWithPreservation(mdx: string): string {
    // 画像タグを保持するために置換する
    const imageTagRegex = /!\[.*?\]\(.*?\)/g;
    const imageTagInfos: string[] = [];
    let textWithImageProtected = mdx.replace(imageTagRegex, (match) => {
      const placeholder = `__IMAGE_TAG_${imageTagInfos.length}__`;
      imageTagInfos.push(match);
      return placeholder;
    });
    // rubyタグの情報を保持する配列
    interface RubyTagInfo {
      originalTag: string;
      kanji: string;
      ruby: string;
    }

    const rubyTagInfos: RubyTagInfo[] = [];

    // 既存のrubyタグを一時的に置換して保護すると同時に内容を解析
    let protectedText = textWithImageProtected.replace(rubyTagRegex, (match) => {
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

    // 漢字に対する処理
    let result = "";
    let lastIndex = 0;
    const matches = Array.from(protectedText.matchAll(/[\p{Script=Han}々]+/gu));

    for (const match of matches) {
      if (typeof match.index !== "number") continue;

      // マッチ前のテキストを追加
      const textBeforeMatch = protectedText.substring(lastIndex, match.index);

      // チェック: マッチ前のテキストにプレースホルダーが含まれているか
      const hasRubyTagBefore = textBeforeMatch.includes("__RUBY_TAG_");
      result += textBeforeMatch;

      // 現在の漢字順層がすでにプレースホルダー内にあるか確認
      const currentPosition = match.index;
      const isInsideRubyTag = rubyTagInfos.some((_info, idx) => {
        const placeholder = `__RUBY_TAG_${idx}__`;
        const placeholderPos = protectedText.indexOf(placeholder);
        if (placeholderPos === -1) return false;
        return (
          currentPosition > placeholderPos &&
          currentPosition < placeholderPos + placeholder.length
        );
      });

      const kanji = match[0];

      // すでにプレースホルダー内ならスキップ
      if (isInsideRubyTag || hasRubyTagBefore) {
        result += kanji;
        lastIndex = match.index + kanji.length;
        continue;
      }

      // 個々の漢字ごとに処理
      if (kanji.length === 1 && this.rubyMap.has(kanji)) {
        // 単一漢字で既存ルビがある場合
        const rubyArray = this.rubyMap.get(kanji)!;
        if (rubyArray.length > 0) {
          const rubyToUse = rubyArray[0];
          this.rubyMap.set(kanji, rubyArray.slice(1));
          result += `<ruby>${kanji}<rt>${rubyToUse}</rt></ruby>`;
        } else {
          result += `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
        }
      } else if (kanji.length > 1) {
        // 複合漢字の場合
        let processedKanji = "";
        let allHaveRuby = true;

        // 各文字ごとに確認
        for (const char of Array.from(kanji)) {
          if (!this.rubyMap.has(char) || this.rubyMap.get(char)!.length === 0) {
            allHaveRuby = false;
            break;
          }
        }

        if (allHaveRuby) {
          // すべての漢字に既存ルビがある場合は個別にルビを付ける
          for (const char of Array.from(kanji)) {
            const rubyArray = this.rubyMap.get(char)!;
            const rubyToUse = rubyArray[0];
            this.rubyMap.set(char, rubyArray.slice(1));
            processedKanji += `<ruby>${char}<rt>${rubyToUse}</rt></ruby>`;
          }
          result += processedKanji;
        } else {
          // 一部でも既存ルビがない場合はプレースホルダーを付ける
          result += `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
        }
      } else {
        // その他の場合はプレースホルダーを付ける
        result += `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
      }

      lastIndex = match.index + kanji.length;
    }

    // 残りのテキストを追加
    result += protectedText.substring(lastIndex);

    // プレースホルダーを元のrubyタグに戻す
    result = result.replace(/__RUBY_TAG_(\d+)__/g, (_, index) => {
      const idx = parseInt(index);
      if (idx >= 0 && idx < rubyTagInfos.length) {
        return rubyTagInfos[idx].originalTag;
      }
      return _;
    });

    // 画像タグのプレースホルダーを元に戻す
    result = result.replace(/__IMAGE_TAG_(\d+)__/g, (_, index) => {
      const idx = parseInt(index);
      if (idx >= 0 && idx < imageTagInfos.length) {
        return imageTagInfos[idx];
      }
      return _;
    });

    return result;
  }
}
