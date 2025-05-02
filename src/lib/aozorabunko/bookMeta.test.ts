import { readFile } from "fs/promises";
import { describe, expect, it } from "vitest";
import { extractBookMeta } from "./bookMeta";

const HTML_PATH = "public/assets/books/html/59835_72466.html";

describe("extractBookMeta", () => {
  it("should extract correct metadata from 赤ずきん html", async () => {
    const html = await readFile(HTML_PATH, "utf-8");
    const meta = extractBookMeta(HTML_PATH, html);
    expect(meta.id).toBe("59835_72466");
    expect(meta.title).toBe("赤ずきん");
    expect(meta.creator).toBe("グリム　Grimm");
    expect(meta.translator).toBe("矢崎源九郎訳");
    expect(meta.bibliographyRaw).toContain("底本：");
    expect(meta.bibliographyRaw).toContain("グリム童話集");
    expect(meta.bibliographyRaw).toContain("入力：sogo");
  });

  it("should handle missing translator", async () => {
    const html = `<html><body><h1 class='title'>タイトル</h1><h2 class='author'>著者</h2><div class='bibliographical_information'>書誌情報</div></body></html>`;
    const meta = extractBookMeta("dummy.html", html);
    expect(meta.translator).toBe(undefined);
  });
});
