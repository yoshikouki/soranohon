"use client";

import React from "react";
import { useJapaneseLineBreak } from "@/features/books/useJapaneseLineBreak";

interface JapaneseTextFormatterProps {
  children: React.ReactNode;
}

/**
 * 日本語テキストを読みやすく整形するコンポーネント
 * 単語単位で分割することで自然な改行を実現します
 */
export function JapaneseTextFormatter({ children }: JapaneseTextFormatterProps) {
  const { breakText } = useJapaneseLineBreak();

  // 子要素を再帰的に処理するヘルパー関数
  const processChildren = (child: React.ReactNode): React.ReactNode => {
    // 文字列の場合、日本語の改行を最適化
    if (typeof child === "string") {
      return breakText(child);
    }

    // Reactの有効な要素の場合、その子要素を再帰的に処理
    if (React.isValidElement(child)) {
      // TypeScript用に型アサーション
      const element = child as React.ReactElement<{ children?: React.ReactNode }>;

      // 子要素があれば再帰的に処理
      if (element.props.children) {
        return React.cloneElement(
          element,
          element.props,
          React.Children.map(element.props.children, processChildren),
        );
      }
    }

    // その他の場合（nullやundefined、数値など）はそのまま返す
    return child;
  };

  // 子要素の配列を処理
  if (React.Children.count(children) > 1) {
    return <>{React.Children.map(children, processChildren)}</>;
  }

  // 単一の子要素を処理
  return <>{processChildren(children)}</>;
}
