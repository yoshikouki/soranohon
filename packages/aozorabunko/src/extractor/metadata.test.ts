import { describe, expect, it } from "vitest";
import { extractMetadata } from "./metadata";

describe("extractMetadata", () => {
  it("returns default values when no metadata present", () => {
    const ast = { type: "root", children: [] };
    const meta = extractMetadata(ast as any);
    expect(meta).toEqual({
      id: "",
      title: "",
      creator: "",
      translator: undefined,
      bibliographyRaw: "",
    });
  });

  it("extracts id, title, creator, translator, and bibliographyRaw", () => {
    const ast = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h1",
          properties: { class: "title" },
          children: [{ type: "text", value: "My Book Title" }],
        },
        {
          type: "element",
          tagName: "h2",
          properties: { class: "author" },
          children: [{ type: "text", value: "Author Name" }],
        },
        {
          type: "element",
          tagName: "h2",
          properties: { class: "translator" },
          children: [{ type: "text", value: "Translator Name" }],
        },
        {
          type: "element",
          tagName: "div",
          properties: { class: "bibliographical_information" },
          children: [
            { type: "text", value: "Line1" },
            { type: "text", value: "Line2" },
          ],
        },
      ],
    };
    const meta = extractMetadata(ast as any, "/path/to/123_456.html");
    expect(meta).toEqual({
      id: "123_456",
      title: "My Book Title",
      creator: "Author Name",
      translator: "Translator Name",
      bibliographyRaw: "Line1\nLine2",
    });
  });
});
