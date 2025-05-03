import { loadDefaultJapaneseParser } from "budoux";
import React from "react";

const parser = loadDefaultJapaneseParser();

/**
 * 日本語テキストの自然な改行を実現するためのフック
 * BudouXライブラリを使用して日本語テキストを単語単位に分割し、
 * より読みやすいレイアウトを提供します
 */
export const useJapaneseLineBreak = () => {
  /**
   * テキストを単語単位に分割し、span要素で包みます
   * @param text 分割する日本語テキスト
   * @returns 分割されたテキストを含むspan要素の配列
   */
  const breakText = (text: string) => {
    return parser.parse(text).map((s) => React.createElement("span", { key: s }, s));
  };

  return {
    breakText,
  };
};
