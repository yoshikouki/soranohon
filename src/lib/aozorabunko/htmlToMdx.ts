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
 * テキスト内の漢字にプレースホルダー付きのrubyタグを追加する
 * 既存のrubyタグは保持する
 * @param text 処理するテキスト
 * @returns rubyタグが追加されたテキスト
 */
export function addPlaceholderRubyToKanji(text: string): string {
  // テキストがなければ空文字を返す
  if (!text) {
    return "";
  }

  // まず既存のrubyタグを一時的に置換して保護する
  // これには従来の<ruby>タグに加えて、複雑な<rb>や<rp>を含むタグも対象とする
  const rubyTags: string[] = [];

  // 従来のrubyタグ（<ruby>漢字<rt>かんじ</rt></ruby>形式）と複雑なrubyタグ（<ruby><rb>漢</rb><rp>形式）の両方を対象とした正規表現
  const rubyTagRegex = /<ruby>(?:[^<]*|<(?!\/ruby>)[^>]*>)*<\/ruby>/gs;

  // 既存のrubyタグを見つけて配列に保存し、プレースホルダーに置き換える
  let protectedText = text.replace(rubyTagRegex, (match) => {
    const placeholder = `__RUBY_TAG_${rubyTags.length}__`;
    rubyTags.push(match);
    return placeholder;
  });

  // 漢字に対する正規表現（連続した漢字をグループとして処理）
  const kanjiRegex = /[\p{Script=Han}々]+/gu;

  // 漢字をrubyタグで囲む
  protectedText = protectedText.replace(kanjiRegex, (kanji) => {
    return `<ruby>${kanji}<rt>{{required_ruby}}</rt></ruby>`;
  });

  // プレースホルダーを元のrubyタグに戻す
  const finalText = protectedText.replace(/__RUBY_TAG_(\d+)__/g, (_, index) => {
    return rubyTags[parseInt(index)];
  });

  return finalText;
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
 * テキスト内の先頭の全角スペースを削除する
 * @param text 処理するテキスト
 * @returns 全角スペースが削除されたテキスト
 */
export function removeLeadingFullWidthSpace(text: string): string {
  // テキストがなければ空文字を返す
  if (!text) {
    return "";
  }

  // 行頭の全角スペース「　」を削除
  return text.replace(/^　+/g, "");
}

/**
 * 青空文庫HTMLの.main_text部分をMDXに変換する
 * @param html 青空文庫HTML文字列
 * @param removeFullWidthSpace 先頭の全角スペースを削除するかどうか（デフォルト: true）
 * @returns MDX文字列
 * @throws main_textが見つからない場合
 */
export function htmlToMdx(html: string, removeFullWidthSpace: boolean = true): string {
  const main = extractMainText(html);
  const lines = extractLines(main);
  const paragraphs = formParagraphs(lines);

  // 全角スペースを削除する場合は処理を追加
  if (removeFullWidthSpace) {
    for (let i = 0; i < paragraphs.length; i++) {
      paragraphs[i] = removeLeadingFullWidthSpace(paragraphs[i]);
    }
  }

  // 段落がない場合は空文字列を返す
  if (paragraphs.length === 0) {
    return "";
  }

  return paragraphs.join("\n\n") + "\n";
}

/**
 * MDXテキストに漢字へのルビプレースホルダータグを追加する
 * @param mdx MDXテキスト
 * @returns ルビプレースホルダータグが追加されたMDXテキスト
 */
export function addRubyTagsToMdx(mdx: string): string {
  return addPlaceholderRubyToKanji(mdx);
}

/**
 * 青空文庫HTMLをMDXに変換し、オプションでルビプレースホルダーを追加する（後方互換性のため）
 * @param html 青空文庫HTML文字列
 * @param addRubyPlaceholder 漢字にプレースホルダー付きrubyタグを追加するかどうか
 * @param keepFullWidthSpace 先頭の全角スペースを保持するかどうか（デフォルト: 削除する）
 * @returns MDX文字列
 * @throws main_textが見つからない場合
 * @deprecated 代わりに htmlToMdx() と addRubyTagsToMdx() を組み合わせて使用してください
 */
export function convertHtmlToMdxWithRuby(
  html: string,
  addRubyPlaceholder: boolean = false,
  keepFullWidthSpace: boolean = false,
): string {
  const mdx = htmlToMdx(html, !keepFullWidthSpace);
  return addRubyPlaceholder ? addRubyTagsToMdx(mdx) : mdx;
}
