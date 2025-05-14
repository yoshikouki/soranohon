import { describe, expect, it } from "vitest";
import { getMdxOutputPath } from "./path";

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
