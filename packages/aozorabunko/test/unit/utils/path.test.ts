import { describe, expect, it } from "vitest";
import { convertUrlToFilePath, getMdxOutputPath } from "../../../src/utils/path";

describe("getMdxOutputPath", () => {
  it("should convert html path to src/books/<basename>.mdx", () => {
    expect(getMdxOutputPath("public/assets/books/html/59835_72466.html")).toBe(
      "src/books/59835_72466.mdx",
    );
    expect(getMdxOutputPath("/absolute/path/to/foo.html")).toBe("src/books/foo.mdx");
    expect(getMdxOutputPath("../otherproject/bar.html")).toBe("src/books/bar.mdx");
    expect(getMdxOutputPath("baz.HTML")).toBe("src/books/baz.mdx");
  });
});

describe("convertUrlToFilePath", () => {
  it("should convert html URL to src/books/<basename>.mdx", () => {
    expect(convertUrlToFilePath("foo.html")).toBe("src/books/foo.mdx");
    expect(convertUrlToFilePath("/books/123/456_789.html")).toBe("src/books/456_789.mdx");
    expect(convertUrlToFilePath("https://example.com/path/to/book.html")).toBe(
      "src/books/book.mdx",
    );
    expect(convertUrlToFilePath("chapter.html#section")).toBe("src/books/chapter.mdx");
    expect(convertUrlToFilePath("volume.html?lang=en")).toBe("src/books/volume.mdx");
  });
});
