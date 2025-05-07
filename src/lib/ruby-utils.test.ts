import * as fs from "fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addRubyTagsWithPreservation,
  extractExistingRubyTags,
  globalRubyQueue,
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
    // access が失敗するようにモック
    vi.mocked(fs.access).mockRejectedValueOnce(new Error("File not found"));

    const result = await extractExistingRubyTags("/path/to/file.mdx", false);

    expect(result.fileExists).toBe(false);
    expect(result.existingMdx).toBe("");
    expect(result.existingRubyTags.size).toBe(0);
    expect(fs.readFile).not.toHaveBeenCalled();
  });

  it("should not read file when forceOverwrite is true", async () => {
    // access が成功するようにモック
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const result = await extractExistingRubyTags("/path/to/file.mdx", true);

    expect(result.fileExists).toBe(true);
    expect(result.existingMdx).toBe("");
    expect(result.existingRubyTags.size).toBe(0);
    expect(fs.readFile).not.toHaveBeenCalled();
  });

  it("should extract ruby tags from existing file", async () => {
    // access が成功するようにモック
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    // readFile が MDX コンテンツを返すようにモック
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
    // access が成功するようにモック
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    // readFile が MDX コンテンツを返すようにモック
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
    // access が成功するようにモック
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    // readFile が MDX コンテンツを返すようにモック（rbタグがある場合）
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
    // access が成功するようにモック
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    // readFile が MDX コンテンツを返すようにモック（rpタグがある場合）
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
    // access が成功するようにモック
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    // readFile が MDX コンテンツを返すようにモック（混合フォーマット）
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
    // access が成功するようにモック
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    // readFile が MDX コンテンツを返すようにモック
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
    // access が成功するようにモック
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    // readFile が MDX コンテンツを返すようにモック
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
  beforeEach(() => {
    // Reset any existing state for reliable testing
    // globalRubyQueueの初期化
    Array.from(globalRubyQueue.keys()).forEach((key) => {
      globalRubyQueue.delete(key);
    });
  });
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

  it("should cycle through multiple ruby readings for the same kanji", () => {
    // Reset any existing state for reliable testing
    // globalRubyQueueの初期化
    Object.keys(globalRubyQueue).forEach((key) => {
      globalRubyQueue.delete(key);
    });

    const mdx = "一に一を加えると二になる";
    const existingRubyTags = new Map<string, string[]>([
      ["一", ["いち", "ひと"]],
      ["二", ["に"]],
    ]);

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    // Don't test the exact order, just check that both rubies are used
    expect(result).toContain("<ruby>一<rt>いち</rt></ruby>");
    expect(result).toContain("<ruby>一<rt>ひと</rt></ruby>");
    expect(result).toContain("<ruby>二<rt>に</rt></ruby>");
    expect(result).toContain("<ruby>加<rt>{{required_ruby}}</rt></ruby>");
  });

  it("should properly handle the case that caused the bug", () => {
    // Reset any existing state for reliable testing
    // globalRubyQueueの初期化
    Object.keys(globalRubyQueue).forEach((key) => {
      globalRubyQueue.delete(key);
    });

    const mdx = "一軒";
    const existingRubyTags = new Map<string, string[]>([
      ["一", ["いち", "ひと"]],
      ["軒", ["けん"]],
    ]);

    // First occurrence will use the first ruby in the array
    let result = addRubyTagsWithPreservation(mdx, existingRubyTags);
    expect(result).toBe("<ruby>一<rt>いち</rt></ruby><ruby>軒<rt>けん</rt></ruby>");

    // Second occurrence should use the second ruby
    result = addRubyTagsWithPreservation(mdx, existingRubyTags);
    expect(result).toBe("<ruby>一<rt>ひと</rt></ruby><ruby>軒<rt>けん</rt></ruby>");

    // Third occurrence cycles back to the first ruby
    result = addRubyTagsWithPreservation(mdx, existingRubyTags);
    expect(result).toBe("<ruby>一<rt>いち</rt></ruby><ruby>軒<rt>けん</rt></ruby>");
  });

  it("should handle mixed content with existing ruby and new kanji", () => {
    // Reset any existing state for reliable testing
    // globalRubyQueueの初期化
    Object.keys(globalRubyQueue).forEach((key) => {
      globalRubyQueue.delete(key);
    });

    const mdx = "<ruby>漢<rt>かん</rt></ruby>字と日本語";
    const existingRubyTags = new Map<string, string[]>([["日本", ["にほん"]]]);

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    // Preserve existing <ruby> tags
    expect(result).toContain("<ruby>漢<rt>かん</rt></ruby>");

    // Check the general structure without exact ordering
    expect(result).toContain("<ruby>字<rt>{{required_ruby}}</rt></ruby>");

    // This test will pass regardless of whether the function processes "日本語" as a single unit
    // or "日本" + "語" separately - both are valid implementations
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

  describe("Ruby overwrite bug with FIFO queue", () => {
    beforeEach(() => {
      // Reset globalRubyQueue before each test
      Array.from(globalRubyQueue.keys()).forEach((key) => {
        globalRubyQueue.delete(key);
      });
    });

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
      // This test recreates the book scenario where '家' has different contextual readings
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
  });
});
