import { describe, expect, it, vi } from "vitest";
import { BookContent } from "@/features/book-content/core";
import { AozoraBunkoHtml } from "./aozora-bunko-html";
import { RubyTags } from "./ruby-tags";

describe("AozoraBunkoHtml と RubyTags の連携", () => {
  const htmlWithRuby = `
    <html>
      <body>
        <div class="main_text">
          これは<ruby><rb>漢</rb><rp>（</rp><rt>かん</rt><rp>）</rp></ruby><ruby><rb>字</rb><rp>（</rp><rt>じ</rt><rp>）</rp></ruby>と<ruby>仮名<rt>かな</rt></ruby>の混在する文章です。
          <br />
          <ruby>日本<rt>にほん</rt></ruby>の<ruby>文化<rt>ぶんか</rt></ruby>について説明します。
        </div>
      </body>
    </html>
  `;

  describe("HTML読み込みからルビ処理までの連携", () => {
    it("HTMLからBookContentへの変換とRubyTagsの抽出が連携して動作する", async () => {
      // HTMLプロバイダーを準備
      const htmlProvider = vi.fn().mockResolvedValue(htmlWithRuby);
      
      // 1. HTMLからAozoraBunkoHtmlインスタンスを作成
      const aozoraBunkoHtml = await AozoraBunkoHtml.read(htmlProvider);
      
      // 2. BookContentインスタンスを作成
      const bookContent = new BookContent();
      
      // 3. HTMLをBookContentに変換
      aozoraBunkoHtml.convertToBookContent({ bookContent });
      
      // 4. BookContentからRubyTagsを抽出
      const rubyTags = RubyTags.extract(bookContent);
      
      // 結果の検証
      const rubyMap = rubyTags.getRubyMap();
      
      // RubyTagsがすべてのルビを正しく抽出できているか確認
      expect(rubyMap.size).toBe(5);
      expect(rubyMap.get("漢")).toEqual(["かん"]);
      expect(rubyMap.get("字")).toEqual(["じ"]);
      expect(rubyMap.get("仮名")).toEqual(["かな"]);
      expect(rubyMap.get("日本")).toEqual(["にほん"]);
      expect(rubyMap.get("文化")).toEqual(["ぶんか"]);
      
      // BookContentが正しく生成されているか確認
      expect(bookContent.contents.length).toBeGreaterThan(0);
      
      // 内容にルビタグが正しく含まれているか確認
      const mdx = bookContent.toMdx();
      expect(mdx).toContain("<ruby>漢<rt>かん</rt></ruby>");
      expect(mdx).toContain("<ruby>字<rt>じ</rt></ruby>");
      expect(mdx).toContain("<ruby>仮名<rt>かな</rt></ruby>");
      expect(mdx).toContain("<ruby>日本<rt>にほん</rt></ruby>");
      expect(mdx).toContain("<ruby>文化<rt>ぶんか</rt></ruby>");
    });

    it("ルビマップを使用して新しいテキストにルビを追加できる", async () => {
      // HTMLプロバイダーを準備
      const htmlProvider = vi.fn().mockResolvedValue(htmlWithRuby);
      
      // 1. HTMLからAozoraBunkoHtmlインスタンスを作成
      const aozoraBunkoHtml = await AozoraBunkoHtml.read(htmlProvider);
      
      // 2. BookContentインスタンスを作成
      const bookContent = new BookContent();
      
      // 3. HTMLをBookContentに変換
      aozoraBunkoHtml.convertToBookContent({ bookContent });
      
      // 4. BookContentからRubyTagsを抽出
      const rubyTags = RubyTags.extract(bookContent);
      
      // 5. 新しいテキストにルビを追加
      const newText = "漢字と日本語の勉強";
      const result = rubyTags.addRubyTagsWithPreservation(newText);
      
      // 結果の検証
      expect(result).toContain("<ruby>漢<rt>かん</rt></ruby>");
      expect(result).toContain("<ruby>字<rt>じ</rt></ruby>");
      
      // "日本"は個別の漢字としてルビが抽出されていて、"日本"という複合漢字としては登録されていない
      expect(result).not.toContain("<ruby>日本<rt>にほん</rt></ruby>");
      expect(result).toContain("<ruby>日本語<rt>{{required_ruby}}</rt></ruby>");
      
      // ルビマップに存在しない漢字にはプレースホルダーが使用される
      expect(result).toContain("<ruby>勉強<rt>{{required_ruby}}</rt></ruby>");
    });

    it("漢字を検出してルビプレースホルダーを適用できる", async () => {
      // 1. BookContentを作成
      const bookContent = new BookContent();
      
      // 2. RubyTagsのインスタンスを作成
      const rubyTags = new RubyTags();
      
      // 3. プレーンテキストに漢字検出とルビ追加
      const plainText = "漢字と日本語";
      const result = rubyTags.addPlaceholderRubyToKanji(plainText);
      
      // 結果の検証 - すべての漢字にプレースホルダーが付く
      expect(result).toContain("<ruby>漢字<rt>{{required_ruby}}</rt></ruby>");
      expect(result).toContain("<ruby>日本語<rt>{{required_ruby}}</rt></ruby>");
      // "と"は漢字ではないため変換されない
      expect(result).toBe("<ruby>漢字<rt>{{required_ruby}}</rt></ruby>と<ruby>日本語<rt>{{required_ruby}}</rt></ruby>");
    });
  });

  describe("複雑なケースの処理", () => {
    it("混在するHTML要素と複数種類のルビが正しく処理される", async () => {
      const complexHtml = `
        <html>
          <body>
            <div class="main_text">
              <p>
                これは<em><ruby>強調<rt>きょうちょう</rt></ruby></em>されたテキストと
                <div class="jisage_1" style="margin-left: 1em">
                  <ruby><rb>字</rb><rp>（</rp><rt>じ</rt><rp>）</rp></ruby><ruby><rb>下</rb><rp>（</rp><rt>さ</rt><rp>）</rp></ruby><ruby><rb>げ</rb><rp>（</rp><rt>げ</rt><rp>）</rp></ruby>された
                  <ruby>漢字<rt>かんじ</rt></ruby>
                </div>
                を含んでいます。
              </p>
            </div>
          </body>
        </html>
      `;
      
      // HTMLプロバイダーを準備
      const htmlProvider = vi.fn().mockResolvedValue(complexHtml);
      
      // 1. HTMLからAozoraBunkoHtmlインスタンスを作成
      const aozoraBunkoHtml = await AozoraBunkoHtml.read(htmlProvider);
      
      // 2. BookContentインスタンスを作成し、HTMLを変換
      const bookContent = new BookContent();
      aozoraBunkoHtml.convertToBookContent({ bookContent });
      
      // 3. BookContentからRubyTagsを抽出
      const rubyTags = RubyTags.extract(bookContent);
      
      // 結果の検証
      const rubyMap = rubyTags.getRubyMap();
      
      // すべての異なるタイプのルビが抽出されているか確認
      expect(rubyMap.has("強調")).toBe(true);
      expect(rubyMap.has("字")).toBe(true);
      expect(rubyMap.has("下")).toBe(true);
      expect(rubyMap.has("げ")).toBe(true);
      expect(rubyMap.has("漢字")).toBe(true);
      
      // bookContentとrubyTagsの両方が期待通りのコンテンツを持っているか確認
      const mdx = bookContent.toMdx();
      expect(mdx).toContain("<ruby>強調<rt>きょうちょう</rt></ruby>");
      expect(mdx).toContain("<ruby>字<rt>じ</rt></ruby>");
      expect(mdx).toContain("<ruby>下<rt>さ</rt></ruby>");
      expect(mdx).toContain("<ruby>げ<rt>げ</rt></ruby>");
      expect(mdx).toContain("<ruby>漢字<rt>かんじ</rt></ruby>");
    });
  });
});