import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import * as path from "path";
import { BookContent } from "@/features/book-content/core";
import { defaultFileSystem } from "@/lib/fs";
import { logger } from "@/lib/logger";
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
  // biome-ignore lint/suspicious/noExplicitAny: cheerio.Cheerio<Element> 型が存在しないため回避策として any を使用
  private readonly mainText: any;
  private readonly $: cheerio.CheerioAPI;

  private constructor(html: string) {
    this.html = html;
    this.$ = cheerio.load(html);
    this.mainText = this.extractMainText();
  }

  static async read(htmlProvider: () => Promise<string>): Promise<AozoraBunkoHtml> {
    const html = await htmlProvider();
    return new AozoraBunkoHtml(html);
  }

  extractBookMeta(htmlPath?: string): BookMeta {
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

  convertToBookContent(options: {
    bookContent: BookContent;
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
              const originalMdx = new BookContent(content).toMdx();
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

  // biome-ignore lint/suspicious/noExplicitAny: cheerio.Cheerio<Element> 型が存在しないため回避策として any を使用
  private extractMainText(): any {
    const main = this.$(".main_text");

    if (!main.length) {
      throw new Error("main_text div not found");
    }

    return main;
  }

  private extractLines(): string[] {
    const $ = cheerio.load("");
    const lines: string[] = [];
    let prevIsBr = false;

    const processElement = (element: AnyNode) => {
      if (
        element.type === "tag" &&
        element.name === "div" &&
        this.isJisageOrStyledDiv($(element).toString())
      ) {
        const children = $(element).contents();
        children.each((_, child) => {
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

    this.mainText.contents().each((_, el) => {
      if (
        el.type === "tag" &&
        el.name === "div" &&
        this.isJisageOrStyledDiv(this.$(el).toString())
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
