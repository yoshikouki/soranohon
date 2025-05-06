import { describe, expect, it } from "vitest";
import { htmlToMdx } from "./htmlToMdx";

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
    // Note: Our test is using <br /> but cheerio will convert this to <br> internally
    // and then our fix will convert it back to <br />
    const html = `<div class="main_text">行1<br />行2</div>`;
    const result = htmlToMdx(html);
    expect(result).toContain("<br />");
    expect(result).not.toContain("<br>");
  });
});