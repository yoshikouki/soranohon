/**
 * 段落の最初の文字に基づいてインデントすべきかどうかを判定する
 * 「」や（）、()から始まる段落はインデントしない
 */
export function shouldIndentParagraph(text: string): boolean {
  const firstChar = text.trim().charAt(0);
  return !/^[「（(]/.test(firstChar);
}
