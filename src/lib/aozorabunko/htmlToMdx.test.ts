import { describe, expect, it } from "vitest";
import {
  addPlaceholderRubyToKanji,
  addRubyTagsToMdx,
  convertHtmlToMdxWithRuby,
  extractLines,
  extractMainText,
  formParagraphs,
  htmlToMdx,
  removeLeadingFullWidthSpace,
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
    const expected = "これはテストです。\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle <br> tags", () => {
    const html = `<div class="main_text">行1<br>行2</div>`;
    const expected = "行1<br />行2\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle ruby tags", () => {
    const html = `<div class="main_text">漢<ruby>字<rt>じ</rt></ruby></div>`;
    const expected = "漢<ruby>字<rt>じ</rt></ruby>\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle em tags", () => {
    const html = `<div class="main_text">強調<em>テキスト</em></div>`;
    const expected = "強調<em>テキスト</em>\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should split paragraphs by full-width space and remove it by default", () => {
    const html = `<div class="main_text">行1<br>　行2</div>`;
    const expected = "行1\n\n行2\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should split paragraphs by '「' or '（' at line start", () => {
    const html = `<div class="main_text">行1<br>「会話」<br>（注釈）</div>`;
    const expected = "行1\n\n「会話」\n\n（注釈）\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should remove leading and trailing <br />", () => {
    const html = `<div class="main_text"><br>行1<br>行2<br></div>`;
    const expected = "行1<br />行2\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should ignore empty and whitespace-only lines", () => {
    const html = `<div class="main_text">行1<br>   <br>行2</div>`;
    const expected = "行1<br />行2\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should throw if .main_text is not found", () => {
    const html = "<div>no main text</div>";
    expect(() => htmlToMdx(html)).toThrow("main_text div not found");
  });

  it("should convert class attribute to className", () => {
    const html = `<div class="main_text"><span class='foo'>bar</span></div>`;
    const expected = '<span className="foo">bar</span>\n';
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle mixed ruby and em tags", () => {
    const html = `<div class="main_text">テスト<ruby>漢<rt>かん</rt></ruby><em>強調</em></div>`;
    const expected = "テスト<ruby>漢<rt>かん</rt></ruby><em>強調</em>\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should return empty string for empty main_text", () => {
    const html = `<div class="main_text"></div>`;
    const expected = "";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should ignore whitespace between consecutive <br>", () => {
    const html = `<div class="main_text">行1<br> <br>行2</div>`;
    const expected = "行1<br />行2\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should remove multiple <br> before paragraph split and remove full-width space", () => {
    const html = `<div class="main_text">行1<br><br>　行2</div>`;
    const expected = "行1\n\n行2\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle nested tags", () => {
    const html = `<div class="main_text">テスト<em><ruby>漢<rt>かん</rt></ruby></em>終わり</div>`;
    const expected = "テスト<em><ruby>漢<rt>かん</rt></ruby></em>終わり\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle <br> only main_text", () => {
    const html = `<div class="main_text"><br></div>`;
    const expected = "";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle tag with multiple attributes", () => {
    const html = `<div class="main_text"><span class='foo' id='bar'>baz</span></div>`;
    const expected = '<span className="foo" id="bar">baz</span>\n';
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle unexpected tags in main_text", () => {
    const html = `<div class="main_text">テスト<div>中身</div>終わり</div>`;
    const expected = "テスト<div>中身</div>終わり\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle alternating text and tags", () => {
    const html = `<div class="main_text">foo<em>bar</em>baz<ruby>字<rt>じ</rt></ruby></div>`;
    const expected = "foo<em>bar</em>baz<ruby>字<rt>じ</rt></ruby>\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should return empty string for whitespace and <br>", () => {
    const html = `<div class="main_text">   <br>   </div>`;
    const expected = "";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should remove full-width space from paragraph by default", () => {
    const html = `<div class="main_text">　全角スペース</div>`;
    const expected = "全角スペース\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should simplify complex ruby tags", () => {
    const html = `<div class="main_text"><ruby><rb>酒</rb><rp>（</rp><rt>しゅ</rt><rp>）</rp></ruby></div>`;
    const expected = "<ruby>酒<rt>しゅ</rt></ruby>\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should simplify complex ruby tags within other content", () => {
    const html = `<div class="main_text">これは<ruby><rb>漢</rb><rp>（</rp><rt>かん</rt><rp>）</rp></ruby><ruby><rb>字</rb><rp>（</rp><rt>じ</rt><rp>）</rp></ruby>です。</div>`;
    const expected = "これは<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>じ</rt></ruby>です。\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should handle a mix of simple and complex ruby tags", () => {
    const html = `<div class="main_text"><ruby>簡<rt>かん</rt></ruby>単と<ruby><rb>複</rb><rp>（</rp><rt>ふく</rt><rp>）</rp></ruby>雑</div>`;
    const expected = "<ruby>簡<rt>かん</rt></ruby>単と<ruby>複<rt>ふく</rt></ruby>雑\n";
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

describe("addPlaceholderRubyToKanji", () => {
  it("should add placeholder ruby tags to kanji characters", () => {
    const input = "漢字";
    const expected = "<ruby>漢字<rt>{{required_ruby}}</rt></ruby>";
    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });

  it("should not modify non-kanji characters", () => {
    const input = "こんにちは123abc";
    expect(addPlaceholderRubyToKanji(input)).toBe(input);
  });

  it("should not modify content inside tags", () => {
    const input = "<span>漢字</span>";
    const expected = "<span><ruby>漢字<rt>{{required_ruby}}</rt></ruby></span>";
    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });

  it("should handle mixed content correctly", () => {
    const input = "これは漢字と<ruby>日本<rt>にほん</rt></ruby>語です";
    const expected =
      "これは<ruby>漢字<rt>{{required_ruby}}</rt></ruby>と<ruby>日本<rt>にほん</rt></ruby><ruby>語<rt>{{required_ruby}}</rt></ruby>です";
    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });

  it("should handle text with multiple tags", () => {
    const input = "<span>漢字</span>と<em>日本</em>語";
    const expected =
      "<span><ruby>漢字<rt>{{required_ruby}}</rt></ruby></span>と<em><ruby>日本<rt>{{required_ruby}}</rt></ruby></em><ruby>語<rt>{{required_ruby}}</rt></ruby>";
    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });

  it("should preserve existing ruby tags and their content", () => {
    const input = "<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>じ</rt></ruby>";
    expect(addPlaceholderRubyToKanji(input)).toBe(input);
  });

  it("should handle complex content with multiple existing ruby tags", () => {
    const input =
      "むかしむかし、あるところにちっちゃな、かわいい<ruby>女<rt>おんな</rt></ruby>の<ruby>子<rt>こ</rt></ruby>がおりました。";
    const expected =
      "むかしむかし、あるところにちっちゃな、かわいい<ruby>女<rt>おんな</rt></ruby>の<ruby>子<rt>こ</rt></ruby>がおりました。";
    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });

  it("should add ruby tags to kanji outside existing ruby tags", () => {
    const input = "これは<ruby>漢<rt>かん</rt></ruby>字です";
    const expected =
      "これは<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>です";
    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });

  it("should handle nested tags with ruby tags", () => {
    const input =
      "<div>これは<ruby>漢<rt>かん</rt></ruby>字と<span><ruby>日<rt>に</rt></ruby>本</span>語です</div>";
    const expected =
      "<div>これは<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>と<span><ruby>日<rt>に</rt></ruby><ruby>本<rt>{{required_ruby}}</rt></ruby></span><ruby>語<rt>{{required_ruby}}</rt></ruby>です</div>";
    expect(addPlaceholderRubyToKanji(input)).toBe(expected);
  });
});

describe("addRubyTagsToMdx", () => {
  it("should add placeholder ruby tags to kanji in MDX text", () => {
    const mdx = "漢字";
    const expected = "<ruby>漢字<rt>{{required_ruby}}</rt></ruby>";
    expect(addRubyTagsToMdx(mdx)).toBe(expected);
  });

  it("should preserve existing ruby tags", () => {
    const mdx = "<ruby>漢<rt>かん</rt></ruby>字";
    const expected = "<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>";
    expect(addRubyTagsToMdx(mdx)).toBe(expected);
  });

  it("should handle paragraphs with full-width space", () => {
    const mdx = "　漢字";
    const expected = "　<ruby>漢字<rt>{{required_ruby}}</rt></ruby>";
    expect(addRubyTagsToMdx(mdx)).toBe(expected);
  });

  it("should handle quoted text", () => {
    const mdx = "「漢字」";
    const expected = "「<ruby>漢字<rt>{{required_ruby}}</rt></ruby>」";
    expect(addRubyTagsToMdx(mdx)).toBe(expected);
  });

  it("should process a realistic example from a book", () => {
    const mdx = "まえかけの下にもっているのは、なあに。";
    const expected =
      "まえかけの<ruby>下<rt>{{required_ruby}}</rt></ruby>にもっているのは、なあに。";
    expect(addRubyTagsToMdx(mdx)).toBe(expected);
  });
});

describe("removeLeadingFullWidthSpace", () => {
  it("should remove leading full-width space", () => {
    const text = "　これはテストです。";
    const expected = "これはテストです。";
    expect(removeLeadingFullWidthSpace(text)).toBe(expected);
  });

  it("should remove multiple leading full-width spaces", () => {
    const text = "　　　これはテストです。";
    const expected = "これはテストです。";
    expect(removeLeadingFullWidthSpace(text)).toBe(expected);
  });

  it("should not modify text without leading full-width space", () => {
    const text = "これはテストです。";
    expect(removeLeadingFullWidthSpace(text)).toBe(text);
  });

  it("should not remove full-width spaces in the middle of text", () => {
    const text = "これは　テストです。";
    expect(removeLeadingFullWidthSpace(text)).toBe(text);
  });

  it("should handle empty string", () => {
    expect(removeLeadingFullWidthSpace("")).toBe("");
  });

  it("should handle null or undefined", () => {
    expect(removeLeadingFullWidthSpace(null as unknown as string)).toBe("");
    expect(removeLeadingFullWidthSpace(undefined as unknown as string)).toBe("");
  });
});

describe("htmlToMdx with removeFullWidthSpace option", () => {
  it("should convert HTML to MDX and remove full-width spaces by default", () => {
    const html = `<div class="main_text">　これはテストです。<br>　これも段落です。</div>`;
    const expected = "これはテストです。\n\nこれも段落です。\n";
    expect(htmlToMdx(html)).toBe(expected);
  });

  it("should convert HTML to MDX without removing full-width spaces when specified", () => {
    const html = `<div class="main_text">　これはテストです。<br>　これも段落です。</div>`;
    const expected = "　これはテストです。\n\n　これも段落です。\n";
    expect(htmlToMdx(html, false)).toBe(expected);
  });

  it("should handle HTML without full-width spaces", () => {
    const html = `<div class="main_text">これはテストです。<br>これも段落です。</div>`;
    const expected = "これはテストです。<br />これも段落です。\n";
    expect(htmlToMdx(html)).toBe(expected);
  });
});

describe("convertHtmlToMdxWithRuby", () => {
  it("should convert HTML to MDX with ruby tags when enabled", () => {
    const html = `<div class="main_text">漢字</div>`;
    const expected = "<ruby>漢字<rt>{{required_ruby}}</rt></ruby>\n";
    expect(convertHtmlToMdxWithRuby(html, true)).toBe(expected);
  });

  it("should convert HTML to MDX without ruby tags when disabled", () => {
    const html = `<div class="main_text">漢字</div>`;
    const expected = "漢字\n";
    expect(convertHtmlToMdxWithRuby(html, false)).toBe(expected);
    expect(convertHtmlToMdxWithRuby(html)).toBe(expected); // デフォルトはfalse
  });

  it("should add placeholder ruby tags to kanji but not to existing ruby tags", () => {
    const html = `<div class="main_text"><ruby>漢<rt>かん</rt></ruby>字</div>`;
    const expected = "<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>\n";
    expect(convertHtmlToMdxWithRuby(html, true)).toBe(expected);
  });

  it("should handle complex ruby tags along with placeholder ruby tags", () => {
    const html = `<div class="main_text"><ruby><rb>漢</rb><rp>（</rp><rt>かん</rt><rp>）</rp></ruby>字</div>`;
    const expected = "<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>{{required_ruby}}</rt></ruby>\n";
    expect(convertHtmlToMdxWithRuby(html, true)).toBe(expected);
  });

  it("should keep leading full-width spaces when specified true", () => {
    const html = `<div class="main_text">　テスト</div>`;
    const expected = "　テスト\n";
    expect(convertHtmlToMdxWithRuby(html, false, true)).toBe(expected);
  });

  it("should remove leading full-width spaces by default", () => {
    const html = `<div class="main_text">　テスト</div>`;
    const expected = "テスト\n";
    expect(convertHtmlToMdxWithRuby(html, false)).toBe(expected);
  });

  it("should handle both ruby tags and full-width space removal", () => {
    const html = `<div class="main_text">　漢字</div>`;
    const expected = "<ruby>漢字<rt>{{required_ruby}}</rt></ruby>\n";
    expect(convertHtmlToMdxWithRuby(html, true)).toBe(expected);
  });
});

// <br>タグの修正に関するテスト
describe("htmlToMdx self-closing br tag fix", () => {
  it("should convert <br> tags to self-closing <br /> tags", () => {
    const html = `<div class="main_text">行1<br>行2</div>`;
    const result = htmlToMdx(html);
    expect(result).toContain("<br />");
    expect(result).not.toContain("<br>");
  });

  it("should handle multiple <br> tags correctly", () => {
    const html = `<div class="main_text">行1<br>行2<br>行3</div>`;
    const result = htmlToMdx(html);
    const brCount = (result.match(/<br \/>/g) || []).length;
    expect(brCount).toBe(2);
    expect(result).not.toContain("<br>");
  });

  it("should not affect already correctly formatted <br /> tags", () => {
    // Note: Cheerioは <br /> を <br> に変換するため、内部では修正が適用される
    const html = `<div class="main_text">行1<br />行2</div>`;
    const result = htmlToMdx(html);
    expect(result).toContain("<br />");
    expect(result).not.toContain("<br>");
  });
});

// jisage_1 divタグの処理に関するテスト
describe("htmlToMdx jisage_1 div tag handling", () => {
  it("should handle jisage_1 div tags as separate paragraphs and remove the div tags", () => {
    const html = `<div class="main_text">　すると、鏡はいつもこう答えていました。<br />
<div class="jisage_1" style="margin-left: 1em">
「女王さま、あなたこそ、お国でいちばんうつくしい。」<br />
</div></div>`;
    
    const result = htmlToMdx(html);
    
    // div タグの中身は段落として処理されるべき
    expect(result).toContain('すると、鏡はいつもこう答えていました。');
    expect(result).toContain('「女王さま、あなたこそ、お国でいちばんうつくしい。」');
    
    // div タグは削除されていること
    expect(result).not.toContain('<div');
    expect(result).not.toContain('</div>');
    
    // 段落として処理されること - 段落間に空行があること
    expect(result).toMatch(/すると、鏡はいつもこう答えていました。\n\n「女王さま/);
  });
  
  it("should handle jisage_1 div tags correctly when ruby tags are added", () => {
    const html = `<div class="main_text">　すると、鏡はいつもこう答えていました。<br />
<div class="jisage_1" style="margin-left: 1em">
「女王さま、あなたこそ、お国でいちばんうつくしい。」<br />
</div></div>`;
    
    const mdx = htmlToMdx(html);
    const mdxWithRuby = addRubyTagsToMdx(mdx);
    
    // ルビタグを含んだ出力であること
    expect(mdxWithRuby).toContain('<ruby>鏡<rt>');
    expect(mdxWithRuby).toContain('<ruby>答<rt>');
    expect(mdxWithRuby).toContain('<ruby>女王<rt>');
    expect(mdxWithRuby).toContain('<ruby>国<rt>');
    
    // divタグは削除され、中身は段落として処理されていること
    expect(mdxWithRuby).not.toContain('<div');
    expect(mdxWithRuby).not.toContain('</div>');
    expect(mdxWithRuby).toContain('「<ruby>女王<rt>');
    expect(mdxWithRuby).toContain('お<ruby>国<rt>');
  });
});
