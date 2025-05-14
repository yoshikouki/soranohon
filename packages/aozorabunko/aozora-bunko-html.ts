import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import * as path from "path";
import { defaultFileSystem } from "../../src/lib/fs";
import { logger } from "../../src/lib/logger";
import { BookContentInterface, SimpleBookContent } from "./book-content-interface";
import { RubyTags } from "./ruby-tags";

export interface BookMeta {
  id: string;
  title: string;
  creator: string;
  translator?: string;
  bibliographyRaw: string;
}

export class AozoraBunkoHtml {
  private readonly html: string;

  private constructor(html: string) {
    this.html = html;
    // コンストラクタでmain_text要素の存在を確認
    const $ = cheerio.load(html);
    const mainText = $(".main_text");
    if (!mainText.length) {
      throw new Error("main_text div not found");
    }
  }

  static async read(htmlProvider: () => Promise<string>): Promise<AozoraBunkoHtml> {
    const html = await htmlProvider();
    return new AozoraBunkoHtml(html);
  }

  extractBookMeta(htmlPath?: string): BookMeta {
    const $ = cheerio.load(this.html);
    const id = htmlPath ? path.basename(htmlPath, ".html") : "";
    const title = $("h1.title").text() || $('meta[name="DC.Title"]').attr("content") || "";
    const creator = $("h2.author").text() || $('meta[name="DC.Creator"]').attr("content") || "";
    const translator = $("h2.translator").text() || undefined;
    const bibliographyRaw = $(".bibliographical_information")
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

  convertToBookContent(options: {
    bookContent: BookContentInterface;
    existingRubyTags?: RubyTags;
  }): void {
    const { bookContent, existingRubyTags } = options;
    const lines = this.extractLines();
    const paragraphs = this.formParagraphs(lines);

    // 画像タグの保持のために既存のコンテンツから抽出
    let imageTagContents: string[] = [];
    if (existingRubyTags) {
      // ルビがある場合は、元のMDXから画像タグを収集する
      try {
        // リファクタリング前のオリジナルMDXから画像タグを抽出
        const imageTags: string[] = [];
        const bookIdMatch = bookContent.contents[0]?.match(/\d+_\d+/);
        const bookId = bookIdMatch?.[0] || "";
        if (bookId) {
          const originalMdxPath = `src/books/${bookId}.mdx`;
          try {
            if (defaultFileSystem.existsSync(originalMdxPath)) {
              const content = defaultFileSystem.readFileSync(originalMdxPath, "utf-8");
              const originalMdx = new SimpleBookContent(content).toMdx();
              const imageTagRegex = /!\[.*?\]\(.*?\)/g;
              const matches = originalMdx.match(imageTagRegex);
              if (matches) {
                for (const match of matches) {
                  imageTags.push(match);
                }
              }
            }
          } catch (e) {
            // ファイルが存在しないか読み込みエラー（新規の場合）
            logger.error(`Failed to read original MDX file: ${originalMdxPath}`, e);
          }
        }

        if (imageTags.length > 0) {
          imageTagContents = imageTags;
        }
      } catch (_e) {
        // 何もしない
      }
    }

    // 段落ごとにHTMLを処理
    for (const paragraph of paragraphs) {
      bookContent.addParagraph(paragraph);
    }

    // 既存のルビタグがある場合は、変換後のコンテンツに適用する
    if (existingRubyTags) {
      const mdx = bookContent.toMdx();
      const mdxWithRuby = existingRubyTags.addRubyTagsWithPreservation(mdx);

      // BookContentを空にしてルビ適用後のコンテンツで再構築
      bookContent.contents = [];

      // 画像タグがあれば最初に追加
      if (imageTagContents.length > 0) {
        for (const imageTag of imageTagContents) {
          bookContent.addParagraph(imageTag);
        }
      }

      // ルビを適用したコンテンツを追加
      const paragraphsWithRuby = mdxWithRuby.split("\n\n");
      for (const p of paragraphsWithRuby) {
        if (p.trim()) {
          bookContent.addParagraph(p);
        }
      }
    }
  }

  private extractLines(): string[] {
    const $ = cheerio.load(this.html);
    const lines: string[] = [];
    let prevIsBr = false;

    const processElement = (element: AnyNode) => {
      if (
        element.type === "tag" &&
        element.name === "div" &&
        this.isJisageOrStyledDiv($(element).toString())
      ) {
        const children = $(element).contents();
        children.each((_, child: AnyNode) => {
          processElement(child);
        });
        return;
      }

      if (element.type === "text") {
        const text = $(element)
          .text()
          .replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, "");
        if (text.length === 0) return;

        lines.push(text);
        prevIsBr = false;
        return;
      }

      if (element.type !== "tag") return;

      if (element.name === "br") {
        if (prevIsBr) return; // 直前が<br />ならスキップ

        lines.push("<br />");
        prevIsBr = true;
        return;
      }

      let html = $.html(element).replace(/class=/g, "className=");

      if (element.name === "ruby") {
        const rbContent = $(element).find("rb").text();
        const rtContent = $(element).find("rt").text();
        if (rbContent && rtContent) {
          html = `<ruby>${rbContent}<rt>${rtContent}</rt></ruby>`;
        }
      }

      if (html.trim().length === 0) return;

      lines.push(html.trim());
      prevIsBr = false;
    };

    const mainText = $(".main_text");
    mainText.contents().each((_, el: AnyNode) => {
      if (
        el.type === "tag" &&
        el.name === "div" &&
        this.isJisageOrStyledDiv($(el).toString())
      ) {
        if (lines.length > 0 && lines[lines.length - 1] !== "<br />") {
          lines.push("<br />");
        }
        processElement(el);
      } else {
        processElement(el);
      }
    });

    this.removeLeadingBreaks(lines);
    this.removeTrailingBreaks(lines);

    return lines;
  }

  private formParagraphs(lines: string[]): string[] {
    const paragraphs: string[] = [];
    let current: string[] = [];

    for (const line of lines) {
      const isJisageDiv = this.isJisageOrStyledDiv(line);

      const isInsideQuote =
        current.some((l) => l.includes("「")) &&
        !current.some((l) => l.includes("」")) &&
        (line === "<br />" || line.startsWith("　"));

      // 改行タグの後になし領域がある場合を考慮 (「ゴロゴロ ガラガラ」のような詩的な表現)
      const isPoemOrSong = line.includes("<br />") && current.some((l) => l.includes("<br />"));

      const isNewParagraphStart =
        (/^　|^「|^（/.test(line) || isJisageDiv) && !isInsideQuote && !isPoemOrSong;

      if (isNewParagraphStart && current.length > 0) {
        this.removeTrailingBreaks(current);
        paragraphs.push(current.join(""));
        current = [];
      }

      const noIndentedText = this.removeLeadingFullWidthSpace(line);
      current.push(noIndentedText);
    }

    if (current.length > 0) {
      this.removeTrailingBreaks(current);
      paragraphs.push(current.join(""));
    }

    return paragraphs;
  }

  private isJisageOrStyledDiv(line: string): boolean {
    return /<div\s+.*?((class|className)=["\'].*?jisage_\d+.*?["\']|style=["\'].*?["\']).*?>/.test(
      line.trim(),
    );
  }

  private removeLeadingBreaks(lines: string[]): void {
    while (lines.length > 0 && lines[0] === "<br />") {
      lines.shift();
    }
  }

  private removeTrailingBreaks(lines: string[]): void {
    while (lines.length > 0 && lines[lines.length - 1] === "<br />") {
      lines.pop();
    }
  }

  private removeLeadingFullWidthSpace(text: string): string {
    if (!text) {
      return "";
    }

    return text.replace(/^　+/g, "");
  }
}
