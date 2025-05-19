import { describe, expect, it } from "vitest";
import { BookContent } from "@/features/book-content/core";
import { RubyTags } from "./ruby-tags";

describe("複雑なRubyタグの処理", () => {
  describe("様々な形式のルビタグ抽出", () => {
    it("異なる形式のルビタグを正しく抽出できる", () => {
      // 様々な形式のルビタグを含むコンテンツ
      const content = `
        <ruby><rb>漢</rb><rp>（</rp><rt>かん</rt><rp>）</rp></ruby><ruby><rb>字</rb><rp>（</rp><rt>じ</rt><rp>）</rp></ruby>と
        <ruby>日本<rt>にほん</rt></ruby>語と
        <ruby>F<rt>エフ</rt></ruby>
      `;

      const bookContent = new BookContent(content);
      const rubyTags = RubyTags.extract(bookContent);
      const rubyMap = rubyTags.getRubyMap();

      // 各形式のルビが正しく抽出されているか確認
      expect(rubyMap.get("漢")).toEqual(["かん"]);
      expect(rubyMap.get("字")).toEqual(["じ"]);
      expect(rubyMap.get("日本")).toEqual(["にほん"]);
      expect(rubyMap.get("F")).toEqual(["エフ"]);
    });
  });

  describe("複雑なテキスト処理", () => {
    it("既存のルビタグが保持される", () => {
      const rubyTags = new RubyTags();
      const complexRubyText =
        "<ruby><rb>漢</rb><rp>（</rp><rt>かん</rt><rp>）</rp></ruby><ruby><rb>字</rb><rp>（</rp><rt>じ</rt><rp>）</rp></ruby>と<ruby>仮名<rt>かな</rt></ruby>";

      // addPlaceholderRubyToKanjiメソッドは既存のルビタグを保持する
      const result = rubyTags.addPlaceholderRubyToKanji(complexRubyText);

      // 既存のルビタグが保持されていることを確認
      expect(result).toContain("<ruby><rb>漢</rb><rp>（</rp><rt>かん</rt><rp>）</rp></ruby>");
      expect(result).toContain("<ruby><rb>字</rb><rp>（</rp><rt>じ</rt><rp>）</rp></ruby>");
      expect(result).toContain("<ruby>仮名<rt>かな</rt></ruby>");
    });

    it("プレーンテキスト中の漢字にルビプレースホルダーを追加する", () => {
      const rubyTags = new RubyTags();
      const text = "漢字と仮名";

      // addPlaceholderRubyToKanjiメソッドは漢字にルビプレースホルダーを追加する
      const result = rubyTags.addPlaceholderRubyToKanji(text);

      // 漢字部分だけがルビプレースホルダーに変換されていることを確認
      expect(result).toContain("<ruby>漢字<rt>{{required_ruby}}</rt></ruby>");
      expect(result).toContain("<ruby>仮名<rt>{{required_ruby}}</rt></ruby>");
      expect(result).toBe(
        "<ruby>漢字<rt>{{required_ruby}}</rt></ruby>と<ruby>仮名<rt>{{required_ruby}}</rt></ruby>",
      );
    });
  });

  describe("ルビマップを使った処理", () => {
    it("ルビマップの内容に基づいて単一漢字にルビを追加する", () => {
      // 単一漢字のルビを含むマップ
      const rubyMap = new Map([
        ["漢", ["かん"]],
        ["字", ["じ"]],
      ]);

      const rubyTags = new RubyTags(rubyMap);
      const text = "漢字";

      // addRubyTagsWithPreservationメソッドはルビマップの内容に基づいてルビを追加
      const result = rubyTags.addRubyTagsWithPreservation(text);

      // 結果を検証 - ただし実際の結果はRubyTagsの実装に依存
      expect(result).toContain("<ruby>漢");
      expect(result).toContain("<rt>かん</rt>");
      expect(result).toContain("<ruby>字");
      expect(result).toContain("<rt>じ</rt>");
    });

    it("既存ルビタグを保持しながら新しい漢字にルビを追加する", () => {
      // ルビマップを作成
      const rubyMap = new Map([
        ["漢", ["かん"]],
        ["字", ["じ"]],
      ]);

      const rubyTags = new RubyTags(rubyMap);
      const text = "<ruby>日<rt>に</rt></ruby>本と漢字";

      // 既存ルビタグを保持しながら新しい漢字にルビを追加
      const result = rubyTags.addRubyTagsWithPreservation(text);

      // 既存のルビタグが保持され、新しい漢字にルビが追加されていることを確認
      expect(result).toContain("<ruby>日<rt>に</rt></ruby>");
      expect(result).toContain("<ruby>漢");
      expect(result).toContain("<rt>かん</rt>");
    });
  });
});
