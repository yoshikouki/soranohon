import * as cheerio from "cheerio";

/**
 * 青空文庫HTMLから.main_text要素を抽出する
 * @param html 青空文庫HTML文字列
 * @returns cheerio.Cheerio .main_text要素
 * @throws main_textが見つからない場合
 */
function extractMainText(html: string): cheerio.Cheerio {
  const $ = cheerio.load(html);
  const main = $(".main_text");
  return main;
}

/**
 * main_text要素から行を抽出する
 * @param main .main_text要素
 * @returns 行の配列
 */
function extractLines(main: cheerio.Cheerio): string[] {
  const $ = cheerio.load("");
  const lines: string[] = [];
  let prevIsBr = false;
  main.contents().each((_, el) => {
    if (el.type === "text") {
      const text = $(el)
        .text()
        .replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, "");
      if (text.length > 0) {
        lines.push(text);
        prevIsBr = false;
      }
    } else if (el.type === "tag" && el.name === "br") {
      // 直前が<br />ならスキップ
      if (!prevIsBr) {
        lines.push("<br />");
        prevIsBr = true;
      }
    } else if (el.type === "tag") {
      // ルビやemなどのタグはHTMLとして出力
      const html = $.html(el).replace(/class=/g, "className=");
      if (html.trim().length > 0) {
        lines.push(html.trim());
        prevIsBr = false;
      }
    }
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
function formParagraphs(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (/^　|^「|^（/.test(line)) {
      // 全角スペース or 「 or （で始まる
      if (current.length > 0) {
        // 段落の最後が <br /> なら削除
        while (current.length > 0 && current[current.length - 1] === "<br />") {
          current.pop();
        }
        paragraphs.push(current.join(""));
        current = [];
      }
      current.push(line);
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    while (current.length > 0 && current[current.length - 1] === "<br />") {
      current.pop();
    }
    paragraphs.push(current.join(""));
  }
  return paragraphs;
}

/**
 * 青空文庫HTMLの.main_text部分をMDXに変換する
 * @param html 青空文庫HTML文字列
 * @returns MDX文字列
 * @throws main_textが見つからない場合
 */
export function htmlToMdx(html: string): string {
  const main = extractMainText(html);
  if (!main.length) {
    throw new Error("main_text div not found");
  }
  const lines = extractLines(main);
  const paragraphs = formParagraphs(lines);
  return paragraphs.join("\n\n");
}
