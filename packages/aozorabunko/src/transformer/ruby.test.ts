import { describe, expect, it } from "vitest";
import { transformRuby } from "./ruby";

describe("transformRuby", () => {
  it("returns the same AST when no ruby present", () => {
    const ast = { foo: "bar" };
    expect(transformRuby(ast)).toBe(ast);
  });

  it("converts ruby elements to MDX Ruby component", () => {
    const ast = {
      type: "element",
      tagName: "ruby",
      children: [
        { type: "text", value: "漢字" },
        {
          type: "element",
          tagName: "rt",
          children: [{ type: "text", value: "かんじ" }],
        },
      ],
    };
    const result = transformRuby(ast);
    expect(result).toEqual({
      type: "element",
      tagName: "Ruby",
      properties: { kana: "かんじ" },
      children: [{ type: "text", value: "漢字" }],
    });
  });

  it("recursively transforms nested ruby elements", () => {
    const ast = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          children: [
            {
              type: "element",
              tagName: "ruby",
              children: [
                { type: "text", value: "日" },
                { type: "element", tagName: "rt", children: [{ type: "text", value: "にち" }] },
              ],
            },
          ],
        },
      ],
    };
    const result = transformRuby(ast);
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          children: [
            {
              type: "element",
              tagName: "Ruby",
              properties: { kana: "にち" },
              children: [{ type: "text", value: "日" }],
            },
          ],
        },
      ],
    });
  });
});
