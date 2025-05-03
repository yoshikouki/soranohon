import * as cheerio from "cheerio";

/**
 * 青空文庫HTMLから.main_text要素を抽出する
 * @param html 青空文庫HTML文字列
 * @returns cheerio.Cheerio .main_text要素
 * @throws main_textが見つからない場合
 */
export function extractMainText(html: string): cheerio.Cheerio {
  const $ = cheerio.load(html);
  const main = $(".main_text");

  if (!main.length) {
    throw new Error("main_text div not found");
  }

  return main;
}

/**
 * main_text要素から行を抽出する
 * @param main .main_text要素
 * @returns 行の配列
 */
export function extractLines(main: cheerio.Cheerio): string[] {
  const $ = cheerio.load("");
  const lines: string[] = [];
  let prevIsBr = false;

  main.contents().each((_, el) => {
    // テキストノードの処理
    if (el.type === "text") {
      const text = $(el)
        .text()
        .replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, "");
      if (text.length === 0) return;

      lines.push(text);
      prevIsBr = false;
      return;
    }

    // タグでない要素はスキップ
    if (el.type !== "tag") return;

    // brタグの処理
    if (el.name === "br") {
      if (prevIsBr) return; // 直前が<br />ならスキップ

      lines.push("<br />");
      prevIsBr = true;
      return;
    }

    // その他のタグ（ルビやemなど）の処理
    let html = $.html(el).replace(/class=/g, "className=");

    if (el.name === "ruby") {
      const rbContent = $(el).find("rb").text();
      const rtContent = $(el).find("rt").text();
      if (rbContent && rtContent) {
        html = `<ruby>${rbContent}<rt>${rtContent}</rt></ruby>`;
      }
    }

    if (html.trim().length === 0) return;

    lines.push(html.trim());
    prevIsBr = false;
  });

  // 先頭・末尾の<br />や空白行を除去
  while (lines.length && lines[0] === "<br />") lines.shift();
  while (lines.length && lines[lines.length - 1] === "<br />") lines.pop();

  return lines;
}

/**
 * 行から段落を構成する
 * @param lines 行の配列
 * @returns 段落の配列
 */
export function formParagraphs(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const isNewParagraphStart = /^　|^「|^（/.test(line);

    // 新しい段落の開始と、現在の段落が存在する場合
    if (isNewParagraphStart && current.length > 0) {
      // 段落の最後の<br />を削除
      removeTrailingBreaks(current);
      paragraphs.push(current.join(""));
      current = [];
    }

    current.push(line);
  }

  // 最後の段落を処理
  if (current.length > 0) {
    removeTrailingBreaks(current);
    paragraphs.push(current.join(""));
  }

  return paragraphs;
}

/**
 * 配列から末尾の<br />を削除する
 * @param lines 行の配列
 */
export function removeTrailingBreaks(lines: string[]): void {
  while (lines.length > 0 && lines[lines.length - 1] === "<br />") {
    lines.pop();
  }
}

/**
 * 青空文庫HTMLの.main_text部分をMDXに変換する
 * @param html 青空文庫HTML文字列
 * @returns MDX文字列
 * @throws main_textが見つからない場合
 */
export function htmlToMdx(html: string): string {
  const main = extractMainText(html);
  const lines = extractLines(main);
  const paragraphs = formParagraphs(lines);
  return paragraphs.join("\n\n");
}
