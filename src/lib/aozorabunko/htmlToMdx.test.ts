import { describe, expect, it } from "vitest";
import { htmlToMdx } from "./htmlToMdx";

describe("htmlToMdx", () => {
  it("should convert plain text", () => {
    const html = `<div class="main_text">これはテストです。</div>`;
    const expected = "これはテストです。";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle <br> tags", () => {
    const html = `<div class="main_text">行1<br>行2</div>`;
    const expected = "行1<br />行2";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle ruby tags", () => {
    const html = `<div class="main_text">漢<ruby>字<rt>じ</rt></ruby></div>`;
    const expected = "漢<ruby>字<rt>じ</rt></ruby>";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle em tags", () => {
    const html = `<div class="main_text">強調<em>テキスト</em></div>`;
    const expected = "強調<em>テキスト</em>";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should split paragraphs by full-width space", () => {
    const html = `<div class="main_text">行1<br>　行2</div>`;
    const expected = "行1\n\n　行2";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should split paragraphs by '「' or '（' at line start", () => {
    const html = `<div class="main_text">行1<br>「会話」<br>（注釈）</div>`;
    const expected = "行1\n\n「会話」\n\n（注釈）";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should remove leading and trailing <br />", () => {
    const html = `<div class="main_text"><br>行1<br>行2<br></div>`;
    const expected = "行1<br />行2";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should ignore empty and whitespace-only lines", () => {
    const html = `<div class="main_text">行1<br>   <br>行2</div>`;
    const expected = "行1<br />行2";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should throw if .main_text is not found", () => {
    const html = "<div>no main text</div>";
    expect(() => htmlToMdx(html)).toThrow("main_text div not found");
  });
});
