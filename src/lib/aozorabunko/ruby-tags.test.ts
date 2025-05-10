import { describe, expect, it } from "vitest";
import { BookContent } from "@/features/book-content/core";
import { RubyTags } from "./ruby-tags";

describe("RubyTags", () => {
  describe("extract", () => {
    it("null または undefined の BookContent からは空のインスタンスを生成する", () => {
      const rubyTags = RubyTags.extract(null);
      expect(rubyTags).toBeInstanceOf(RubyTags);
      expect(rubyTags.getRubyMap().size).toBe(0);
    });

    it("ルビのない BookContent からは空のマップを持つインスタンスを生成する", () => {
      const bookContent = new BookContent("これはテストです。ルビはありません。");
      const rubyTags = RubyTags.extract(bookContent);
      expect(rubyTags.getRubyMap().size).toBe(0);
    });

    it("ルビのある BookContent から正しくルビを抽出する", () => {
      const content = "<ruby>漢字<rt>かんじ</rt></ruby>と<ruby>日本<rt>にほん</rt></ruby>語";
      const bookContent = new BookContent(content);
      const rubyTags = RubyTags.extract(bookContent);

      const rubyMap = rubyTags.getRubyMap();
      expect(rubyMap.size).toBe(2);
      expect(rubyMap.get("漢字")).toEqual(["かんじ"]);
      expect(rubyMap.get("日本")).toEqual(["にほん"]);
    });

    it("複合ルビタグから正しくルビを抽出する", () => {
      const content =
        "<ruby><rb>漢</rb><rp>（</rp><rt>かん</rt><rp>）</rp></ruby><ruby><rb>字</rb><rp>（</rp><rt>じ</rt><rp>）</rp></ruby>";
      const bookContent = new BookContent(content);
      const rubyTags = RubyTags.extract(bookContent);

      const rubyMap = rubyTags.getRubyMap();
      expect(rubyMap.size).toBe(2);
      expect(rubyMap.get("漢")).toEqual(["かん"]);
      expect(rubyMap.get("字")).toEqual(["じ"]);
    });

    it("プレースホルダールビは無視する", () => {
      const content = "<ruby>漢字<rt>{{required_ruby}}</rt></ruby>";
      const bookContent = new BookContent(content);
      const rubyTags = RubyTags.extract(bookContent);

      expect(rubyTags.getRubyMap().size).toBe(0);
    });

    it("同じ漢字に対する複数のルビを正しく処理する", () => {
      const content =
        "これは<ruby>漢<rt>かん</rt></ruby>字です。<ruby>漢<rt>ちゅう</rt></ruby>民国です。";
      const bookContent = new BookContent(content);
      const rubyTags = RubyTags.extract(bookContent);

      const rubyMap = rubyTags.getRubyMap();
      expect(rubyMap.size).toBe(1);
      expect(rubyMap.get("漢")).toEqual(["かん", "ちゅう"]);
    });
  });

  describe("addPlaceholderRubyToKanji", () => {
    it("漢字にプレースホルダーを追加する", () => {
      const rubyTags = new RubyTags();
      const result = rubyTags.addPlaceholderRubyToKanji("漢字");

      expect(result).toBe("<ruby>漢字<rt>{{required_ruby}}</rt></ruby>");
    });

    it("非漢字文字は変更しない", () => {
      const rubyTags = new RubyTags();
      const text = "かな文字とアルファベットabc";
      const result = rubyTags.addPlaceholderRubyToKanji(text);

      expect(result).toBe("かな<ruby>文字<rt>{{required_ruby}}</rt></ruby>とアルファベットabc");
    });

    it("既存のルビタグを保持する", () => {
      const rubyTags = new RubyTags();
      const text = "<ruby>漢<rt>かん</rt></ruby>字";
      const result = rubyTags.addPlaceholderRubyToKanji(text);

      expect(result).toBe(
        "<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>",
      );
    });

    it("複合ルビタグも保持する", () => {
      const rubyTags = new RubyTags();
      const text = "<ruby><rb>漢</rb><rp>（</rp><rt>かん</rt><rp>）</rp></ruby>字";
      const result = rubyTags.addPlaceholderRubyToKanji(text);

      expect(result).toBe(
        "<ruby><rb>漢</rb><rp>（</rp><rt>かん</rt><rp>）</rp></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>",
      );
    });

    it("複雑なHTMLを含む文字列も正しく処理する", () => {
      const rubyTags = new RubyTags();
      const text = "<p>これは<ruby>漢<rt>かん</rt></ruby>字と<em>日本</em>語です</p>";
      const result = rubyTags.addPlaceholderRubyToKanji(text);

      expect(result).toBe(
        "<p>これは<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>と<em><ruby>日本<rt>{{required_ruby}}</rt></ruby></em><ruby>語<rt>{{required_ruby}}</rt></ruby>です</p>",
      );
    });
  });

  describe("addRubyTagsWithPreservation", () => {
    it("既存のルビマップに基づいて漢字にルビを追加する", () => {
      const rubyMap = new Map([
        ["漢", ["かん"]],
        ["字", ["じ"]],
      ]);
      const rubyTags = new RubyTags(rubyMap);

      const mdx = "漢字";
      const result = rubyTags.addRubyTagsWithPreservation(mdx);

      expect(result).toBe("<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>じ</rt></ruby>");
    });

    it("既存のルビタグを保持する", () => {
      const rubyMap = new Map([
        ["漢", ["かん"]],
        ["字", ["じ"]],
      ]);
      const rubyTags = new RubyTags(rubyMap);

      const mdx = "<ruby>日<rt>に</rt></ruby>本漢字";
      const result = rubyTags.addRubyTagsWithPreservation(mdx);

      expect(result).toBe(
        "<ruby>日<rt>に</rt></ruby><ruby>本<rt>{{required_ruby}}</rt></ruby><ruby>漢<rt>かん</rt></ruby><ruby>字<rt>じ</rt></ruby>",
      );
    });

    it("ルビマップにない漢字にはプレースホルダーを使用する", () => {
      const rubyMap = new Map([["漢", ["かん"]]]);
      const rubyTags = new RubyTags(rubyMap);

      const mdx = "漢字";
      const result = rubyTags.addRubyTagsWithPreservation(mdx);

      expect(result).toBe(
        "<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>",
      );
    });

    it("同じ漢字の複数の出現に対して異なるルビを使用する", () => {
      const rubyMap = new Map([["漢", ["かん", "かん2"]]]);
      const rubyTags = new RubyTags(rubyMap);

      const mdx = "漢文と漢字";
      const result = rubyTags.addRubyTagsWithPreservation(mdx);

      expect(result).toBe(
        "<ruby>漢<rt>かん</rt></ruby><ruby>文<rt>{{required_ruby}}</rt></ruby>と<ruby>漢<rt>かん2</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>",
      );
    });

    it("複合漢字が部分的にルビマップにある場合はプレースホルダーを使用する", () => {
      const rubyMap = new Map([
        ["漢", ["かん"]],
        // "字"にはルビがない
      ]);
      const rubyTags = new RubyTags(rubyMap);

      const mdx = "漢字";
      const result = rubyTags.addRubyTagsWithPreservation(mdx);

      // "漢字"全体に対してプレースホルダーを使用
      expect(result).toBe("<ruby>漢字<rt>{{required_ruby}}</rt></ruby>");
    });

    it("ルビマップが空の場合はすべての漢字にプレースホルダーを使用する", () => {
      const rubyTags = new RubyTags();

      const mdx = "漢字と日本語";
      const result = rubyTags.addRubyTagsWithPreservation(mdx);

      expect(result).toBe(
        "<ruby>漢字<rt>{{required_ruby}}</rt></ruby>と<ruby>日本語<rt>{{required_ruby}}</rt></ruby>",
      );
    });
  });
});
