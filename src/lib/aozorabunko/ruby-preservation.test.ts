import { describe, expect, it } from "vitest";
import { addPlaceholderRubyToKanji } from "./htmlToMdx";

describe("Ruby tag preservation tests", () => {
  it("should preserve existing ruby tags while adding placeholders to other kanji", () => {
    const input =
      "これは<ruby>日本<rt>にほん</rt></ruby>語の<ruby>漢字<rt>かんじ</rt></ruby>です。他の漢字もあります。";
    const expected =
      "これは<ruby>日本<rt>にほん</rt></ruby><ruby>語<rt>{{required_ruby}}</rt></ruby>の<ruby>漢字<rt>かんじ</rt></ruby>です。<ruby>他<rt>{{required_ruby}}</rt></ruby>の<ruby>漢字<rt>{{required_ruby}}</rt></ruby>もあります。";

    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });

  it("should handle nested ruby tags correctly", () => {
    const input =
      "<div>これは<ruby>漢<rt>かん</rt></ruby>字です。<em><ruby>日本<rt>にほん</rt></ruby></em>語も書けます。</div>";
    const expected =
      "<div>これは<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>です。<em><ruby>日本<rt>にほん</rt></ruby></em><ruby>語<rt>{{required_ruby}}</rt></ruby>も<ruby>書<rt>{{required_ruby}}</rt></ruby>けます。</div>";

    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });

  it("should preserve ruby tags that contain nested HTML", () => {
    const input = "これは<ruby>複<rt><em>ふく</em></rt></ruby>雑なタグ構造です。";
    const expected =
      "これは<ruby>複<rt><em>ふく</em></rt></ruby><ruby>雑<rt>{{required_ruby}}</rt></ruby>なタグ<ruby>構造<rt>{{required_ruby}}</rt></ruby>です。";

    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });

  it("should handle ruby tags with complex structures", () => {
    const input = "<ruby><rb>漢</rb><rp>（</rp><rt>かん</rt><rp>）</rp></ruby>字と普通の漢字";
    // The complex ruby tag should be preserved as is and not get modified
    const expected =
      "<ruby><rb>漢</rb><rp>（</rp><rt>かん</rt><rp>）</rp></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>と<ruby>普通<rt>{{required_ruby}}</rt></ruby>の<ruby>漢字<rt>{{required_ruby}}</rt></ruby>";

    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });

  it("should handle multiple consecutive ruby tags", () => {
    const input =
      "<ruby>日<rt>に</rt></ruby><ruby>本<rt>ほん</rt></ruby><ruby>語<rt>ご</rt></ruby>は<ruby>美<rt>うつく</rt></ruby>しい";
    const expected =
      "<ruby>日<rt>に</rt></ruby><ruby>本<rt>ほん</rt></ruby><ruby>語<rt>ご</rt></ruby>は<ruby>美<rt>うつく</rt></ruby>しい";

    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });

  it("should handle edge case with ruby tags inside other tags", () => {
    const input = "<p>これは<span><ruby>漢<rt>かん</rt></ruby></span>字です。</p>";
    const expected =
      "<p>これは<span><ruby>漢<rt>かん</rt></ruby></span><ruby>字<rt>{{required_ruby}}</rt></ruby>です。</p>";

    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });

  it("should handle ruby tags with line breaks", () => {
    const input = "<ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>と<ruby>改行\n<rt>かいぎょう</rt></ruby>。";
    const expected = "<ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>と<ruby>改行\n<rt>かいぎょう</rt></ruby>。";

    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });
});
