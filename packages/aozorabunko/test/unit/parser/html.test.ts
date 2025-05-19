import { describe, expect, it } from "vitest";
import { parseHtml } from "../../../src/parser/html";

describe("parseHtml", () => {
  it("parses simple HTML into HAST AST", () => {
    const html = "<div><p>Hello</p></div>";
    const ast = parseHtml(html);
    expect(ast).toMatchObject({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "div",
          children: [
            {
              type: "element",
              tagName: "p",
              children: [{ type: "text", value: "Hello" }],
            },
          ],
        },
      ],
    });
  });
});
