import { describe, expect, it } from "vitest";
import { renderMdx } from "../../../src/renderer/mdx";

describe("renderMdx", () => {
  it("returns empty string by default", () => {
    expect(renderMdx({})).toBe("");
  });

  it("renders heading nodes to markdown", () => {
    const ast = {
      type: "root",
      children: [
        {
          type: "heading",
          depth: 1,
          children: [{ type: "text", value: "Hello" }],
        },
      ],
    };
    expect(renderMdx(ast)).toBe("# Hello\n\n");
  });

  it("renders Ruby elements to JSX component syntax", () => {
    const ast = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "Ruby",
          properties: { kana: "かんじ" },
          children: [{ type: "text", value: "漢字" }],
        },
      ],
    };
    expect(renderMdx(ast)).toBe('<Ruby kana="かんじ">漢字</Ruby>');
  });
});
