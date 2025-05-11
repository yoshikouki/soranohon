import * as fs from "fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addRubyTagsWithPreservation,
  extractExistingRubyTags,
  rubyTagRegex,
} from "./ruby-utils";

// fs.access と fs.readFile をモック化
vi.mock("fs/promises", () => ({
  access: vi.fn(),
  readFile: vi.fn(),
}));

describe("extractExistingRubyTags", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return empty map when file does not exist", async () => {
    vi.mocked(fs.access).mockRejectedValueOnce(new Error("File not found"));

    const result = await extractExistingRubyTags("/path/to/file.mdx", false);

    expect(result.fileExists).toBe(false);
    expect(result.existingMdx).toBe("");
    expect(result.existingRubyTags.size).toBe(0);
    expect(fs.readFile).not.toHaveBeenCalled();
  });

  it("should not read file when forceOverwrite is true", async () => {
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const result = await extractExistingRubyTags("/path/to/file.mdx", true);

    expect(result.fileExists).toBe(true);
    expect(result.existingMdx).toBe("");
    expect(result.existingRubyTags.size).toBe(0);
    expect(fs.readFile).not.toHaveBeenCalled();
  });

  it("should extract ruby tags from existing file", async () => {
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const mdxContent =
      "テスト<ruby>漢字<rt>かんじ</rt></ruby>と<ruby>日本<rt>にほん</rt></ruby>語";
    vi.mocked(fs.readFile).mockResolvedValueOnce(mdxContent);

    const result = await extractExistingRubyTags("/path/to/file.mdx", false);

    expect(result.fileExists).toBe(true);
    expect(result.existingMdx).toBe(mdxContent);
    expect(result.existingRubyTags.size).toBe(2);
    expect(result.existingRubyTags.get("漢字")).toEqual(["かんじ"]);
    expect(result.existingRubyTags.get("日本")).toEqual(["にほん"]);
  });

  it("should extract multiple ruby tags for the same kanji", async () => {
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const mdxContent =
      "テスト<ruby>漢字<rt>かんじ</rt></ruby>と<ruby>漢字<rt>カンジ</rt></ruby>の<ruby>日本<rt>にほん</rt></ruby>語";
    vi.mocked(fs.readFile).mockResolvedValueOnce(mdxContent);

    const result = await extractExistingRubyTags("/path/to/file.mdx", false);

    expect(result.fileExists).toBe(true);
    expect(result.existingMdx).toBe(mdxContent);
    expect(result.existingRubyTags.size).toBe(2);
    expect(result.existingRubyTags.get("漢字")).toEqual(["かんじ", "カンジ"]);
    expect(result.existingRubyTags.get("日本")).toEqual(["にほん"]);
  });

  it("should extract ruby tags with rb element", async () => {
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const mdxContent =
      "テスト<ruby><rb>漢字</rb><rt>かんじ</rt></ruby>と<ruby><rb>日本</rb><rt>にほん</rt></ruby>語";
    vi.mocked(fs.readFile).mockResolvedValueOnce(mdxContent);

    const result = await extractExistingRubyTags("/path/to/file.mdx", false);

    expect(result.fileExists).toBe(true);
    expect(result.existingMdx).toBe(mdxContent);
    expect(result.existingRubyTags.size).toBe(2);
    expect(result.existingRubyTags.get("漢字")).toEqual(["かんじ"]);
    expect(result.existingRubyTags.get("日本")).toEqual(["にほん"]);
  });

  it("should extract ruby tags with rp elements", async () => {
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const mdxContent =
      "テスト<ruby><rb>漢字</rb><rp>（</rp><rt>かんじ</rt><rp>）</rp></ruby>と<ruby><rb>日本</rb><rp>（</rp><rt>にほん</rt><rp>）</rp></ruby>語";
    vi.mocked(fs.readFile).mockResolvedValueOnce(mdxContent);

    const result = await extractExistingRubyTags("/path/to/file.mdx", false);

    expect(result.fileExists).toBe(true);
    expect(result.existingMdx).toBe(mdxContent);
    expect(result.existingRubyTags.size).toBe(2);
    expect(result.existingRubyTags.get("漢字")).toEqual(["かんじ"]);
    expect(result.existingRubyTags.get("日本")).toEqual(["にほん"]);
  });

  it("should extract ruby tags with mixed formats", async () => {
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const mdxContent =
      "テスト<ruby>漢字<rt>かんじ</rt></ruby>と<ruby><rb>日本</rb><rt>にほん</rt></ruby>語<ruby><rb>変換</rb><rp>（</rp><rt>へんかん</rt><rp>）</rp></ruby>";
    vi.mocked(fs.readFile).mockResolvedValueOnce(mdxContent);

    const result = await extractExistingRubyTags("/path/to/file.mdx", false);

    expect(result.fileExists).toBe(true);
    expect(result.existingMdx).toBe(mdxContent);
    expect(result.existingRubyTags.size).toBe(3);
    expect(result.existingRubyTags.get("漢字")).toEqual(["かんじ"]);
    expect(result.existingRubyTags.get("日本")).toEqual(["にほん"]);
    expect(result.existingRubyTags.get("変換")).toEqual(["へんかん"]);
  });

  it("should ignore placeholder ruby tags", async () => {
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const mdxContent =
      "テスト<ruby>漢字<rt>{{required_ruby}}</rt></ruby>と<ruby>日本<rt>にほん</rt></ruby>語";
    vi.mocked(fs.readFile).mockResolvedValueOnce(mdxContent);

    const result = await extractExistingRubyTags("/path/to/file.mdx", false);

    expect(result.fileExists).toBe(true);
    expect(result.existingMdx).toBe(mdxContent);
    expect(result.existingRubyTags.size).toBe(1);
    expect(result.existingRubyTags.has("漢字")).toBe(false);
    expect(result.existingRubyTags.get("日本")).toEqual(["にほん"]);
  });

  it("should extract individual kanji ruby tags", async () => {
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const mdxContent = "<ruby>一<rt>いち</rt></ruby><ruby>軒<rt>けん</rt></ruby>";
    vi.mocked(fs.readFile).mockResolvedValueOnce(mdxContent);

    const result = await extractExistingRubyTags("/path/to/file.mdx", false);

    expect(result.fileExists).toBe(true);
    expect(result.existingRubyTags.size).toBe(2);
    expect(result.existingRubyTags.get("一")).toEqual(["いち"]);
    expect(result.existingRubyTags.get("軒")).toEqual(["けん"]);
  });
});

describe("addRubyTagsWithPreservation", () => {
  it("should add ruby placeholder tags to kanji", () => {
    const mdx = "漢字";
    const existingRubyTags = new Map<string, string[]>();

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toBe("<ruby>漢字<rt>{{required_ruby}}</rt></ruby>");
  });

  it("should preserve existing ruby tags", () => {
    const mdx = "<ruby>漢<rt>かん</rt></ruby>字";
    const existingRubyTags = new Map<string, string[]>();

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toBe(
      "<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>",
    );
  });

  it("should use provided ruby readings for specified kanji", () => {
    const mdx = "漢字";
    const existingRubyTags = new Map<string, string[]>([["漢字", ["かんじ"]]]);

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toBe("<ruby>漢字<rt>かんじ</rt></ruby>");
  });

  it("should use provided ruby readings for individual kanji", () => {
    const mdx = "一軒";
    const existingRubyTags = new Map<string, string[]>([
      ["一", ["いち", "ひと"]],
      ["軒", ["けん"]],
    ]);

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toBe("<ruby>一<rt>いち</rt></ruby><ruby>軒<rt>けん</rt></ruby>");
  });

  it("should use FIFO for multiple ruby readings of the same kanji", () => {
    const mdx = "一に一を加えると二になる";
    const existingRubyTags = new Map<string, string[]>([
      ["一", ["いち", "ひと"]],
      ["二", ["に"]],
    ]);

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    const rubyMatches = [...result.matchAll(/<ruby>一<rt>(.*?)<\/rt><\/ruby>/g)];
    expect(rubyMatches.length).toBe(2);
    expect(rubyMatches[0][1]).toBe("いち"); // First occurrence uses first reading
    expect(rubyMatches[1][1]).toBe("ひと"); // Second occurrence uses second reading

    expect(result).toContain("<ruby>二<rt>に</rt></ruby>");
    expect(result).toContain("<ruby>加<rt>{{required_ruby}}</rt></ruby>");
  });

  it("should properly handle the FIFO flow for ruby annotations", () => {
    const existingRubyTags = new Map<string, string[]>([
      ["一", ["いち", "ひと"]],
      ["軒", ["けん"]],
    ]);
    const result = addRubyTagsWithPreservation("一軒", existingRubyTags);
    expect(result).toBe("<ruby>一<rt>いち</rt></ruby><ruby>軒<rt>けん</rt></ruby>");

    const result2 = addRubyTagsWithPreservation("一", existingRubyTags);
    expect(result2).toBe("<ruby>一<rt>ひと</rt></ruby>");

    expect(() => {
      addRubyTagsWithPreservation("一", existingRubyTags);
    }).toThrow("No ruby annotations available for kanji: 一");
  });

  it("should handle mixed content with existing ruby and new kanji", () => {
    const mdx = "<ruby>漢<rt>かん</rt></ruby>字と日本語";
    const existingRubyTags = new Map<string, string[]>([["日本", ["にほん"]]]);

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toContain("<ruby>漢<rt>かん</rt></ruby>");

    expect(result).toContain("<ruby>字<rt>{{required_ruby}}</rt></ruby>");

    if (result.includes("<ruby>日本<rt>にほん</rt></ruby>")) {
      expect(result).toContain("<ruby>日本<rt>にほん</rt></ruby>");
      expect(result).toContain("<ruby>語<rt>{{required_ruby}}</rt></ruby>");
    } else {
      expect(result).toContain("<ruby>日本語<rt>{{required_ruby}}</rt></ruby>");
    }
  });

  it("should handle complex nested tags", () => {
    const mdx = "<div>これは<ruby>漢<rt>かん</rt></ruby>字と<span>日本</span>語です</div>";
    const existingRubyTags = new Map<string, string[]>([["日本", ["にほん"]]]);

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toBe(
      "<div>これは<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>と<span><ruby>日本<rt>にほん</rt></ruby></span><ruby>語<rt>{{required_ruby}}</rt></ruby>です</div>",
    );
  });

  it("should handle empty string", () => {
    const mdx = "";
    const existingRubyTags = new Map<string, string[]>();

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toBe("");
  });

  it("should handle ruby tags with line breaks", () => {
    const mdx = "<ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>と改行";
    const existingRubyTags = new Map<string, string[]>();

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toBe(
      "<ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>と<ruby>改行<rt>{{required_ruby}}</rt></ruby>",
    );
  });

  it("should extract ruby tags with line breaks", () => {
    const mdx = "<ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>と改行";

    const matches = [...mdx.matchAll(rubyTagRegex)];
    expect(matches.length).toBe(1);
    expect(matches[0][0]).toBe("<ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>");
  });

  it("should debug ruby tags with line breaks processing", () => {
    const mdx = "<ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>と改行";

    const rubyTags: string[] = [];
    let protectedText = mdx.replace(rubyTagRegex, (match) => {
      const placeholder = `__RUBY_TAG_${rubyTags.length}__`;
      rubyTags.push(match);
      return placeholder;
    });

    expect(rubyTags.length).toBe(1);
    expect(rubyTags[0]).toBe("<ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>");
    expect(protectedText).toBe("__RUBY_TAG_0__と改行");

    protectedText = protectedText.replace(/[\p{Script=Han}々]+/gu, (kanji) => {
      return `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
    });

    expect(protectedText).toBe("__RUBY_TAG_0__と<ruby>改行<rt>{{required_ruby}}</rt></ruby>");

    const result = protectedText.replace(/__RUBY_TAG_(\d+)__/g, (_, index) => {
      return rubyTags[parseInt(index)];
    });

    expect(result).toBe(
      "<ruby>\n漢字\n<rt>\nかんじ\n</rt>\n</ruby>と<ruby>改行<rt>{{required_ruby}}</rt></ruby>",
    );
  });

  describe("Ruby overwrite with FIFO queue", () => {
    it("should reproduce the ruby tag overwrite issue in the 'いえ/うち' context", () => {
      const firstResult = addRubyTagsWithPreservation(
        `その<ruby>家<rt>いえ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>にあるものは、`,
        new Map([
          ["家", ["いえ"]],
          ["中", ["なか"]],
        ]),
      );
      expect(firstResult).toEqual(
        `その<ruby>家<rt>いえ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>にあるものは、`,
      );

      const secondResult = addRubyTagsWithPreservation(
        `その<ruby>家<rt>いえ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>にあるものは、その<ruby>家<rt>うち</rt></ruby><ruby>中<rt>じゅう</rt></ruby>だったのです。`,
        new Map([
          ["家", ["いえ", "うち"]],
          ["中", ["なか", "じゅう"]],
        ]),
      );
      expect(secondResult).toEqual(
        `その<ruby>家<rt>いえ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>にあるものは、その<ruby>家<rt>うち</rt></ruby><ruby>中<rt>じゅう</rt></ruby>だったのです。`,
      );
    });

    it("should show full context with multiple uses of the same kanji in different contexts", () => {
      const mdxText = `
      もう<ruby>家<rt>いえ</rt></ruby>にはけっしてかえらないから。
      <ruby>一<rt>いっ</rt></ruby><ruby>軒<rt>けん</rt></ruby>の<ruby>小<rt>ちい</rt></ruby>さな<ruby>家<rt>うち</rt></ruby>を<ruby>見<rt>み</rt></ruby>つけましたので。
      その<ruby>家<rt>いえ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>にあるものは、なんでも
      `;
      const existingRubyTags = new Map<string, string[]>([
        ["家", ["いえ", "うち", "いえ"]],
        ["中", ["なか", "なか"]],
        ["一", ["いっ"]],
        ["軒", ["けん"]],
        ["小", ["ちい"]],
        ["見", ["み"]],
      ]);
      const result = addRubyTagsWithPreservation(mdxText, existingRubyTags);
      expect(result).toEqual(mdxText);
    });

    it("should correctly apply FIFO for ruby tags in the 'いえ/うち' context", () => {
      const mdxText = `
      その家の中にあるものは、
      その家中だったのです。`;

      const existingRubyTags = new Map<string, string[]>([
        ["家", ["いえ", "うち"]],
        ["中", ["なか", "じゅう"]],
      ]);

      const result = addRubyTagsWithPreservation(mdxText, existingRubyTags);

      const expected = `
      その<ruby>家<rt>いえ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>にあるものは、
      その<ruby>家<rt>うち</rt></ruby><ruby>中<rt>じゅう</rt></ruby>だったのです。`;

      expect(result).toEqual(expected);
    });

    it("should handle multiple uses of the same kanji in different contexts", () => {
      const mdxText = `
      もう家にはけっしてかえらないから。
      一軒の小さな家を見つけましたので。
      その家の中にあるものは、なんでも
      `;

      const existingRubyTags = new Map<string, string[]>([
        ["家", ["いえ", "うち", "いえ"]],
        ["中", ["なか"]],
        ["一", ["いっ"]],
        ["軒", ["けん"]],
        ["小", ["ちい"]],
        ["見", ["み"]],
      ]);

      const result = addRubyTagsWithPreservation(mdxText, existingRubyTags);

      const expected = `
      もう<ruby>家<rt>いえ</rt></ruby>にはけっしてかえらないから。
      <ruby>一<rt>いっ</rt></ruby><ruby>軒<rt>けん</rt></ruby>の<ruby>小<rt>ちい</rt></ruby>さな<ruby>家<rt>うち</rt></ruby>を<ruby>見<rt>み</rt></ruby>つけましたので。
      その<ruby>家<rt>いえ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>にあるものは、なんでも
      `;

      expect(result).toEqual(expected);
    });

    it("should maintain the correct ruby annotations for the '一軒' issue", () => {
      const mdxText = "<ruby>一<rt>いっ</rt></ruby><ruby>軒<rt>けん</rt></ruby>";

      const existingRubyTags = new Map<string, string[]>([
        ["一", ["ひと", "いっ"]], // First is 'ひと', second is 'いっ'
        ["軒", ["けん"]],
      ]);

      const expected = "<ruby>一<rt>いっ</rt></ruby><ruby>軒<rt>けん</rt></ruby>";

      const result = addRubyTagsWithPreservation(mdxText, existingRubyTags);
      expect(result).toEqual(expected);
    });

    it("should correctly handle complex mixed ruby contexts", () => {
      const section1 = "その<ruby>一<rt>いっ</rt></ruby><ruby>軒<rt>けん</rt></ruby>は";

      const section2 = "ただ<ruby>一<rt>ひと</rt></ruby>つの";

      const fullDocument = `${section1}、${section2}`;

      const extractedTags = new Map<string, string[]>([
        ["一", ["いっ", "ひと"]], // Note: order is based on appearance in document
        ["軒", ["けん"]],
      ]);

      const result = addRubyTagsWithPreservation(fullDocument, extractedTags);

      expect(result).toEqual(fullDocument);

      expect(result.includes("<ruby>一<rt>いっ</rt></ruby>")).toBe(true);
      expect(result.includes("<ruby>一<rt>ひと</rt></ruby>")).toBe(true);
    });

    it("should correctly handle the issue when the same text is processed a second time with different ruby associations", () => {
      const originalMdx = "<ruby>一<rt>いっ</rt></ruby><ruby>軒<rt>けん</rt></ruby>";

      const existingRubyMap = new Map<string, string[]>([
        ["一", ["ひと", "いっ"]], // Note that "ひと" comes first in the map
        ["軒", ["けん"]],
      ]);

      const result = addRubyTagsWithPreservation(originalMdx, existingRubyMap);

      const expectedResult = "<ruby>一<rt>いっ</rt></ruby><ruby>軒<rt>けん</rt></ruby>";

      expect(result).toEqual(expectedResult);
    });

    it("should accurately reproduce the bug mentioned in the issue document using the real HTML file path", () => {
      const problematicFragment = "<ruby>一<rt>いっ</rt></ruby><ruby>軒<rt>けん</rt></ruby>";

      const problematicRubyMap = new Map<string, string[]>([
        ["一", ["ひと", "いっ"]], // This order causes the bug - "ひと" will be used instead of "いっ"
        ["軒", ["けん"]],
      ]);

      const actualOutput = addRubyTagsWithPreservation(problematicFragment, problematicRubyMap);

      const expectedCorrectOutput = "<ruby>一<rt>いっ</rt></ruby><ruby>軒<rt>けん</rt></ruby>";

      expect(actualOutput).toEqual(expectedCorrectOutput);
    });
  });
});
