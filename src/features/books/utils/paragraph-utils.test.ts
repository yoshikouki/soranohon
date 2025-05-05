import { describe, expect, it } from "vitest";
import { shouldIndentParagraph } from "./paragraph-utils";

describe("shouldIndentParagraph", () => {
  it("「から始まる段落はインデントしない", () => {
    expect(shouldIndentParagraph("「こんにちは」と言いました。")).toBe(false);
  });

  it("（から始まる段落はインデントしない", () => {
    expect(shouldIndentParagraph("（これは括弧です）と言いました。")).toBe(false);
  });

  it("(から始まる段落はインデントしない", () => {
    expect(shouldIndentParagraph("(This is a parenthesis)と言いました。")).toBe(false);
  });

  it("通常の文章はインデントする", () => {
    expect(shouldIndentParagraph("これは普通の文章です。")).toBe(true);
  });

  it("空白を含む文章でも最初の文字で判定する", () => {
    expect(shouldIndentParagraph("  「こんにちは」と言いました。")).toBe(false);
    expect(shouldIndentParagraph("  これは普通の文章です。")).toBe(true);
  });

  it("空文字列の場合はインデントする", () => {
    expect(shouldIndentParagraph("")).toBe(true);
  });
});
