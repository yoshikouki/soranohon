import { readFile } from "fs/promises";
import { describe, expect, it } from "vitest";
import { htmlToMdx } from "./htmlToMdx";

const HTML_PATH = "public/assets/books/html/59835_72466.html";
const MDX_PATH = "src/books/59835_72466.mdx";

function extractFirstText(str: string): string {
  // <br />で分割し、最初の非空行だけを返す
  const firstLine =
    str
      .split(/<br\s*\/?>/)
      .map((line) => line.replace(/[ \t\n\r　]+/g, "").trim())
      .find((line) => line.length > 0) || "";
  return firstLine;
}

describe("htmlToMdx", () => {
  it("should convert main_text html to mdx as expected (first text line)", async () => {
    const html = await readFile(HTML_PATH, "utf-8");
    const expectedMdx = await readFile(MDX_PATH, "utf-8");
    const actualMdx = htmlToMdx(html);
    // 最初の本文テキスト行が一致するか
    expect(extractFirstText(actualMdx)).toBe(extractFirstText(expectedMdx));
  });

  it("should throw if .main_text is not found", () => {
    const html = "<div>no main text</div>";
    expect(() => htmlToMdx(html)).toThrow("main_text div not found");
  });
});
