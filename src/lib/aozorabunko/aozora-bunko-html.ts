import * as cheerio from "cheerio";
import * as path from "path";
import { BookContent } from "@/features/book-content/core";

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
    existingRubyTags?: Map<string, string[]>;
  }): void {
    const { bookContent } = options;
    const lines = this.extractLines();
    const paragraphs = this.formParagraphs(lines);

    for (const paragraph of paragraphs) {
      bookContent.addParagraph(paragraph);
    }
  }

  private extractMainText(): cheerio.Cheerio {
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

    const processElement = (element: cheerio.Element) => {
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

      const isNewParagraphStart = (/^　|^「|^（/.test(line) || isJisageDiv) && !isInsideQuote;

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
