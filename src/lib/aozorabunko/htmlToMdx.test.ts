import { describe, expect, it } from "vitest";
import {
  extractLines,
  extractMainText,
  formParagraphs,
  htmlToMdx,
  removeTrailingBreaks,
} from "./htmlToMdx";

describe("extractMainText", () => {
  it("should extract .main_text element", () => {
    const html = `<div class="main_text">テスト</div>`;
    const result = extractMainText(html);
    expect(result.length).toBe(1);
    expect(result.text()).toBe("テスト");
  });

  it("should throw if .main_text is not found", () => {
    const html = "<div>no main text</div>";
    expect(() => extractMainText(html)).toThrow("main_text div not found");
  });

  it("should extract nested content in .main_text", () => {
    const html = `<div class="main_text">テスト<em>強調</em></div>`;
    const result = extractMainText(html);
    expect(result.html()).toContain("<em>強調</em>");
  });

  it("should handle empty .main_text", () => {
    const html = `<div class="main_text"></div>`;
    const result = extractMainText(html);
    expect(result.text()).toBe("");
  });
});

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

  it("should convert class attribute to className", () => {
    const html = `<div class="main_text"><span class='foo'>bar</span></div>`;
    const expected = '<span className="foo">bar</span>';
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle mixed ruby and em tags", () => {
    const html = `<div class="main_text">テスト<ruby>漢<rt>かん</rt></ruby><em>強調</em></div>`;
    const expected = "テスト<ruby>漢<rt>かん</rt></ruby><em>強調</em>";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should return empty string for empty main_text", () => {
    const html = `<div class="main_text"></div>`;
    const expected = "";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should ignore whitespace between consecutive <br>", () => {
    const html = `<div class="main_text">行1<br> <br>行2</div>`;
    const expected = "行1<br />行2";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should remove multiple <br> before paragraph split", () => {
    const html = `<div class="main_text">行1<br><br>　行2</div>`;
    const expected = "行1\n\n　行2";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle nested tags", () => {
    const html = `<div class="main_text">テスト<em><ruby>漢<rt>かん</rt></ruby></em>終わり</div>`;
    const expected = "テスト<em><ruby>漢<rt>かん</rt></ruby></em>終わり";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle <br> only main_text", () => {
    const html = `<div class="main_text"><br></div>`;
    const expected = "";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle tag with multiple attributes", () => {
    const html = `<div class="main_text"><span class='foo' id='bar'>baz</span></div>`;
    const expected = '<span className="foo" id="bar">baz</span>';
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle unexpected tags in main_text", () => {
    const html = `<div class="main_text">テスト<div>中身</div>終わり</div>`;
    const expected = "テスト<div>中身</div>終わり";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle alternating text and tags", () => {
    const html = `<div class="main_text">foo<em>bar</em>baz<ruby>字<rt>じ</rt></ruby></div>`;
    const expected = "foo<em>bar</em>baz<ruby>字<rt>じ</rt></ruby>";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should return empty string for whitespace and <br>", () => {
    const html = `<div class="main_text">   <br>   </div>`;
    const expected = "";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should treat single full-width space line as paragraph", () => {
    const html = `<div class="main_text">　全角スペース</div>`;
    const expected = "　全角スペース";
    expect(htmlToMdx(html)).toBe(expected);
  });
});

describe("extractLines", () => {
  it("should extract text nodes as lines", () => {
    const html = `<div class="main_text">行1<br>行2</div>`;
    const main = extractMainText(html);
    const lines = extractLines(main);
    expect(lines).toEqual(["行1", "<br />", "行2"]);
  });

  it("should ignore empty text nodes", () => {
    const html = `<div class="main_text">行1<br>   <br>行2</div>`;
    const main = extractMainText(html);
    const lines = extractLines(main);
    expect(lines).toEqual(["行1", "<br />", "行2"]);
  });

  it("should collapse consecutive <br> tags", () => {
    const html = `<div class="main_text">行1<br><br>行2</div>`;
    const main = extractMainText(html);
    const lines = extractLines(main);
    expect(lines).toEqual(["行1", "<br />", "行2"]);
  });

  it("should convert HTML tags and replace class with className", () => {
    const html = `<div class="main_text">テスト<span class="foo">強調</span></div>`;
    const main = extractMainText(html);
    const lines = extractLines(main);
    expect(lines).toEqual(["テスト", '<span className="foo">強調</span>']);
  });

  it("should handle mixed content", () => {
    const html = `<div class="main_text">テスト<ruby>漢<rt>かん</rt></ruby>文字<br>改行</div>`;
    const main = extractMainText(html);
    const lines = extractLines(main);
    expect(lines).toEqual(["テスト", "<ruby>漢<rt>かん</rt></ruby>", "文字", "<br />", "改行"]);
  });

  it("should remove leading and trailing <br>", () => {
    const html = `<div class="main_text"><br>行1<br>行2<br><br></div>`;
    const main = extractMainText(html);
    const lines = extractLines(main);
    expect(lines).toEqual(["行1", "<br />", "行2"]);
  });

  it("should handle empty main_text", () => {
    const html = `<div class="main_text"></div>`;
    const main = extractMainText(html);
    const lines = extractLines(main);
    expect(lines).toEqual([]);
  });
});

describe("formParagraphs", () => {
  it("should form paragraphs from lines", () => {
    const lines = ["行1", "<br />", "行2"];
    const paragraphs = formParagraphs(lines);
    expect(paragraphs).toEqual(["行1<br />行2"]);
  });

  it("should split paragraphs at full-width space", () => {
    const lines = ["行1", "<br />", "　行2"];
    const paragraphs = formParagraphs(lines);
    expect(paragraphs).toEqual(["行1", "　行2"]);
  });

  it("should split paragraphs at lines starting with '「'", () => {
    const lines = ["行1", "<br />", "「会話」"];
    const paragraphs = formParagraphs(lines);
    expect(paragraphs).toEqual(["行1", "「会話」"]);
  });

  it("should split paragraphs at lines starting with '（'", () => {
    const lines = ["行1", "<br />", "（注釈）"];
    const paragraphs = formParagraphs(lines);
    expect(paragraphs).toEqual(["行1", "（注釈）"]);
  });

  it("should remove <br /> at the end of paragraphs", () => {
    const lines = ["行1", "<br />", "<br />", "　行2"];
    const paragraphs = formParagraphs(lines);
    expect(paragraphs).toEqual(["行1", "　行2"]);
  });

  it("should handle empty lines array", () => {
    const lines: string[] = [];
    const paragraphs = formParagraphs(lines);
    expect(paragraphs).toEqual([]);
  });

  it("should handle complex case with multiple paragraph breaks", () => {
    const lines = [
      "段落1",
      "<br />",
      "続き",
      "<br />",
      "　段落2",
      "続き",
      "<br />",
      "「段落3」",
      "続き",
    ];
    const paragraphs = formParagraphs(lines);
    expect(paragraphs).toEqual(["段落1<br />続き", "　段落2続き", "「段落3」続き"]);
  });
});

describe("removeTrailingBreaks", () => {
  it("should remove trailing <br /> tags", () => {
    const lines = ["行1", "<br />", "<br />"];
    removeTrailingBreaks(lines);
    expect(lines).toEqual(["行1"]);
  });

  it("should do nothing if no trailing <br />", () => {
    const lines = ["行1", "行2"];
    removeTrailingBreaks(lines);
    expect(lines).toEqual(["行1", "行2"]);
  });

  it("should handle empty lines array", () => {
    const lines: string[] = [];
    removeTrailingBreaks(lines);
    expect(lines).toEqual([]);
  });

  it("should remove only trailing <br /> tags", () => {
    const lines = ["行1", "<br />", "行2", "<br />"];
    removeTrailingBreaks(lines);
    expect(lines).toEqual(["行1", "<br />", "行2"]);
  });

  it("should remove all <br /> if they are the only content", () => {
    const lines = ["<br />", "<br />"];
    removeTrailingBreaks(lines);
    expect(lines).toEqual([]);
  });
});
