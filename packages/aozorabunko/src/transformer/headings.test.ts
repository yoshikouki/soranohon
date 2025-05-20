import { describe, expect, it } from "vitest";
import { transformHeadings } from "./headings";

describe("transformHeadings", () => {
  it("returns the same AST when no headings present", () => {
    const ast = { foo: "bar" };
    expect(transformHeadings(ast)).toBe(ast);
  });

  it("converts h1-h6 elements to heading nodes", () => {
    const ast = {
      type: "element",
      tagName: "h2",
      children: [{ type: "text", value: "Subheading" }],
    };
    const result = transformHeadings(ast);
    expect(result).toEqual({
      type: "heading",
      depth: 2,
      children: [{ type: "text", value: "Subheading" }],
    });
  });

  it("recursively transforms nested children", () => {
    const ast = {
      type: "root",
      children: [
        { type: "element", tagName: "h3", children: [{ type: "text", value: "T" }] },
        {
          type: "element",
          tagName: "div",
          children: [
            { type: "element", tagName: "h1", children: [{ type: "text", value: "Another" }] },
          ],
        },
      ],
    };
    const result = transformHeadings(ast);
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "heading", depth: 3, children: [{ type: "text", value: "T" }] },
        {
          type: "element",
          tagName: "div",
          children: [
            { type: "heading", depth: 1, children: [{ type: "text", value: "Another" }] },
          ],
        },
      ],
    });
  });
});
