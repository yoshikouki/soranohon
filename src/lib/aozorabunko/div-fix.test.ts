import { describe, expect, it } from "vitest";
import { htmlToMdx, addRubyTagsToMdx } from "./htmlToMdx";

describe("htmlToMdx div tag handling", () => {
  it("should handle div tags as separate paragraphs", () => {
    const html = `<div class="main_text">　すると、鏡はいつもこう答えていました。<br />
<div class="jisage_1" style="margin-left: 1em">
「女王さま、あなたこそ、お国でいちばんうつくしい。」<br />
</div></div>`;
    
    const result = htmlToMdx(html);
    console.log("Test result:", result);
    
    // div タグの中身は段落として処理されるべき
    expect(result).toContain('すると、鏡はいつもこう答えていました。');
    expect(result).toContain('「女王さま、あなたこそ、お国でいちばんうつくしい。」');
    
    // div タグは削除されていること
    expect(result).not.toContain('<div');
    expect(result).not.toContain('</div>');
    
    // 段落として処理されること - 段落間に空行があること
    expect(result).toMatch(/すると、鏡はいつもこう答えていました。\n\n「女王さま/);
    // br タグが削除されていること
    expect(result).not.toContain('<br />');
  });
  
  it("should handle the exact example from the user's request", () => {
    const html = `<div class="main_text">　すると、鏡はいつもこう答えていました。<br />
<div class="jisage_1" style="margin-left: 1em">
「女王さま、あなたこそ、お国でいちばんうつくしい。」<br />
</div></div>`;
    
    const mdx = htmlToMdx(html);
    const mdxWithRuby = addRubyTagsToMdx(mdx);
    console.log("Ruby test result:", mdxWithRuby);
    
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