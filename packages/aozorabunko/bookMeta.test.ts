import { describe, expect, it } from "vitest";
import { extractBookMeta } from "./bookMeta";

describe("extractBookMeta", () => {
  it("should extract correct metadata from 赤ずきん html", async () => {
    const html = `
      <html>
        <head>
          <meta charset=\"UTF-8\">
          <title>赤ずきん</title>
        </head>
        <body>
          <h1 class=\"title\">赤ずきん</h1>
          <h2 class=\"author\">グリム　Grimm</h2>
          <h2 class=\"translator\">矢崎源九郎訳</h2>
          <div class=\"bibliographical_information\">
            底本：グリム童話集
            入力：sogo
          </div>
        </body>
      </html>
    `;
    const meta = extractBookMeta("59835_72466.html", html);
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

  it("should trim leading and trailing newlines in bibliographyRaw", async () => {
    const html = `
      <html>
        <body>
          <div class="bibliographical_information">
\n\n\n底本：グリム童話集\n入力：sogo\n\n\n
          </div>
        </body>
      </html>
    `;
    const meta = extractBookMeta("test.html", html);
    expect(meta.bibliographyRaw.startsWith("\\n")).toBe(false);
    expect(meta.bibliographyRaw.endsWith("\\n")).toBe(false);
    expect(meta.bibliographyRaw).toContain("底本：グリム童話集");
    expect(meta.bibliographyRaw).toContain("入力：sogo");
  });
});
