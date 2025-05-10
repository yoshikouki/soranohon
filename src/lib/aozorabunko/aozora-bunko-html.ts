import * as cheerio from "cheerio";
import * as path from "path";
import { BookContent } from "@/features/book-content/core";

// インターフェース定義
export interface BookMeta {
  id: string;
  title: string;
  creator: string;
  translator?: string;
  bibliographyRaw: string;
}

export class AozoraBunkoHtml {
  private readonly html: string;
  private readonly mainText: cheerio.Cheerio;
  private readonly $: cheerio.CheerioAPI;

  private constructor(html: string) {
    this.html = html;
    this.$ = cheerio.load(html);
    this.mainText = this.extractMainText();
  }

  // ファクトリーメソッド
  static async read(htmlProvider: () => Promise<string>): Promise<AozoraBunkoHtml> {
    const html = await htmlProvider();
    return new AozoraBunkoHtml(html);
  }

  // メタデータ抽出
  extractBookMeta(htmlPath?: string): BookMeta {
    // ID はパスから取得するか、クラス内で生成する
    const id = htmlPath ? path.basename(htmlPath, ".html") : "";
    const title =
      this.$("h1.title").text() || this.$('meta[name="DC.Title"]').attr("content") || "";
    const creator =
      this.$("h2.author").text() || this.$('meta[name="DC.Creator"]').attr("content") || "";
    const translator = this.$("h2.translator").text() || undefined;
    const bibliographyRaw = this.$(".bibliographical_information")
      .text()
      .split(/\r?\n/)
      .map((line) => line.trim())
      .join("\\n")
      .replace(/^(\\n)+/, "")
      .replace(/(\\n)+$/, "");

    return {
      id,
      title,
      creator,
      translator,
      bibliographyRaw,
    };
  }

  // BookContentへの変換
  convertToBookContent(options: {
    bookContent: BookContent;
    existingRubyTags?: Map<string, string[]>;
  }): void {
    const { bookContent, existingRubyTags } = options;
    const lines = this.extractLines();
    const paragraphs = this.formParagraphs(lines);

    // BookContentに追加
    for (const paragraph of paragraphs) {
      bookContent.addParagraph(paragraph);
    }
  }

  // mainText を抽出する
  private extractMainText(): cheerio.Cheerio {
    const main = this.$(".main_text");

    if (!main.length) {
      throw new Error("main_text div not found");
    }

    return main;
  }

  // main_text要素から行を抽出する
  private extractLines(): string[] {
    const $ = cheerio.load("");
    const lines: string[] = [];
    let prevIsBr = false;

    // divタグを個別に処理するための再帰関数
    const processElement = (element: cheerio.Element) => {
      if (
        element.type === "tag" &&
        element.name === "div" &&
        this.isJisageOrStyledDiv($(element).toString())
      ) {
        // divタグの中身だけを抽出
        const children = $(element).contents();
        children.each((_, child) => {
          processElement(child);
        });
        return;
      }

      // 通常の要素処理
      if (element.type === "text") {
        const text = $(element)
          .text()
          .replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, "");
        if (text.length === 0) return;

        lines.push(text);
        prevIsBr = false;
        return;
      }

      // タグでない要素はスキップ
      if (element.type !== "tag") return;

      // brタグの処理
      if (element.name === "br") {
        if (prevIsBr) return; // 直前が<br />ならスキップ

        lines.push("<br />");
        prevIsBr = true;
        return;
      }

      // その他のタグ（ルビやemなど）の処理
      let html = $.html(element).replace(/class=/g, "className=");

      if (element.name === "ruby") {
        const rbContent = $(element).find("rb").text();
        const rtContent = $(element).find("rt").text();
        if (rbContent && rtContent) {
          html = `<ruby>${rbContent}<rt>${rtContent}</rt></ruby>`;
        }
      }

      if (html.trim().length === 0) return;

      // divタグでもjisage_1クラスを持たない場合は通常のタグとして処理
      lines.push(html.trim());
      prevIsBr = false;
    };

    // main_textの直接の子要素を処理
    this.mainText.contents().each((_, el) => {
      // jisage_1クラスを持つdivタグのみ別段落として処理
      if (
        el.type === "tag" &&
        el.name === "div" &&
        this.isJisageOrStyledDiv(this.$(el).toString())
      ) {
        // 前に<br />がなければ追加
        if (lines.length > 0 && lines[lines.length - 1] !== "<br />") {
          lines.push("<br />");
        }
        processElement(el);
      } else {
        processElement(el);
      }
    });

    // 先頭・末尾の<br />や空白行を除去
    this.removeLeadingBreaks(lines);
    this.removeTrailingBreaks(lines);

    return lines;
  }

  // 行から段落を構成する
  private formParagraphs(lines: string[]): string[] {
    const paragraphs: string[] = [];
    let current: string[] = [];

    for (const line of lines) {
      // jisage_Xクラスを持つdivタグ、またはstyle属性を持つdivタグを新しい段落として扱う
      const isJisageDiv = this.isJisageOrStyledDiv(line);

      // 引用符「」の中にあるbrと全角スペースは新しい段落とみなさない
      const isInsideQuote =
        current.some((l) => l.includes("「")) &&
        !current.some((l) => l.includes("」")) &&
        (line === "<br />" || line.startsWith("　"));

      const isNewParagraphStart = (/^　|^「|^（/.test(line) || isJisageDiv) && !isInsideQuote;

      // 新しい段落の開始と、現在の段落が存在する場合
      if (isNewParagraphStart && current.length > 0) {
        // 段落の最後の<br />を削除
        this.removeTrailingBreaks(current);
        paragraphs.push(current.join(""));
        current = [];
      }

      const noIndentedText = this.removeLeadingFullWidthSpace(line);
      current.push(noIndentedText);
    }

    // 最後の段落を処理
    if (current.length > 0) {
      this.removeTrailingBreaks(current);
      paragraphs.push(current.join(""));
    }

    return paragraphs;
  }

  // 指定された行が字下げまたはスタイル付きのdivタグであるかを判定する
  private isJisageOrStyledDiv(line: string): boolean {
    // class属性にjisage_Xが含まれるか、style属性が存在するかをチェック
    return /<div\s+.*?((class|className)=["\'].*?jisage_\d+.*?["\']|style=["\'].*?["\']).*?>/.test(
      line.trim(),
    );
  }

  // 配列から先頭の<br />を削除する
  private removeLeadingBreaks(lines: string[]): void {
    while (lines.length > 0 && lines[0] === "<br />") {
      lines.shift();
    }
  }

  // 配列から末尾の<br />を削除する
  private removeTrailingBreaks(lines: string[]): void {
    while (lines.length > 0 && lines[lines.length - 1] === "<br />") {
      lines.pop();
    }
  }

  // テキスト内の先頭の全角スペースを削除する
  private removeLeadingFullWidthSpace(text: string): string {
    // テキストがなければ空文字を返す
    if (!text) {
      return "";
    }

    // 行頭の全角スペース「　」を削除
    return text.replace(/^　+/g, "");
  }
}
