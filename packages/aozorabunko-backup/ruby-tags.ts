import { BookContentInterface } from "./book-content-interface";

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

  static extract(bookContent: BookContentInterface | null): RubyTags {
    if (!bookContent) return new RubyTags();

    const mdx = bookContent.toMdx();
    const rubyMap = new Map<string, string[]>();

    const matches = [...mdx.matchAll(rubyTagRegex)];
    for (const match of matches) {
      const fullMatch = match[0];
      const contentMatch = rubyContentRegex.exec(fullMatch);

      if (!contentMatch) continue;

      const kanjiText = contentMatch[1]?.trim();
      const rubyText = contentMatch[2]?.trim();

      if (!rubyText || rubyText === "{{required_ruby}}" || !kanjiText) continue;

      if (!rubyMap.has(kanjiText)) {
        rubyMap.set(kanjiText, [rubyText]);
      } else {
        rubyMap.get(kanjiText)?.push(rubyText);
      }
    }

    return new RubyTags(rubyMap);
  }

  getRubyMap(): Map<string, string[]> {
    return new Map(this.rubyMap);
  }

  addPlaceholderRubyToKanji(text: string): string {
    if (!text) {
      return "";
    }

    interface RubyTagInfo {
      match: string;
      position: number;
      length: number;
    }

    const rubyTags: RubyTagInfo[] = [];

    let protectedText = "";
    let lastIndex = 0;

    const matches = Array.from(text.matchAll(rubyTagRegex));

    for (const match of matches) {
      if (typeof match.index !== "number") {
        continue;
      }

      protectedText += text.substring(lastIndex, match.index);

      const tagInfo: RubyTagInfo = {
        match: match[0],
        position: match.index,
        length: match[0].length,
      };

      const placeholder = `__RUBY_TAG_${rubyTags.length}__`;
      protectedText += placeholder;

      rubyTags.push(tagInfo);
      lastIndex = match.index + match[0].length;
    }

    protectedText += text.substring(lastIndex);

    protectedText = protectedText.replace(kanjiRegex, (kanji) => {
      return `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
    });

    const finalText = protectedText.replace(/__RUBY_TAG_(\d+)__/g, (_, index) => {
      return rubyTags[parseInt(index)].match;
    });

    return finalText;
  }

  addRubyTagsWithPreservation(mdx: string): string {
    const imageTagRegex = /!\[.*?\]\(.*?\)/g;
    const imageTagInfos: string[] = [];
    let textWithImageProtected = mdx.replace(imageTagRegex, (match) => {
      const placeholder = `__IMAGE_TAG_${imageTagInfos.length}__`;
      imageTagInfos.push(match);
      return placeholder;
    });
    interface RubyTagInfo {
      originalTag: string;
      kanji: string;
      ruby: string;
    }

    const rubyTagInfos: RubyTagInfo[] = [];

    let protectedText = textWithImageProtected.replace(rubyTagRegex, (match) => {
      const contentMatch = rubyContentRegex.exec(match);
      if (contentMatch) {
        const kanji = contentMatch[1]?.trim() || "";
        const ruby = contentMatch[2]?.trim() || "";

        const placeholder = `__RUBY_TAG_${rubyTagInfos.length}__`;

        rubyTagInfos.push({
          originalTag: match,
          kanji,
          ruby,
        });

        return placeholder;
      }

      const placeholder = `__RUBY_TAG_${rubyTagInfos.length}__`;
      rubyTagInfos.push({
        originalTag: match,
        kanji: "",
        ruby: "",
      });
      return placeholder;
    });

    let result = "";
    let lastIndex = 0;
    const matches = Array.from(protectedText.matchAll(/[\p{Script=Han}々]+/gu));

    for (const match of matches) {
      if (typeof match.index !== "number") continue;

      const textBeforeMatch = protectedText.substring(lastIndex, match.index);

      const hasRubyTagBefore = textBeforeMatch.includes("__RUBY_TAG_");
      result += textBeforeMatch;

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

      if (isInsideRubyTag || hasRubyTagBefore) {
        result += kanji;
        lastIndex = match.index + kanji.length;
        continue;
      }

      if (kanji.length === 1 && this.rubyMap.has(kanji)) {
        const rubyArray = this.rubyMap.get(kanji)!;
        if (rubyArray.length > 0) {
          const rubyToUse = rubyArray[0];
          this.rubyMap.set(kanji, rubyArray.slice(1));
          result += `<ruby>${kanji}<rt>${rubyToUse}</rt></ruby>`;
        } else {
          result += `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
        }
      } else if (kanji.length > 1) {
        let processedKanji = "";
        let allHaveRuby = true;

        for (const char of Array.from(kanji)) {
          if (!this.rubyMap.has(char) || this.rubyMap.get(char)!.length === 0) {
            allHaveRuby = false;
            break;
          }
        }

        if (allHaveRuby) {
          for (const char of Array.from(kanji)) {
            const rubyArray = this.rubyMap.get(char)!;
            const rubyToUse = rubyArray[0];
            this.rubyMap.set(char, rubyArray.slice(1));
            processedKanji += `<ruby>${char}<rt>${rubyToUse}</rt></ruby>`;
          }
          result += processedKanji;
        } else {
          result += `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
        }
      } else {
        result += `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
      }

      lastIndex = match.index + kanji.length;
    }

    result += protectedText.substring(lastIndex);

    result = result.replace(/__RUBY_TAG_(\d+)__/g, (_, index) => {
      const idx = parseInt(index);
      if (idx >= 0 && idx < rubyTagInfos.length) {
        return rubyTagInfos[idx].originalTag;
      }
      return _;
    });

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
