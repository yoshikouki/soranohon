import { describe, expect, it } from "vitest";
import { transformLinks } from "../../../src/transformer/links";

describe("transformLinks", () => {
  it("converts a href URLs to MDX output paths", () => {
    const ast = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          children: [
            {
              type: "element",
              tagName: "a",
              properties: { href: "foo.html" },
              children: [{ type: "text", value: "Link" }],
            },
          ],
        },
      ],
    };
    const result = transformLinks(ast);
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          children: [
            {
              type: "element",
              tagName: "a",
              properties: { href: "src/books/foo.mdx" },
              children: [{ type: "text", value: "Link" }],
            },
          ],
        },
      ],
    });
  });

  it("recursively transforms nested links", () => {
    const ast = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "div",
          children: [
            {
              type: "element",
              tagName: "a",
              properties: { href: "/path/to/bar.html?ref" },
              children: [
                {
                  type: "element",
                  tagName: "span",
                  children: [{ type: "text", value: "Nested" }],
                },
              ],
            },
          ],
        },
      ],
    };
    const result = transformLinks(ast);
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "div",
          children: [
            {
              type: "element",
              tagName: "a",
              properties: { href: "src/books/bar.mdx" },
              children: [
                {
                  type: "element",
                  tagName: "span",
                  children: [{ type: "text", value: "Nested" }],
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
