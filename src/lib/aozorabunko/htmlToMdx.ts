import * as cheerio from "cheerio";

/**
 * 青空文庫HTMLの.main_text部分をMDXに変換する
 * @param html 青空文庫HTML文字列
 * @returns MDX文字列
 * @throws main_textが見つからない場合
 */
export function htmlToMdx(html: string): string {
  const $ = cheerio.load(html);
  const main = $(".main_text");
  if (!main.length) {
    throw new Error("main_text div not found");
  }
  // 子要素を順にたどり、<br>だけの行や空白行を除去しつつ連結
  let lines: string[] = [];
  main.contents().each((_, el) => {
    if (el.type === "text") {
      const text = $(el)
        .text()
        .replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, "");
      if (text.length > 0) lines.push(text);
    } else if (el.type === "tag" && el.name === "br") {
      lines.push("<br />");
    } else if (el.type === "tag") {
      // ルビやemなどのタグはHTMLとして出力
      const html = $.html(el).replace(/class=/g, "className=");
      if (html.trim().length > 0) lines.push(html.trim());
    }
  });
  // 先頭・末尾の<br />や空白行を除去
  while (lines.length && lines[0] === "<br />") lines.shift();
  while (lines.length && lines[lines.length - 1] === "<br />") lines.pop();
  // <br /> で分割した各行のうち、全角スペース（U+3000）、（、または「ではじまる行を新しい段落の起点とし、段落ごとに空行で区切る
  let paragraphs: string[] = [];
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
  return paragraphs.join("\n\n");
}
