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

  it("transforms ruby with rb and rp elements", () => {
    const ast = {
      type: "element",
      tagName: "ruby",
      children: [
        { type: "element", tagName: "rb", children: [{ type: "text", value: "漢" }] },
        { type: "element", tagName: "rp", children: [{ type: "text", value: "（" }] },
        { type: "element", tagName: "rt", children: [{ type: "text", value: "かん" }] },
        { type: "element", tagName: "rp", children: [{ type: "text", value: "）" }] },
      ],
    };
    const result = transformRuby(ast);
    expect(result).toEqual({
      type: "element",
      tagName: "Ruby",
      properties: { kana: "かん" },
      children: [
        { type: "element", tagName: "rb", children: [{ type: "text", value: "漢" }] },
        { type: "element", tagName: "rp", children: [{ type: "text", value: "（" }] },
        { type: "element", tagName: "rp", children: [{ type: "text", value: "）" }] },
      ],
    });
  });

  it("transforms multiple ruby tags within text", () => {
    const ast = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "ruby",
          children: [
            { type: "text", value: "日本" },
            { type: "element", tagName: "rt", children: [{ type: "text", value: "にほん" }] },
          ],
        },
        { type: "text", value: "語" },
        {
          type: "element",
          tagName: "ruby",
          children: [
            { type: "text", value: "F" },
            { type: "element", tagName: "rt", children: [{ type: "text", value: "エフ" }] },
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
          tagName: "Ruby",
          properties: { kana: "にほん" },
          children: [{ type: "text", value: "日本" }],
        },
        { type: "text", value: "語" },
        {
          type: "element",
          tagName: "Ruby",
          properties: { kana: "エフ" },
          children: [{ type: "text", value: "F" }],
        },
      ],
    });
  });
});
