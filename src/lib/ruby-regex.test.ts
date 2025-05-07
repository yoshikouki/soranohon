import { describe, expect, it } from "vitest";
import { rubyContentRegex, rubyTagRegex } from "./ruby-utils";

/**
 * このテストファイルは、ルビタグ用の正規表現パターンをテストします。
 *
 * 1. rubyTagRegex: HTMLテキスト内の全てのルビタグを検出するためのグローバル正規表現
 * 2. rubyContentRegex: 単一のルビタグから漢字とルビを抽出するための正規表現
 */

describe("Ruby regex patterns", () => {
  describe("rubyTagRegex", () => {
    it("should match standard ruby tags", () => {
      const text = "これは<ruby>漢字<rt>かんじ</rt></ruby>のテストです";
      const matches = [...text.matchAll(rubyTagRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][0]).toBe("<ruby>漢字<rt>かんじ</rt></ruby>");
    });

    it("should match ruby tags with rb elements", () => {
      const text = "これは<ruby><rb>漢字</rb><rt>かんじ</rt></ruby>のテストです";
      const matches = [...text.matchAll(rubyTagRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][0]).toBe("<ruby><rb>漢字</rb><rt>かんじ</rt></ruby>");
    });

    it("should match ruby tags with rp elements", () => {
      const text =
        "これは<ruby><rb>漢字</rb><rp>（</rp><rt>かんじ</rt><rp>）</rp></ruby>のテストです";
      const matches = [...text.matchAll(rubyTagRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][0]).toBe(
        "<ruby><rb>漢字</rb><rp>（</rp><rt>かんじ</rt><rp>）</rp></ruby>",
      );
    });

    it("should match ruby tags with line breaks", () => {
      const text = "これは<ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>のテストです";
      const matches = [...text.matchAll(rubyTagRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][0]).toBe("<ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>");
    });

    it("should match multiple ruby tags", () => {
      const text = "<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>じ</rt></ruby>";
      const matches = [...text.matchAll(rubyTagRegex)];
      expect(matches.length).toBe(2);
      expect(matches[0][0]).toBe("<ruby>漢<rt>かん</rt></ruby>");
      expect(matches[1][0]).toBe("<ruby>字<rt>じ</rt></ruby>");
    });

    it("should match ruby tags in complex HTML", () => {
      const text =
        "<p>これは<span><ruby>複雑<rt>ふくざつ</rt></ruby></span>な<div>HTML<ruby>構造<rt>こうぞう</rt></ruby></div>です</p>";
      const matches = [...text.matchAll(rubyTagRegex)];
      expect(matches.length).toBe(2);
      expect(matches[0][0]).toBe("<ruby>複雑<rt>ふくざつ</rt></ruby>");
      expect(matches[1][0]).toBe("<ruby>構造<rt>こうぞう</rt></ruby>");
    });
  });

  describe("rubyContentRegex", () => {
    it("should extract kanji and ruby from standard ruby tags", () => {
      const rubyTag = "<ruby>漢字<rt>かんじ</rt></ruby>";
      const match = rubyContentRegex.exec(rubyTag);
      expect(match).not.toBeNull();
      expect(match![1]).toBe("漢字");
      expect(match![2]).toBe("かんじ");
    });

    it("should extract kanji and ruby from ruby tags with rb elements", () => {
      const rubyTag = "<ruby><rb>漢字</rb><rt>かんじ</rt></ruby>";
      const match = rubyContentRegex.exec(rubyTag);
      expect(match).not.toBeNull();
      expect(match![1]).toBe("漢字");
      expect(match![2]).toBe("かんじ");
    });

    it("should extract kanji and ruby from ruby tags with rp elements", () => {
      const rubyTag = "<ruby><rb>漢字</rb><rp>（</rp><rt>かんじ</rt><rp>）</rp></ruby>";
      const match = rubyContentRegex.exec(rubyTag);
      expect(match).not.toBeNull();
      expect(match![1]).toBe("漢字");
      expect(match![2]).toBe("かんじ");
    });

    it("should handle ruby tags with line breaks", () => {
      // Improved regex should handle line breaks properly
      const rubyTag = "<ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>";
      const match = rubyContentRegex.exec(rubyTag);

      // With the improved regex, these expectations should now pass
      expect(match).not.toBeNull();
      expect(match![1]).toBe("漢字");
      expect(match![2]).toBe("かんじ");
    });

    it("should extract single kanji and ruby", () => {
      const rubyTag = "<ruby>漢<rt>かん</rt></ruby>";
      const match = rubyContentRegex.exec(rubyTag);
      expect(match).not.toBeNull();
      expect(match![1]).toBe("漢");
      expect(match![2]).toBe("かん");
    });

    it("should extract non-kanji characters and ruby", () => {
      const rubyTag = "<ruby>ABC<rt>エービーシー</rt></ruby>";
      const match = rubyContentRegex.exec(rubyTag);
      expect(match).not.toBeNull();
      expect(match![1]).toBe("ABC");
      expect(match![2]).toBe("エービーシー");
    });

    it("should extract placeholder ruby", () => {
      const rubyTag = "<ruby>漢字<rt>{{required_ruby}}</rt></ruby>";
      const match = rubyContentRegex.exec(rubyTag);
      expect(match).not.toBeNull();
      expect(match![1]).toBe("漢字");
      expect(match![2]).toBe("{{required_ruby}}");
    });
  });

  describe("Edge cases for both regex patterns", () => {
    it("should handle nested ruby tags", () => {
      // Nested ruby tags in HTML context
      const text =
        "<p><ruby>外側<rt>そとがわ</rt></ruby><ruby>内側<rt>うちがわ</rt></ruby></p>";

      // The global regex should match both tags
      const matches = [...text.matchAll(rubyTagRegex)];
      expect(matches.length).toBe(2);

      // Both tags should be extracted correctly
      const firstMatch = rubyContentRegex.exec(matches[0][0]);
      expect(firstMatch![1]).toBe("外側");
      expect(firstMatch![2]).toBe("そとがわ");

      const secondMatch = rubyContentRegex.exec(matches[1][0]);
      expect(secondMatch![1]).toBe("内側");
      expect(secondMatch![2]).toBe("うちがわ");
    });

    it("should handle empty ruby tags", () => {
      const text = "<ruby><rt></rt></ruby>";
      const matches = [...text.matchAll(rubyTagRegex)];
      expect(matches.length).toBe(1);

      const match = rubyContentRegex.exec(matches[0][0]);
      expect(match![1]).toBe("");
      expect(match![2]).toBe("");
    });

    it("should handle special characters in ruby", () => {
      const text = "<ruby>特殊文字<rt>！＃＆？￥</rt></ruby>";
      const matches = [...text.matchAll(rubyTagRegex)];
      expect(matches.length).toBe(1);

      const match = rubyContentRegex.exec(matches[0][0]);
      expect(match![1]).toBe("特殊文字");
      expect(match![2]).toBe("！＃＆？￥");
    });
  });
});
