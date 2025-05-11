import { describe, expect, it, vi } from "vitest";
import { BookContent } from "@/features/book-content/core";
import { AozoraBunkoHtml } from "./aozora-bunko-html";

describe("AozoraBunkoHtml", () => {
  // テスト用の基本HTMLを設定
  const basicHtml = `
    <html>
      <head>
        <meta name="DC.Title" content="テストタイトル" />
        <meta name="DC.Creator" content="テスト作者" />
      </head>
      <body>
        <h1 class="title">テストタイトル</h1>
        <h2 class="author">テスト作者</h2>
        <h2 class="translator">テスト翻訳者</h2>
        <div class="main_text">これはテストです。<br />これは次の行です。</div>
        <div class="bibliographical_information">
          テスト書誌情報１行目
          テスト書誌情報２行目
        </div>
      </body>
    </html>
  `;

  describe("read", () => {
    it("HTMLから正しくインスタンスを作成できる", async () => {
      const htmlProvider = vi.fn().mockResolvedValue(basicHtml);
      const instance = await AozoraBunkoHtml.read(htmlProvider);

      expect(htmlProvider).toHaveBeenCalledTimes(1);
      expect(instance).toBeInstanceOf(AozoraBunkoHtml);
    });

    it("main_text要素がない場合にエラーをスローする", async () => {
      const htmlWithoutMainText = "<html><body>No main text here</body></html>";
      const htmlProvider = vi.fn().mockResolvedValue(htmlWithoutMainText);

      await expect(AozoraBunkoHtml.read(htmlProvider)).rejects.toThrow(
        "main_text div not found",
      );
    });
  });

  describe("extractBookMeta", () => {
    it("HTMLからメタデータを正しく抽出できる", async () => {
      const htmlProvider = vi.fn().mockResolvedValue(basicHtml);
      const instance = await AozoraBunkoHtml.read(htmlProvider);
      const meta = instance.extractBookMeta("59835_72466.html");

      expect(meta).toEqual({
        id: "59835_72466",
        title: "テストタイトル",
        creator: "テスト作者",
        translator: "テスト翻訳者",
        bibliographyRaw: "テスト書誌情報１行目\\nテスト書誌情報２行目",
      });
    });

    it("メタデータが不完全な場合にデフォルト値を使用する", async () => {
      const incompleteHtml = `
        <html>
          <body>
            <div class="main_text">テスト</div>
          </body>
        </html>
      `;
      const htmlProvider = vi.fn().mockResolvedValue(incompleteHtml);
      const instance = await AozoraBunkoHtml.read(htmlProvider);
      const meta = instance.extractBookMeta();

      expect(meta).toEqual({
        id: "",
        title: "",
        creator: "",
        translator: undefined,
        bibliographyRaw: "",
      });
    });
  });

  describe("convertToBookContent", () => {
    it("HTMLからBookContentを正しく生成できる", async () => {
      const html = `
        <html>
          <body>
            <div class="main_text">
              これは最初の段落です。<br />これは同じ段落の続きです。
              <br />
              　これは新しい段落です。
              <br />
              「これは会話です。」
              <br />
              （これは注釈です。）
            </div>
          </body>
        </html>
      `;
      const htmlProvider = vi.fn().mockResolvedValue(html);
      const instance = await AozoraBunkoHtml.read(htmlProvider);

      // BookContentオブジェクトを作成
      const bookContent = new BookContent();

      // 変換を実行
      instance.convertToBookContent({ bookContent });

      // 期待される段落数と内容を確認
      expect(bookContent.contents.length).toBe(4);
      expect(bookContent.contents[0]).toBe(
        "これは最初の段落です。<br />これは同じ段落の続きです。",
      );
      expect(bookContent.contents[1]).toBe("これは新しい段落です。");
      expect(bookContent.contents[2]).toBe("「これは会話です。」");
      expect(bookContent.contents[3]).toBe("（これは注釈です。）");
    });

    it("字下げdivを正しく処理する", async () => {
      const html = `
        <html>
          <body>
            <div class="main_text">
              これは導入部です。<br />
              <div class="jisage_1" style="margin-left: 1em">
              「これは字下げされた会話です。<br />
              　これも字下げの続きです。」<br />
              </div>
              これは通常の文章です。
            </div>
          </body>
        </html>
      `;
      const htmlProvider = vi.fn().mockResolvedValue(html);
      const instance = await AozoraBunkoHtml.read(htmlProvider);

      const bookContent = new BookContent();
      instance.convertToBookContent({ bookContent });

      expect(bookContent.contents.length).toBe(2);
      expect(bookContent.contents[0]).toBe("これは導入部です。");
      expect(bookContent.contents[1]).toBe(
        "「これは字下げされた会話です。<br />これも字下げの続きです。」<br />これは通常の文章です。",
      );
    });

    it("ルビタグを正しく処理する", async () => {
      const html = `
        <html>
          <body>
            <div class="main_text">
              <ruby><rb>漢</rb><rp>（</rp><rt>かん</rt><rp>）</rp></ruby><ruby><rb>字</rb><rp>（</rp><rt>じ</rt><rp>）</rp></ruby>と<ruby>仮名<rt>かな</rt></ruby>の混在する文章です。
            </div>
          </body>
        </html>
      `;
      const htmlProvider = vi.fn().mockResolvedValue(html);
      const instance = await AozoraBunkoHtml.read(htmlProvider);

      const bookContent = new BookContent();
      instance.convertToBookContent({ bookContent });

      expect(bookContent.contents.length).toBe(1);
      expect(bookContent.contents[0]).toBe(
        "<ruby>漢<rt>かん</rt></ruby><ruby>字<rt>じ</rt></ruby>と<ruby>仮名<rt>かな</rt></ruby>の混在する文章です。",
      );
    });

    it("引用符内の改行を一つの段落として処理する", async () => {
      const html = `
        <html>
          <body>
            <div class="main_text">
              「これは会話の始まりです。<br />
              　これは会話の続きです。<br />
              　さらに会話が続きます。」<br />
              これは地の文です。
            </div>
          </body>
        </html>
      `;
      const htmlProvider = vi.fn().mockResolvedValue(html);
      const instance = await AozoraBunkoHtml.read(htmlProvider);

      const bookContent = new BookContent();
      instance.convertToBookContent({ bookContent });

      expect(bookContent.contents.length).toBe(1);
      expect(bookContent.contents[0]).toBe(
        "「これは会話の始まりです。<br />これは会話の続きです。<br />さらに会話が続きます。」<br />これは地の文です。",
      );
    });

    it("複数のHTMLタグが混在する場合を正しく処理する", async () => {
      const html = `
        <html>
          <body>
            <div class="main_text">
              <em>これは強調テキストです。</em>この部分は強調されていません。<br />
              これは<strong>太字</strong>テキストが含まれる段落です。<br />
              <div style="text-align: right">
                これは右寄せの段落です。
              </div>
            </div>
          </body>
        </html>
      `;
      const htmlProvider = vi.fn().mockResolvedValue(html);
      const instance = await AozoraBunkoHtml.read(htmlProvider);

      const bookContent = new BookContent();
      instance.convertToBookContent({ bookContent });

      expect(bookContent.contents.length).toBe(1);
      const content = bookContent.contents[0];
      expect(content.includes("<em>これは強調テキストです。</em>")).toBe(true);
      expect(content.includes("<strong>太字</strong>")).toBe(true);
      expect(content.includes("これは右寄せの段落です")).toBe(true);
    });

    it("入れ子になったdivを正しく処理する", async () => {
      const html = `
        <html>
          <body>
            <div class="main_text">
              これは通常の段落です。<br />
              <div class="jisage_1" style="margin-left: 1em">
                <div style="font-style: italic;">
                  これは入れ子になった字下げとイタリック段落です。
                </div>
              </div>
              これは通常の段落の続きです。
            </div>
          </body>
        </html>
      `;
      const htmlProvider = vi.fn().mockResolvedValue(html);
      const instance = await AozoraBunkoHtml.read(htmlProvider);

      const bookContent = new BookContent();
      instance.convertToBookContent({ bookContent });

      expect(bookContent.contents.length).toBe(1);
      const content = bookContent.contents[0];
      expect(content.includes("これは通常の段落です。")).toBe(true);
      expect(content.includes("これは入れ子になった字下げとイタリック段落です。")).toBe(true);
      expect(content.includes("これは通常の段落の続きです。")).toBe(true);
    });
  });
});
