import * as fs from "fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addRubyTagsWithPreservation, extractExistingRubyTags } from "./ruby-utils";

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
    expect(result.existingRubyTags.get("漢字")).toBe("かんじ");
    expect(result.existingRubyTags.get("日本")).toBe("にほん");
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
    expect(result.existingRubyTags.get("日本")).toBe("にほん");
  });
});

describe("addRubyTagsWithPreservation", () => {
  it("should add ruby placeholder tags to kanji", () => {
    const mdx = "漢字";
    const existingRubyTags = new Map<string, string>();

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toBe("<ruby>漢字<rt>{{required_ruby}}</rt></ruby>");
  });

  it("should preserve existing ruby tags", () => {
    const mdx = "<ruby>漢<rt>かん</rt></ruby>字";
    const existingRubyTags = new Map<string, string>();

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toBe(
      "<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>",
    );
  });

  it("should use provided ruby readings for specified kanji", () => {
    const mdx = "漢字";
    const existingRubyTags = new Map<string, string>([["漢字", "かんじ"]]);

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toBe("<ruby>漢字<rt>かんじ</rt></ruby>");
  });

  it("should handle mixed content with existing ruby and new kanji", () => {
    const mdx = "<ruby>漢<rt>かん</rt></ruby>字と日本語";
    const existingRubyTags = new Map<string, string>([["日本", "にほん"]]);

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);
    expect(result).toBe(
      "<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>と<ruby>日本語<rt>{{required_ruby}}</rt></ruby>",
    );
  });

  it("should handle complex nested tags", () => {
    const mdx = "<div>これは<ruby>漢<rt>かん</rt></ruby>字と<span>日本</span>語です</div>";
    const existingRubyTags = new Map<string, string>([["日本", "にほん"]]);

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toBe(
      "<div>これは<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>と<span><ruby>日本<rt>にほん</rt></ruby></span><ruby>語<rt>{{required_ruby}}</rt></ruby>です</div>",
    );
  });

  it("should handle empty string", () => {
    const mdx = "";
    const existingRubyTags = new Map<string, string>();

    const result = addRubyTagsWithPreservation(mdx, existingRubyTags);

    expect(result).toBe("");
  });
});
